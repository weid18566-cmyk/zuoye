import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";

interface AIRequest {
  provider?: "deepseek" | "openai" | "anthropic" | "ollama" | "custom";
  model?: string;
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  apiEndpoint?: string;
  apiKey?: string;
  stream?: boolean;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AIRequest = await req.json();
    const provider = body.provider || "deepseek";

    const result = await callProvider(provider, body);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ content: "", model: "", error: `Edge Function error: ${message}` }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function callProvider(provider: string, req: AIRequest) {
  switch (provider) {
    case "deepseek":
      return callDeepSeek(req);
    case "openai":
      return callOpenAI(req);
    case "anthropic":
      return callAnthropic(req);
    case "ollama":
      return callOllama(req);
    case "custom":
      return callCustom(req);
    default:
      return callDeepSeek(req);
  }
}

async function callDeepSeek(req: AIRequest) {
  const apiKey = req.apiKey || DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DeepSeek API key not configured");

  const endpoint = (req.apiEndpoint || "https://api.deepseek.com/v1") + "/chat/completions";

  const messages = req.messages || [
    { role: "system", content: req.systemPrompt || "" },
    { role: "user", content: req.prompt || "" },
  ].filter((m) => m.content);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: req.model || "deepseek-chat",
      messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 500,
      stream: false,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`DeepSeek API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const choices = (data as { choices?: Array<{ message: { content: string } }> }).choices || [];
  const usage = (data as { usage?: { prompt_tokens: number; completion_tokens: number } }).usage;

  return {
    content: choices[0]?.message?.content || "",
    model: (data as { model?: string }).model || req.model || "",
    usage: usage ? { promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens } : undefined,
  };
}

async function callOpenAI(req: AIRequest) {
  const apiKey = req.apiKey;
  if (!apiKey) throw new Error("OpenAI API key required");

  const endpoint = (req.apiEndpoint || "https://api.openai.com/v1") + "/chat/completions";

  const messages = req.messages || [
    { role: "system", content: req.systemPrompt || "" },
    { role: "user", content: req.prompt || "" },
  ].filter((m) => m.content);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: req.model || "gpt-4o-mini",
      messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 500,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`OpenAI API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const choices = (data as { choices?: Array<{ message: { content: string } }> }).choices || [];
  return {
    content: choices[0]?.message?.content || "",
    model: (data as { model?: string }).model || req.model || "",
  };
}

async function callAnthropic(req: AIRequest) {
  const apiKey = req.apiKey;
  if (!apiKey) throw new Error("Anthropic API key required");

  const endpoint = req.apiEndpoint || "https://api.anthropic.com/v1/messages";

  const messages = (req.messages || [{ role: "user", content: req.prompt || "" }])
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: req.model || "claude-3-5-sonnet-20241022",
      max_tokens: req.maxTokens ?? 500,
      temperature: req.temperature ?? 0.7,
      system: req.systemPrompt || "",
      messages,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`Anthropic API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const content = (data as { content?: Array<{ type: string; text: string }> }).content;
  return {
    content: content?.[0]?.text || "",
    model: (data as { model?: string }).model || req.model || "",
  };
}

async function callOllama(req: AIRequest) {
  const endpoint = (req.apiEndpoint || "http://localhost:11434") + "/api/generate";

  const prompt = req.messages
    ? req.messages.map((m) => `${m.role}: ${m.content}`).join("\n")
    : req.prompt || "";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: req.model || "qwen2.5:7b",
      prompt,
      stream: false,
      options: { temperature: req.temperature ?? 0.7, num_predict: req.maxTokens ?? 500 },
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`Ollama API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  return {
    content: (data as { response?: string }).response || "",
    model: (data as { model?: string }).model || req.model || "",
  };
}

async function callCustom(req: AIRequest) {
  const apiKey = req.apiKey;
  const endpoint = req.apiEndpoint;
  if (!endpoint) throw new Error("Custom endpoint required");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: req.model || "gpt-4o-mini",
      messages: req.messages || [
        { role: "system", content: req.systemPrompt || "" },
        { role: "user", content: req.prompt || "" },
      ].filter((m) => m.content),
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 500,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`Custom API error (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const choices = (data as { choices?: Array<{ message: { content: string } }> }).choices || [];
  return {
    content: choices[0]?.message?.content || "",
    model: (data as { model?: string }).model || req.model || "",
  };
}

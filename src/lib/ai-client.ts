import type { AIConfig, AIRequest, AIResponse, AIMessage } from '@/types';

const DEFAULT_SYSTEM_PROMPT = `你是一个专门为3-8岁儿童服务的AI故事助手，名叫"童梦精灵"。请遵守以下规则：
1. 使用简单、温暖、充满童趣的中文回答
2. 回答控制在100-300字以内，适合儿童注意力时长
3. 避免任何暴力、恐怖、不适当的内容
4. 鼓励善良、勇敢、诚实等正面价值观
5. 可以用拟声词和表情符号增加趣味性 ✨🌈
6. 如果不确定答案，就诚实地说"我们一起查查书吧"`;

function buildMessages(request: AIRequest): AIMessage[] {
  const messages: AIMessage[] = [];
  if (request.systemPrompt) {
    messages.push({ role: 'system', content: request.systemPrompt });
  }
  messages.push({ role: 'user', content: request.prompt });
  return messages;
}

export function getDefaultAIConfig(): AIConfig {
  return {
    model: 'deepseek-v4-pro',
    speechRate: 0.8,
    contentFilter: true,
    maxSessionDuration: 15,
    provider: 'deepseek',
    apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY || '',
    apiEndpoint: import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy` : 'https://api.deepseek.com/v1',
    temperature: 0.7,
    maxTokens: 500,
  };
}

function getEndpoint(config: AIConfig): string {
  switch (config.provider) {
    case 'deepseek':
      return (config.apiEndpoint || 'https://api.deepseek.com/v1') + '/chat/completions';
    case 'anthropic':
      return config.apiEndpoint || 'https://api.anthropic.com/v1/messages';
    case 'ollama':
      return (config.apiEndpoint || 'http://localhost:11434') + '/api/generate';
    case 'custom':
      return config.apiEndpoint;
    default:
      return (config.apiEndpoint || 'https://api.openai.com/v1') + '/chat/completions';
  }
}

function buildHeaders(config: AIConfig): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  switch (config.provider) {
    case 'anthropic':
      headers['x-api-key'] = config.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      break;
    case 'deepseek':
    case 'openai':
    case 'custom':
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      break;
    case 'ollama':
      break;
  }
  return headers;
}

function buildBody(config: AIConfig, request: AIRequest): Record<string, unknown> {
  const temp = request.temperature ?? config.temperature;
  const tokens = request.maxTokens ?? config.maxTokens;
  const messages = request.messages?.map(m => ({
    role: m.role,
    content: m.content,
  })) || buildMessages(request);

  switch (config.provider) {
    case 'anthropic':
      return {
        model: config.model,
        max_tokens: tokens,
        temperature: temp,
        system: request.systemPrompt || DEFAULT_SYSTEM_PROMPT,
        messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
      };
    case 'ollama':
      return {
        model: config.model,
        prompt: messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        stream: false,
        options: { temperature: temp, num_predict: tokens },
      };
    default: {
      const hasSystemMsg = messages.some(m => m.role === 'system');
      return {
        model: config.model,
        messages: hasSystemMsg
          ? messages
          : [
              { role: 'system', content: request.systemPrompt || DEFAULT_SYSTEM_PROMPT },
              ...messages,
            ],
        temperature: temp,
        max_tokens: tokens,
        stream: false,
      };
    }
  }
}

function parseResponse(provider: AIConfig['provider'], data: unknown): AIResponse {
  const raw = data as Record<string, unknown>;
  switch (provider) {
    case 'anthropic': {
      const content = (raw as { content?: Array<{ type: string; text: string }> }).content;
      return {
        content: content?.[0]?.text || '',
        model: (raw.model as string) || '',
        usage: { promptTokens: 0, completionTokens: 0 },
      };
    }
    case 'ollama': {
      return {
        content: (raw.response as string) || '',
        model: (raw.model as string) || '',
      };
    }
    default: {
      const choices = (raw.choices as Array<{ message: { content: string } }>) || [];
      const usage = raw.usage as { prompt_tokens: number; completion_tokens: number } | undefined;
      return {
        content: choices[0]?.message?.content || '',
        model: (raw.model as string) || '',
        usage: usage ? { promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens } : undefined,
      };
    }
  }
}

export async function callAI(config: AIConfig, request: AIRequest): Promise<AIResponse> {
  if (!config.apiKey && config.provider !== 'ollama') {
    return { content: '', model: '', error: '请先配置API密钥' };
  }

  // 本地 Ollama 直接请求，其他通过 Supabase Edge Function 代理
  if (config.provider !== 'ollama' && import.meta.env.VITE_SUPABASE_URL) {
    return callViaEdgeFunction(config, request);
  }

  const endpoint = getEndpoint(config);
  const headers = buildHeaders(config);
  const body = buildBody(config, request);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout?.(30000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return { content: '', model: '', error: `API错误(${response.status}): ${errText.slice(0, 100)}` };
    }

    const data = await response.json();
    return parseResponse(config.provider, data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { content: '', model: '', error: '请求超时，请检查网络或API端点' };
    }
    return { content: '', model: '', error: `连接失败: ${msg}` };
  }
}

async function callViaEdgeFunction(config: AIConfig, request: AIRequest): Promise<AIResponse> {
  const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-proxy`;

  const messages = request.messages?.map(m => ({
    role: m.role,
    content: m.content,
  }));

  try {
    const response = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        provider: config.provider,
        model: config.model,
        messages,
        prompt: request.prompt,
        systemPrompt: request.systemPrompt,
        temperature: request.temperature ?? config.temperature,
        maxTokens: request.maxTokens ?? config.maxTokens,
        apiEndpoint: config.apiEndpoint,
        apiKey: config.apiKey,
      }),
      signal: AbortSignal.timeout?.(35000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return { content: '', model: '', error: `AI代理错误(${response.status}): ${errText.slice(0, 100)}` };
    }

    const data = await response.json();
    return {
      content: data.content || '',
      model: data.model || '',
      usage: data.usage,
      error: data.error,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : '未知错误';
    if (msg.includes('timeout') || msg.includes('abort')) {
      return { content: '', model: '', error: '请求超时，请检查网络' };
    }
    return { content: '', model: '', error: `Edge Function连接失败: ${msg}` };
  }
}

// ============ 高级AI功能 ============

/** 智能故事续写 */
export async function continueStory(config: AIConfig, currentContent: string, choice: string): Promise<AIResponse> {
  return callAI(config, {
    systemPrompt: `${DEFAULT_SYSTEM_PROMPT}\n你正在为小朋友续写童话故事。保持语言生动有趣，适合儿童阅读。`,
    prompt: `故事当前内容：\n${currentContent.slice(-500)}\n\n小朋友做了这个选择：${choice}\n\n请根据这个选择，续写接下来的故事情节（200-400字），要有趣且充满正能量：`,
  });
}

/** 角色对话 */
export async function chatWithCharacter(config: AIConfig, characterName: string, characterDesc: string, userMessage: string): Promise<AIResponse> {
  return callAI(config, {
    systemPrompt: `你正在扮演童话角色"${characterName}"。角色描述：${characterDesc}。请以这个角色的身份和小朋友对话，使用该角色会用的语气和词汇。回答要简短有趣（50-150字），适合3-8岁儿童。`,
    prompt: userMessage,
  });
}

/** 幼教问答 */
export async function askEducationQuestion(config: AIConfig, question: string): Promise<AIResponse> {
  return callAI(config, {
    systemPrompt: `${DEFAULT_SYSTEM_PROMPT}\n你正在回答小朋友的教育问题。用简单易懂的语言解释，可以举生活中的例子，鼓励小朋友思考和表达。`,
    prompt: question,
    maxTokens: 300,
  });
}

/** 故事生成 */
export async function generateStory(config: AIConfig, theme: string, age: number): Promise<AIResponse> {
  return callAI(config, {
    systemPrompt: `${DEFAULT_SYSTEM_PROMPT}\n你正在为${age}岁的小朋友创作一个全新的短篇童话故事。故事要有完整的开头、发展和结尾，包含一个积极的寓意。`,
    prompt: `请创作一个关于"${theme}"的短篇童话故事（300-500字），适合${age}岁儿童阅读。故事要有趣、有想象力，并包含一个正面的教训或感悟。`,
    maxTokens: 800,
  });
}

/** 内容安全检测 */
export async function checkContentSafety(config: AIConfig, content: string): Promise<{ safe: boolean; reason?: string }> {
  if (!config.contentFilter) return { safe: true };
  if (!config.apiKey && config.provider !== 'ollama') return { safe: true };

  const result = await callAI(config, {
    systemPrompt: '你是一个内容安全检测助手。判断以下儿童故事内容是否适合3-8岁儿童阅读。只回复"安全"或"不安全: 原因"。',
    prompt: `请判断以下内容是否适合3-8岁儿童：\n\n${content.slice(0, 1000)}`,
    maxTokens: 100,
    temperature: 0.1,
  });

  if (result.error) return { safe: true };
  if (result.content.includes('不安全')) {
    return { safe: false, reason: result.content.replace('不安全:', '').trim() };
  }
  return { safe: true };
}

/** 多轮对话（保持角色分离） */
export async function chatConversation(
  config: AIConfig,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string
): Promise<AIResponse> {
  return callAI(config, {
    systemPrompt: systemPrompt || DEFAULT_SYSTEM_PROMPT,
    prompt: messages[messages.length - 1]?.content || '',
    messages: [
      { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
      ...messages,
    ],
    maxTokens: config.maxTokens,
  });
}

// ============ 预置模型列表 ============

export const availableModels = [
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro', provider: 'deepseek' as const, description: 'DeepSeek旗舰模型 ⭐推荐', maxTokens: 8192 },
  { id: 'deepseek-chat', name: 'DeepSeek Chat V3', provider: 'deepseek' as const, description: 'DeepSeek对话模型', maxTokens: 8192 },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1', provider: 'deepseek' as const, description: 'DeepSeek推理增强', maxTokens: 8192 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' as const, description: 'OpenAI高性能小模型', maxTokens: 4096 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' as const, description: 'OpenAI最新旗舰模型', maxTokens: 8192 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' as const, description: 'Anthropic安全可靠的模型', maxTokens: 4096 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' as const, description: 'Anthropic快速轻量模型', maxTokens: 4096 },
  { id: 'qwen2.5:7b', name: '通义千问 2.5 7B', provider: 'ollama' as const, description: '本地运行·中文优化', maxTokens: 4096 },
  { id: 'llama3.1:8b', name: 'LLaMA 3.1 8B', provider: 'ollama' as const, description: '本地运行·Meta开源', maxTokens: 4096 },
  { id: 'deepseek-r1:8b', name: 'DeepSeek R1 8B', provider: 'ollama' as const, description: '本地运行·推理增强', maxTokens: 4096 },
];

import { useState, useRef, useEffect } from 'react';
import { useAI } from '@/hooks/useAI';
import type { AIMessage, AIConfig } from '@/types';
import { callAI } from '@/lib/ai-client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const ASSISTANT_SYSTEM_PROMPT = `你是"童梦精灵"——一个专门陪伴3-8岁小朋友的AI助手。
你的特点：
1. 像幼儿园老师一样温柔、耐心、爱鼓励
2. 能用小朋友听得懂的简单语言解释一切
3. 喜欢用"✨""🌈""🌟"等表情符号
4. 擅长回答的问题：故事推荐、识字认字、道理讲解、童谣儿歌、趣味科普
5. 遇到不会的问题就说"我们一起去问问老师吧～"
6. 每次回复控制在100-250字
7. 记住这是和小朋友对话，语气要活泼可爱！`;

const SUGGESTED_TOPICS = [
  { icon: 'auto_stories', text: '讲个有趣的故事' },
  { icon: 'school', text: '教我一个汉字' },
  { icon: 'pets', text: '小动物有什么秘密' },
  { icon: 'cloud', text: '天上为什么有云' },
  { icon: 'emoji_objects', text: '给我讲个道理' },
  { icon: 'music_note', text: '唱首童谣' },
];

let msgId = 0;

export function AIAssistantPage() {
  const { aiConfig } = useAI();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: String(++msgId), role: 'assistant',
      content: '哈喽小朋友～我是你的AI小伙伴"童梦精灵"！✨\n你可以问我任何问题——故事、认字、小知识、唱儿歌……我都会陪你一起探索！你想聊什么呢？🌈',
      timestamp: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: String(++msgId), role: 'user', content: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    if (!aiConfig.apiKey && aiConfig.provider !== 'ollama') {
      const errMsg: ChatMessage = { id: String(++msgId), role: 'assistant',
        content: '哎呀，我好像还没"睡醒"呢～😴\n\n请让爸爸妈妈在设置里帮我接上AI大脑（配置API密钥），我就能和你聊天啦！', timestamp: Date.now() };
      setMessages(prev => [...prev, errMsg]);
      setLoading(false);
      return;
    }

    const conversation = messages.concat(userMsg).map(m => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: m.content,
    }));

    const result = await callAI(aiConfig, {
      systemPrompt: ASSISTANT_SYSTEM_PROMPT,
      prompt: conversation.slice(-6).map(m => `${m.role === 'assistant' ? '童梦精灵' : '小朋友'}: ${m.content}`).join('\n\n'),
      maxTokens: 500,
    });

    const reply: ChatMessage = { id: String(++msgId), role: 'assistant',
      content: result.error ? `呜呜，我遇到了一点小麻烦～😢\n${result.error}\n待会再试一次吧！` : result.content,
      timestamp: Date.now() };
    setMessages(prev => [...prev, reply]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="min-h-screen bg-kid-bg flex flex-col pb-24">
      <div className="absolute top-0 left-0 right-0 h-40 gradient-top pointer-events-none" />

      <header className="relative z-10 px-5 pt-12 pb-4">
        <h1 className="font-title text-kid-lg text-kid-text flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-2xl">🧚</span>
          <div>
            <span>童梦精灵</span>
            <span className="block text-kid-xs text-kid-text/40 font-body font-normal">AI智能助手 — 随时陪你聊天</span>
          </div>
        </h1>
      </header>

      {/* 建议话题 */}
      {messages.length <= 1 && (
        <div className="px-5 mb-4 animate-fade-in-up">
          <p className="text-kid-xs text-kid-text/40 mb-3">你可以试试这些话题 👇</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TOPICS.map(topic => (
              <button key={topic.text} onClick={() => sendMessage(topic.text)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-kid-border shadow-sm hover:border-kid-primary/50 hover:bg-kid-primary/5 transition-all text-kid-sm text-kid-text">
                <span className="material-symbols-rounded text-kid-primary text-lg">{topic.icon}</span>
                {topic.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 消息区 */}
      <div className="flex-1 px-5 space-y-4 overflow-y-auto pt-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 animate-fade-in-up ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-gradient-to-br from-purple-400 to-pink-400' : 'bg-kid-primary/20'
            }`}>
              {msg.role === 'assistant' ? '🧚' : '👦'}
            </div>
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-kid-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'assistant'
                ? 'bg-white rounded-tl-sm shadow-sm text-kid-text'
                : 'bg-kid-primary text-white rounded-tr-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xl">🧚</div>
            <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm px-5 py-3 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-300 animate-bounce-soft" />
              <div className="w-2 h-2 rounded-full bg-purple-300 animate-bounce-soft" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-300 animate-bounce-soft" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 输入区 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-kid-border px-4 py-3 safe-area-bottom z-50">
        <div className="flex items-end gap-3 max-w-lg mx-auto">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="和童梦精灵聊聊天..."
            rows={1}
            className="flex-1 resize-none rounded-kid-lg border-2 border-kid-border px-4 py-3 text-kid-sm bg-kid-border/20 focus:outline-none focus:border-kid-primary transition-colors max-h-24"
            style={{ minHeight: 44 }}
          />
          <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
            className="w-11 h-11 rounded-full bg-kid-primary text-white flex items-center justify-center disabled:opacity-40 transition-transform active:scale-90 flex-shrink-0">
            <span className="material-symbols-rounded">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

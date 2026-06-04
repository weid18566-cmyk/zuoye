import { useState } from 'react';
import type { AIConfig, AIProvider } from '@/types';
import { availableModels, getDefaultAIConfig } from '@/lib/ai-client';

interface AISettingsProps {
  config: AIConfig;
  onUpdate: (config: Partial<AIConfig>) => void;
  onTestConnection?: () => void;
  isTesting?: boolean;
  connectionResult?: string | null;
}

const providerLabels: Record<AIProvider, string> = {
  deepseek: 'DeepSeek ⭐',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  ollama: 'Ollama(本地)',
  custom: '自定义',
};

export function AISettingsPanel({
  config, onUpdate, onTestConnection, isTesting, connectionResult,
}: AISettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const filteredModels = availableModels.filter(m => m.provider === config.provider);

  return (
    <section className="bg-white rounded-kid-lg p-6 shadow-kid space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="material-symbols-rounded text-purple-500 text-2xl">smart_toy</span>
        </div>
        <div>
          <h2 className="font-title text-kid-md text-kid-text">AI大模型接入</h2>
          <p className="text-kid-xs text-kid-text/60">连接AI为故事增添智能互动</p>
        </div>
      </div>

      {/* 服务商选择 */}
      <div>
        <label className="block text-kid-sm text-kid-text font-medium mb-2">AI服务商</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(providerLabels) as AIProvider[]).map(p => (
            <button key={p}
              onClick={() => onUpdate({ provider: p, model: availableModels.find(m => m.provider === p)?.id || config.model })}
              className={`py-3 px-4 rounded-kid-md text-kid-sm font-medium transition-all border-2 ${
                config.provider === p ? 'border-kid-primary bg-kid-primary/5 text-kid-primary' : 'border-kid-border text-kid-text/60 hover:border-kid-primary/50'
              }`}
            >
              {providerLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* 模型选择 */}
      <div>
        <label className="block text-kid-sm text-kid-text font-medium mb-2">模型</label>
        <select
          value={config.model}
          onChange={e => onUpdate({ model: e.target.value })}
          className="input-kid w-full"
        >
          {filteredModels.map(m => (
            <option key={m.id} value={m.id}>{m.name} — {m.description}</option>
          ))}
          {filteredModels.length === 0 && <option value={config.model}>手动输入: {config.model}</option>}
        </select>
        {filteredModels.length === 0 && (
          <input type="text" value={config.model} onChange={e => onUpdate({ model: e.target.value })}
            placeholder="自定义模型ID" className="input-kid w-full mt-2 text-kid-xs" />
        )}
      </div>

      {/* API密钥 */}
      {config.provider !== 'ollama' && (
        <div>
          <label className="block text-kid-sm text-kid-text font-medium mb-2">API密钥</label>
          <input type="password" value={config.apiKey}
            onChange={e => onUpdate({ apiKey: e.target.value })}
            placeholder={config.provider === 'deepseek' ? 'sk-...' : config.provider === 'openai' ? 'sk-...' : config.provider === 'anthropic' ? 'sk-ant-...' : '输入API密钥'}
            className="input-kid w-full text-kid-xs" />
          <p className="text-kid-xs text-kid-text/40 mt-1">
            {config.provider === 'deepseek' ? '在 platform.deepseek.com 获取' : config.provider === 'openai' ? '在 platform.openai.com 获取' : config.provider === 'anthropic' ? '在 console.anthropic.com 获取' : '密钥仅保存在您的浏览器中'}
          </p>
        </div>
      )}

      {/* API端点（高级） */}
      {showAdvanced && (
        <div className="space-y-4 animate-fade-in-down">
          <div>
            <label className="block text-kid-sm text-kid-text font-medium mb-2">API端点</label>
            <input type="text" value={config.apiEndpoint}
              onChange={e => onUpdate({ apiEndpoint: e.target.value })}
              placeholder="https://..." className="input-kid w-full text-kid-xs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-kid-xs text-kid-text/60 mb-1">温度 (0-2)</label>
              <input type="range" min="0" max="2" step="0.1" value={config.temperature}
                onChange={e => onUpdate({ temperature: parseFloat(e.target.value) })}
                className="w-full h-2 rounded-full bg-kid-border appearance-none cursor-pointer accent-kid-primary" />
              <span className="text-kid-xs text-kid-text/50">{config.temperature}</span>
            </div>
            <div>
              <label className="block text-kid-xs text-kid-text/60 mb-1">最大Tokens</label>
              <input type="number" min="50" max="8000" step="50" value={config.maxTokens}
                onChange={e => onUpdate({ maxTokens: parseInt(e.target.value) || 500 })}
                className="input-kid w-full text-kid-xs h-10" />
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-kid-xs text-kid-primary hover:underline flex items-center gap-1">
        <span className="material-symbols-rounded text-sm">{showAdvanced ? 'expand_less' : 'expand_more'}</span>
        {showAdvanced ? '收起高级设置' : '高级设置'}
      </button>

      {/* 测试连接 */}
      {onTestConnection && (
        <>
          <button onClick={onTestConnection} disabled={isTesting}
            className="w-full btn-secondary text-kid-sm py-3">
            {isTesting ? (
              <span className="loading-spinner w-5 h-5" />
            ) : (
              <>
                <span className="material-symbols-rounded">wifi_tethering</span>
                <span>测试连接</span>
              </>
            )}
          </button>
          {connectionResult && (
            <p className={`text-kid-xs rounded-kid-md px-4 py-2 ${
              connectionResult.includes('成功') ? 'bg-kid-primary/10 text-kid-primary' : 'bg-red-50 text-red-500'
            }`}>
              {connectionResult}
            </p>
          )}
        </>
      )}

      {/* 重置 */}
      <button onClick={() => onUpdate(getDefaultAIConfig())}
        className="text-kid-xs text-kid-text/40 hover:text-red-500 transition-colors">
        恢复默认设置
      </button>
    </section>
  );
}

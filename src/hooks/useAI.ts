import { useState, useCallback } from 'react';
import type { AIResponse } from '@/types';
import {
  callAI,
  continueStory,
  chatWithCharacter,
  askEducationQuestion,
  generateStory,
  checkContentSafety,
} from '@/lib/ai-client';
import { useAppState } from './useAppState';

export function useAI() {
  const { aiConfig, updateAIConfig } = useAppState();
  const [loading, setLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    fn: () => Promise<AIResponse>,
    onSuccess?: (r: AIResponse) => void
  ): Promise<AIResponse> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setLastResponse(result);
      if (result.error) setError(result.error);
      else onSuccess?.(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI调用失败';
      setError(msg);
      return { content: '', model: '', error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const storyContinue = useCallback((currentContent: string, choice: string, onSuccess?: (r: AIResponse) => void) => {
    return execute(() => continueStory(aiConfig, currentContent, choice), onSuccess);
  }, [execute, aiConfig]);

  const characterChat = useCallback((characterName: string, characterDesc: string, message: string, onSuccess?: (r: AIResponse) => void) => {
    return execute(() => chatWithCharacter(aiConfig, characterName, characterDesc, message), onSuccess);
  }, [execute, aiConfig]);

  const educationAsk = useCallback((question: string, onSuccess?: (r: AIResponse) => void) => {
    return execute(() => askEducationQuestion(aiConfig, question), onSuccess);
  }, [execute, aiConfig]);

  const storyGenerate = useCallback((theme: string, age: number, onSuccess?: (r: AIResponse) => void) => {
    return execute(() => generateStory(aiConfig, theme, age), onSuccess);
  }, [execute, aiConfig]);

  const safetyCheck = useCallback(async (content: string) => {
    return checkContentSafety(aiConfig, content);
  }, [aiConfig]);

  const testConnection = useCallback((overrideConfig?: typeof aiConfig) => {
    const config = overrideConfig || aiConfig;
    return execute(() => callAI(config, { prompt: '你好！请说"连接成功"四个字', maxTokens: 20 }));
  }, [execute, aiConfig]);

  return {
    loading,
    lastResponse,
    error,
    setError,
    storyContinue,
    characterChat,
    educationAsk,
    storyGenerate,
    safetyCheck,
    testConnection,
    aiConfig,
    updateAIConfig,
  };
}

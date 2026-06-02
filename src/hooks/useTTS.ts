import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTTSOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  onEnd?: () => void;
}

export function useTTS(options: UseTTSOptions = {}) {
  const { rate = 0.8, pitch = 1.1, lang = 'zh-CN', onEnd } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('当前浏览器不支持语音朗读');
      return;
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setError('当前浏览器不支持语音朗读');
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text.replace(/\n/g, '。'));
    utterance.lang = optionsRef.current.lang || lang;
    utterance.rate = optionsRef.current.rate || rate;
    utterance.pitch = optionsRef.current.pitch || pitch;

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false); setError(null); };
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false); optionsRef.current.onEnd?.(); };
    utterance.onerror = (e) => {
      if (e.error !== 'canceled') {
        setError('朗读出错，请重试');
        setIsSpeaking(false);
      }
    };
    utterance.onpause = () => setIsPaused(true);
    utterance.onresume = () => setIsPaused(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang, rate, pitch]);

  const pause = useCallback(() => {
    window.speechSynthesis?.pause();
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis?.resume();
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, []);

  const toggle = useCallback((text: string) => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isSpeaking && isPaused) {
      resume();
    } else {
      speak(text);
    }
  }, [isSpeaking, isPaused, pause, resume, speak]);

  return { isSpeaking, isPaused, error, speak, pause, resume, stop, toggle };
}

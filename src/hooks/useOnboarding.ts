import { useState, useCallback } from 'react';

const ONBOARDING_KEY = 'kidstory-onboarding-done';

export interface OnboardingStepData {
  title: string;
  content: string;
  icon?: string;
}

export const onboardingSteps: OnboardingStepData[] = [
  {
    title: '欢迎来到童梦AI童话剧场',
    content: '这是一个专为3-8岁儿童设计的AI智能互动童话平台，让孩子在故事中快乐成长！',
    icon: 'auto_awesome',
  },
  {
    title: '探索童话库',
    content: '在童话库中浏览经典童话故事，支持格林童话、安徒生童话和中国传统童话三大分类。',
    icon: 'menu_book',
  },
  {
    title: '多种视角阅读',
    content: '阅读时可以在主角、配角、旁观者三种视角间自由切换，体验不同角色的故事旅程。',
    icon: 'switch_access',
  },
  {
    title: '互动选择分支',
    content: '故事中包含多种选择分支，你的选择将影响故事走向，让每次阅读都有新体验。',
    icon: 'fork_right',
  },
  {
    title: '收藏与记录',
    content: '喜欢的故事情添加到收藏夹，系统会自动保存阅读进度，下次继续阅读无缝衔接。',
    icon: 'favorite',
  },
  {
    title: '幼教模式',
    content: '阅读结束后可进入幼教模式，学习生字和情商知识，寓教于乐。',
    icon: 'school',
  },
];

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_KEY) !== 'true';
  });
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, onboardingSteps.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
    setCurrentStep(0);
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY);
    setShowOnboarding(true);
    setCurrentStep(0);
  }, []);

  return {
    showOnboarding,
    currentStep,
    steps: onboardingSteps,
    nextStep,
    prevStep,
    completeOnboarding,
    resetOnboarding,
  };
}

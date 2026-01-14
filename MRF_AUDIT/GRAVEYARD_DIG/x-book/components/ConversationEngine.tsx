import { useState, useCallback } from 'react';
import { ChatStep, BookMetadata } from '../types';

export function useConversationEngine() {
  const [step, setStep] = useState<ChatStep>(ChatStep.LANGUAGE_SELECT);
  const [metadata, setMetadata] = useState<Partial<BookMetadata>>({});
  const [history, setHistory] = useState<ChatStep[]>([]);

  const goToStep = useCallback((newStep: ChatStep, saveHistory = true) => {
    if (saveHistory) {
      setHistory(prev => [...prev, step]);
    }
    setStep(newStep);
  }, [step]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const previousStep = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setStep(previousStep);
    }
  }, [history]);

  const updateMetadata = useCallback((updates: Partial<BookMetadata>) => {
    setMetadata(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    step,
    metadata,
    history,
    goToStep,
    goBack,
    updateMetadata,
    canGoBack: history.length > 0,
    setStep,
    setMetadata
  };
}

import { useState, useCallback } from 'react';
import {
  loadPerformanceHistory,
  updatePerformance,
  getRecommendation,
  type PerformanceSample,
  type Prediction,
} from '@/lib/simpleAdaptiveAI';

export function useSimpleAdaptiveAI() {
  const [history, setHistory] = useState(() => loadPerformanceHistory());

  // Record a performance sample (async to match interface)
  const recordPerformance = useCallback(async (sample: PerformanceSample) => {
    setHistory((prev) => updatePerformance(prev, sample));
  }, []);

  // Get next game recommendation
  const getNextRecommendation = useCallback((): Prediction => {
    return getRecommendation(history);
  }, [history]);

  // Reset history
  const reset = useCallback(() => {
    const fresh = {
      recentCorrect: [],
      categoryErrors: new Map(),
      averageReactionTime: 2000,
      currentDifficulty: 3,
    };
    setHistory(fresh);
    localStorage.removeItem('simple_adaptive_ai');
  }, []);

  return {
    currentDifficulty: history.currentDifficulty,
    focusArea: getRecommendation(history).focus,
    recordPerformance,
    getNextRecommendation,
    reset,
    isInitialized: true,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { 
  initAI, 
  updateOnlineModel, 
  predictNextDifficulty,
  serializeAI,
  deserializeAI,
  type AIModel,
  type PerformanceSample,
  type PredictionContext,
  type Prediction
} from '@/lib/adaptiveAI';

const AI_STORAGE_KEY = 'adaptive_ai_model';

export function useAdaptiveAI() {
  const [ai, setAi] = useState<AIModel | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState(3); // Start at medium
  const [focusArea, setFocusArea] = useState<string>('general');
  const [hasError, setHasError] = useState(false);

  // Initialize or load AI model
  useEffect(() => {
    const loadAI = async () => {
      try {
        // Try to load existing model from localStorage
        const stored = localStorage.getItem(AI_STORAGE_KEY);
        let model: AIModel;
        
        if (stored) {
          model = await deserializeAI(stored);
        } else {
          model = await initAI();
        }
        
        setAi(model);
        setIsInitialized(true);
        setHasError(false);
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        setHasError(true);
        setIsInitialized(true); // Still mark as initialized to allow app to work
        // App will work without AI, just with fixed difficulty
      }
    };

    loadAI();
  }, []);

  // Save AI model to localStorage
  const saveAI = useCallback(async () => {
    if (!ai || hasError) return;
    
    try {
      const serialized = await serializeAI(ai);
      localStorage.setItem(AI_STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save AI model:', error);
    }
  }, [ai, hasError]);

  // Record a performance sample and update the model
  const recordPerformance = useCallback(async (sample: PerformanceSample) => {
    if (!ai || hasError) {
      // If AI is not available, just adjust difficulty manually
      if (sample.isCorrect && sample.reactionMs < 1500) {
        setCurrentDifficulty(prev => Math.min(5, prev + 1));
      } else if (!sample.isCorrect) {
        setCurrentDifficulty(prev => Math.max(1, prev - 1));
      }
      return;
    }

    try {
      await updateOnlineModel(ai, sample);
      await saveAI();
      
      // Update current difficulty based on this sample
      const prediction = await predictNextDifficulty(ai, {
        recentCorrect: sample.isCorrect,
        reactionMs: sample.reactionMs
      });
      
      setCurrentDifficulty(prediction.difficulty);
      setFocusArea(prediction.focus);
    } catch (error) {
      console.error('Failed to record performance:', error);
    }
  }, [ai, saveAI, hasError]);

  // Get next game recommendation
  const getNextRecommendation = useCallback(async (
    recentCorrect: number,
    reactionMs: number
  ): Promise<Prediction> => {
    if (!ai || hasError) {
      return { difficulty: currentDifficulty, focus: 'general' };
    }

    try {
      const prediction = await predictNextDifficulty(ai, {
        recentCorrect,
        reactionMs
      });
      
      setCurrentDifficulty(prediction.difficulty);
      setFocusArea(prediction.focus);
      
      return prediction;
    } catch (error) {
      console.error('Failed to get recommendation:', error);
      return { difficulty: currentDifficulty, focus: focusArea };
    }
  }, [ai, currentDifficulty, focusArea, hasError]);

  // Reset AI model
  const resetAI = useCallback(async () => {
    try {
      const model = await initAI();
      setAi(model);
      setCurrentDifficulty(3);
      setFocusArea('general');
      setHasError(false);
      localStorage.removeItem(AI_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset AI:', error);
      setHasError(true);
    }
  }, []);

  return {
    isInitialized,
    currentDifficulty,
    focusArea,
    recordPerformance,
    getNextRecommendation,
    resetAI,
    ai,
    hasError,
  };
}

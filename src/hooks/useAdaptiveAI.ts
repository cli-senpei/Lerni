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
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        // Fallback: create new model
        try {
          const model = await initAI();
          setAi(model);
          setIsInitialized(true);
        } catch (fallbackError) {
          console.error('Fallback AI initialization failed:', fallbackError);
        }
      }
    };

    loadAI();
  }, []);

  // Save AI model to localStorage
  const saveAI = useCallback(async () => {
    if (!ai) return;
    
    try {
      const serialized = await serializeAI(ai);
      localStorage.setItem(AI_STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Failed to save AI model:', error);
    }
  }, [ai]);

  // Record a performance sample and update the model
  const recordPerformance = useCallback(async (sample: PerformanceSample) => {
    if (!ai) return;

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
  }, [ai, saveAI]);

  // Get next game recommendation
  const getNextRecommendation = useCallback(async (
    recentCorrect: number,
    reactionMs: number
  ): Promise<Prediction> => {
    if (!ai) {
      return { difficulty: 3, focus: 'general' };
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
  }, [ai, currentDifficulty, focusArea]);

  // Reset AI model
  const resetAI = useCallback(async () => {
    try {
      const model = await initAI();
      setAi(model);
      setCurrentDifficulty(3);
      setFocusArea('general');
      localStorage.removeItem(AI_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to reset AI:', error);
    }
  }, []);

  return {
    isInitialized,
    currentDifficulty,
    focusArea,
    recordPerformance,
    getNextRecommendation,
    resetAI,
    ai
  };
}

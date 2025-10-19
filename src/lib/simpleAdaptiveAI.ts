// Simple rule-based adaptive difficulty system (no TensorFlow needed)

export interface PerformanceSample {
  category: string;
  difficulty: number;
  isCorrect: number; // 0 or 1
  reactionMs: number;
}

export interface Prediction {
  difficulty: number;
  focus: string;
}

interface PerformanceHistory {
  recentCorrect: number[];
  categoryErrors: Map<string, number>;
  averageReactionTime: number;
  currentDifficulty: number;
}

const STORAGE_KEY = 'simple_adaptive_ai';

// Initialize or load performance history
export function loadPerformanceHistory(): PerformanceHistory {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        recentCorrect: parsed.recentCorrect || [],
        categoryErrors: new Map(Object.entries(parsed.categoryErrors || {})),
        averageReactionTime: parsed.averageReactionTime || 2000,
        currentDifficulty: parsed.currentDifficulty || 3,
      };
    }
  } catch (error) {
    console.error('Failed to load performance history:', error);
  }

  return {
    recentCorrect: [],
    categoryErrors: new Map(),
    averageReactionTime: 2000,
    currentDifficulty: 3,
  };
}

// Save performance history
export function savePerformanceHistory(history: PerformanceHistory): void {
  try {
    const data = {
      recentCorrect: history.recentCorrect,
      categoryErrors: Object.fromEntries(history.categoryErrors),
      averageReactionTime: history.averageReactionTime,
      currentDifficulty: history.currentDifficulty,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save performance history:', error);
  }
}

// Update performance based on a new sample
export function updatePerformance(
  history: PerformanceHistory,
  sample: PerformanceSample
): PerformanceHistory {
  // Update recent correct answers (keep last 10)
  const recentCorrect = [...history.recentCorrect, sample.isCorrect].slice(-10);

  // Update category errors
  const categoryErrors = new Map(history.categoryErrors);
  const currentError = categoryErrors.get(sample.category) || 0;
  categoryErrors.set(
    sample.category,
    currentError + (sample.isCorrect ? -0.5 : 1)
  );

  // Update average reaction time (rolling average)
  const averageReactionTime =
    (history.averageReactionTime * 0.7 + sample.reactionMs * 0.3);

  // Calculate new difficulty
  const correctRate = recentCorrect.reduce((a, b) => a + b, 0) / recentCorrect.length;
  const isFast = sample.reactionMs < 1200;
  
  let newDifficulty = history.currentDifficulty;
  
  // Adjust difficulty based on performance
  if (sample.isCorrect && isFast && correctRate > 0.7) {
    // Fast and accurate - increase difficulty
    newDifficulty = Math.min(5, newDifficulty + 0.5);
  } else if (!sample.isCorrect || sample.reactionMs > 3000) {
    // Incorrect or very slow - decrease difficulty
    newDifficulty = Math.max(1, newDifficulty - 0.7);
  } else if (correctRate > 0.8) {
    // Very high accuracy - slight increase
    newDifficulty = Math.min(5, newDifficulty + 0.3);
  }

  const updated = {
    recentCorrect,
    categoryErrors,
    averageReactionTime,
    currentDifficulty: Math.round(newDifficulty),
  };

  savePerformanceHistory(updated);
  return updated;
}

// Get next game recommendation
export function getRecommendation(history: PerformanceHistory): Prediction {
  // Find category with most errors
  let focusCategory = 'general';
  let maxErrors = 1.5; // threshold

  for (const [category, errors] of history.categoryErrors.entries()) {
    if (errors > maxErrors) {
      maxErrors = errors;
      focusCategory = category;
    }
  }

  return {
    difficulty: history.currentDifficulty,
    focus: focusCategory,
  };
}

// Get game category based on game type
export function getGameCategory(gameType: string): string {
  const categoryMap: Record<string, string> = {
    'baseline': 'phonics',
    'rhyme': 'rhyming',
    'phonics-pop': 'phonics',
    'word-catch': 'word-recognition',
    'letter-jump': 'letter-recognition',
    'phonics-runner': 'phonics'
  };
  
  return categoryMap[gameType] || 'general';
}

// Convert difficulty number (1-5) to difficulty string
export function getDifficultyString(difficulty: number): 'easy' | 'medium' | 'hard' {
  if (difficulty <= 2) return 'easy';
  if (difficulty <= 3) return 'medium';
  return 'hard';
}

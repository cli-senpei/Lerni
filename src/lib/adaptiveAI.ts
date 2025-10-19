// Lazy load TensorFlow to avoid bundling conflicts with React
let tf: typeof import('@tensorflow/tfjs') | null = null;

async function getTensorFlow() {
  if (!tf) {
    tf = await import('@tensorflow/tfjs');
    await tf.ready();
  }
  return tf;
}

export interface AIModel {
  model: any; // tf.Sequential
  errorMemory: Map<string, number>;
}

export interface PerformanceSample {
  category: string;
  difficulty: number;
  isCorrect: number; // 0 or 1
  reactionMs: number;
}

export interface PredictionContext {
  recentCorrect: number; // 0 or 1
  reactionMs: number;
}

export interface Prediction {
  difficulty: number;
  focus: string;
}

// Initialize the adaptive AI model
export async function initAI(): Promise<AIModel> {
  const tf = await getTensorFlow();
  
  const model = tf.sequential();
  // Inputs: [recentCorrect (0/1), reactionMs/3000, currentDifficulty/5]
  model.add(tf.layers.dense({ 
    units: 8, 
    activation: 'relu', 
    inputShape: [3] 
  }));
  model.add(tf.layers.dense({ 
    units: 1, 
    activation: 'linear' 
  })); // predicts next difficulty (float)
  
  model.compile({ 
    optimizer: tf.train.adam(0.01), 
    loss: 'meanSquaredError' 
  });

  // Keep an error counter per category (simple memory)
  const errorMemory = new Map<string, number>();

  return { model, errorMemory };
}

// Online update: train quickly on a single sample
export async function updateOnlineModel(
  ai: AIModel, 
  sample: PerformanceSample
): Promise<void> {
  const tf = await getTensorFlow();
  
  // sample: { category, difficulty, isCorrect(0/1), reactionMs }
  const x = tf.tensor2d([
    [
      sample.isCorrect, 
      Math.min(sample.reactionMs, 3000) / 3000, 
      sample.difficulty / 5
    ]
  ]);
  
  // Target: if wrong or slow -> lower difficulty slightly; if fast+correct -> raise
  const fast = sample.reactionMs < 1200;
  const target = sample.isCorrect 
    ? (fast ? Math.min(sample.difficulty + 0.4, 5) : sample.difficulty)
    : Math.max(sample.difficulty - 0.6, 1);
    
  const y = tf.tensor2d([[target]]);
  
  await ai.model.fit(x, y, { 
    epochs: 6, 
    batchSize: 1, 
    verbose: 0 
  });

  // Clean up tensors to prevent memory leaks
  x.dispose();
  y.dispose();

  // Update category error memory
  const cur = ai.errorMemory.get(sample.category) ?? 0;
  ai.errorMemory.set(sample.category, cur + (sample.isCorrect ? -0.5 : 1));
}

// Ask model for next difficulty + which category to focus
export async function predictNextDifficulty(
  ai: AIModel, 
  ctx: PredictionContext
): Promise<Prediction> {
  const tf = await getTensorFlow();
  
  const x = tf.tensor2d([
    [
      ctx.recentCorrect, 
      Math.min(ctx.reactionMs, 3000) / 3000, 
      0 // current diff unknown here, use 0
    ]
  ]);
  
  const y = ai.model.predict(x);
  const pred = (await y.data())[0];
  const nextDiff = Math.round(Math.min(5, Math.max(1, pred)));

  // Clean up tensors
  x.dispose();
  y.dispose();

  // Pick the category with highest recent error score if any > threshold
  let focus = 'general';
  let worstCat: string | null = null;
  let worstVal = 1.2; // threshold
  
  for (const [cat, val] of ai.errorMemory.entries()) {
    if (val > worstVal) { 
      worstVal = val; 
      worstCat = cat; 
    }
  }
  
  if (worstCat) focus = worstCat;

  return { difficulty: nextDiff, focus };
}

// Serialize AI model for storage
export async function serializeAI(ai: AIModel): Promise<string> {
  const tf = await getTensorFlow();
  const errorMemoryObj = Object.fromEntries(ai.errorMemory);
  
  // Get model config and weights separately
  const modelJSON = ai.model.toJSON(null, false);
  const weights = await ai.model.getWeights();
  const weightData = weights.map((w: any) => Array.from(w.dataSync()));
  
  return JSON.stringify({
    modelJSON,
    weightData,
    errorMemory: errorMemoryObj
  });
}

// Deserialize AI model from storage
export async function deserializeAI(data: string): Promise<AIModel> {
  const tf = await getTensorFlow();
  const parsed = JSON.parse(data);
  
  // Reconstruct model from JSON
  const model = await tf.models.modelFromJSON(parsed.modelJSON);
  
  // Restore weights
  if (parsed.weightData && parsed.weightData.length > 0) {
    const weights = parsed.weightData.map((data: number[]) => tf.tensor(data));
    model.setWeights(weights);
    // Clean up tensors
    weights.forEach((w: any) => w.dispose());
  }
  
  // Reconstruct error memory
  const errorMemory = new Map<string, number>(Object.entries(parsed.errorMemory));
  
  return { model, errorMemory };
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

// Utility functions for realistic timing variations

/**
 * Returns a random delay between min and max milliseconds
 * Adds natural variation to timing to feel more human-like
 */
export function getVariableDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Returns a delay based on context for more realistic timing
 */
export function getContextualDelay(context: {
  stage?: string
  messageLength?: number
  isFirstMessage?: boolean
  userResponseTime?: number
}): number {
  const { stage, messageLength = 0, isFirstMessage, userResponseTime } = context
  
  // Base delays with variation
  let minDelay: number
  let maxDelay: number
  
  // Stage-specific delays
  switch (stage) {
    case 'greeting':
      minDelay = isFirstMessage ? 1200 : 800
      maxDelay = isFirstMessage ? 2000 : 1500
      break
    case 'problem_discussion':
      minDelay = 1000
      maxDelay = 2500
      break
    case 'coding':
      minDelay = 500
      maxDelay = 1500
      break
    case 'testing':
      minDelay = 800
      maxDelay = 1800
      break
    default:
      minDelay = 800
      maxDelay = 1800
  }
  
  // Adjust based on message length (longer messages = slightly longer delay)
  const lengthAdjustment = Math.min(messageLength * 5, 500)
  
  // Mirror user's response speed somewhat (if they're quick, be quicker)
  if (userResponseTime && userResponseTime < 3000) {
    minDelay *= 0.8
    maxDelay *= 0.8
  } else if (userResponseTime && userResponseTime > 8000) {
    minDelay *= 1.2
    maxDelay *= 1.2
  }
  
  return getVariableDelay(minDelay, maxDelay) + lengthAdjustment
}

/**
 * Get variable silence detection threshold based on context
 */
export function getSilenceThreshold(stage: string, hasBeenSilentFor: number = 0): number {
  const baseThresholds: Record<string, { min: number; max: number }> = {
    greeting: { min: 1200, max: 1800 },
    problem_discussion: { min: 1500, max: 2500 },
    clarification: { min: 1300, max: 2000 },
    coding: { min: 3000, max: 7000 }, // More time when coding
    testing: { min: 1500, max: 2500 },
    optimization: { min: 2000, max: 3500 }
  }
  
  const threshold = baseThresholds[stage] || { min: 1500, max: 2500 }
  
  // Adaptive threshold - if user has been silent for a while, wait longer
  if (hasBeenSilentFor > 5000) {
    return getVariableDelay(threshold.max, threshold.max + 2000)
  }
  
  return getVariableDelay(threshold.min, threshold.max)
}

/**
 * Get a more human-like typing simulation delay
 */
export function getTypingDelay(textLength: number): number {
  // Average typing speed: 40-60 words per minute
  // Roughly 200-300 characters per minute
  const charsPerSecond = getVariableDelay(3, 5)
  const baseDelay = (textLength / charsPerSecond) * 1000
  
  // Add some thinking time
  const thinkingTime = getVariableDelay(500, 1500)
  
  // Cap at reasonable maximum
  return Math.min(baseDelay + thinkingTime, 8000)
}

/**
 * Random intervention check interval instead of fixed 90 seconds
 */
export function getInterventionCheckInterval(): number {
  // Random between 60-120 seconds
  return getVariableDelay(60000, 120000)
}

/**
 * Dynamic delay before starting code monitoring
 */
export function getCodeMonitoringDelay(): number {
  // Random between 3-6 minutes
  return getVariableDelay(180000, 360000)
}
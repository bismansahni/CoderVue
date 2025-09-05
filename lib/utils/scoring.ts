// Dynamic scoring system for more realistic evaluation

interface ScoringFactors {
  testsPassedRatio: number      // 0-1 ratio of tests passed
  codeQuality?: {
    hasEdgeCases: boolean
    hasComments: boolean
    isClean: boolean
    hasOptimalComplexity: boolean
  }
  interviewMetrics?: {
    timeToSolution: number      // milliseconds
    numberOfAttempts: number
    askedForHints: boolean
    communicationQuality: number // 0-1 scale
    approachExplanation: boolean
  }
  problemDifficulty: 'easy' | 'medium' | 'hard'
}

/**
 * Calculate dynamic score based on multiple factors
 */
export function calculateDynamicScore(factors: ScoringFactors): number {
  let baseScore = 0
  const maxScore = 100
  
  // Test passing weight: 40-60 points based on difficulty
  const testWeight = factors.problemDifficulty === 'hard' ? 60 : 
                     factors.problemDifficulty === 'medium' ? 50 : 40
  baseScore += factors.testsPassedRatio * testWeight
  
  // Code quality: up to 20 points
  if (factors.codeQuality) {
    const qualityScore = [
      factors.codeQuality.hasEdgeCases ? 5 : 0,
      factors.codeQuality.hasComments ? 3 : 0,
      factors.codeQuality.isClean ? 5 : 0,
      factors.codeQuality.hasOptimalComplexity ? 7 : 0,
    ].reduce((a, b) => a + b, 0)
    baseScore += qualityScore
  }
  
  // Interview performance: up to 20 points
  if (factors.interviewMetrics) {
    let performanceScore = 0
    
    // Time efficiency (5 points)
    const expectedTime = factors.problemDifficulty === 'hard' ? 1800000 : // 30 min
                        factors.problemDifficulty === 'medium' ? 1200000 : // 20 min
                        600000 // 10 min
    if (factors.interviewMetrics.timeToSolution < expectedTime) {
      performanceScore += 5
    } else if (factors.interviewMetrics.timeToSolution < expectedTime * 1.5) {
      performanceScore += 3
    }
    
    // Attempt efficiency (5 points)
    if (factors.interviewMetrics.numberOfAttempts === 1) {
      performanceScore += 5
    } else if (factors.interviewMetrics.numberOfAttempts <= 3) {
      performanceScore += 3
    } else if (factors.interviewMetrics.numberOfAttempts <= 5) {
      performanceScore += 1
    }
    
    // Communication (5 points)
    performanceScore += factors.interviewMetrics.communicationQuality * 5
    
    // Approach explanation (5 points)
    if (factors.interviewMetrics.approachExplanation) {
      performanceScore += 5
    }
    
    // Deduct for hints
    if (factors.interviewMetrics.askedForHints) {
      performanceScore -= 2
    }
    
    baseScore += Math.max(0, performanceScore)
  }
  
  // Add some randomness for realism (±3 points)
  const variance = (Math.random() - 0.5) * 6
  baseScore += variance
  
  // Ensure score is within bounds
  return Math.max(0, Math.min(maxScore, Math.round(baseScore)))
}

/**
 * Generate score feedback based on performance
 */
export function getScoreFeedback(score: number, difficulty: 'easy' | 'medium' | 'hard'): string {
  const adjustedScore = difficulty === 'hard' ? score + 10 :
                       difficulty === 'easy' ? score - 10 : score
  
  if (adjustedScore >= 90) {
    return [
      "Outstanding performance! You demonstrated excellent problem-solving skills.",
      "Exceptional work! Your approach was both elegant and efficient.",
      "Stellar performance! You showed mastery of the concepts.",
    ][Math.floor(Math.random() * 3)]
  } else if (adjustedScore >= 75) {
    return [
      "Strong performance! You showed good understanding of the problem.",
      "Well done! Your solution was solid with good reasoning.",
      "Good job! You demonstrated competent problem-solving abilities.",
    ][Math.floor(Math.random() * 3)]
  } else if (adjustedScore >= 60) {
    return [
      "Decent attempt. Your approach was on the right track.",
      "Fair performance. You showed understanding but could refine the execution.",
      "Reasonable effort. Consider optimizing your approach further.",
    ][Math.floor(Math.random() * 3)]
  } else if (adjustedScore >= 40) {
    return [
      "Room for improvement. Focus on understanding the core concepts better.",
      "Keep practicing. You're making progress but need more work on fundamentals.",
      "Partial success. Review the problem approach and practice similar problems.",
    ][Math.floor(Math.random() * 3)]
  } else {
    return [
      "This was challenging. Focus on breaking down problems into smaller steps.",
      "Keep working at it. Practice with easier problems to build confidence.",
      "Learning opportunity. Review fundamental concepts and try again.",
    ][Math.floor(Math.random() * 3)]
  }
}

/**
 * Calculate communication quality score from transcript
 */
export function analyzeCommunicationQuality(transcript: string): number {
  if (!transcript || transcript.length < 50) return 0.3
  
  let score = 0.5 // Base score
  
  // Check for approach explanation
  const hasApproachKeywords = /\b(approach|plan|strategy|solve|think|idea)\b/i.test(transcript)
  if (hasApproachKeywords) score += 0.15
  
  // Check for complexity analysis
  const hasComplexityAnalysis = /\b(O\(|complexity|time|space|efficient)\b/i.test(transcript)
  if (hasComplexityAnalysis) score += 0.15
  
  // Check for asking clarifying questions
  const asksQuestions = /\?/.test(transcript)
  if (asksQuestions) score += 0.1
  
  // Check for clear explanations
  const hasExplanations = /\b(because|since|therefore|so|means|will)\b/i.test(transcript)
  if (hasExplanations) score += 0.1
  
  return Math.min(1, score)
}

/**
 * Analyze code quality
 */
export function analyzeCodeQuality(code: string): {
  hasEdgeCases: boolean
  hasComments: boolean
  isClean: boolean
  hasOptimalComplexity: boolean
} {
  // Check for edge cases
  const edgeCasePatterns = [
    /if\s*\([^)]*(?:length|size|count)\s*===?\s*0/i,
    /if\s*\([^)]*(?:null|undefined|empty)/i,
    /!.*\s*\|\|\s*.*\.length\s*===?\s*0/,
    /^\s*\/\/.*edge case/im,
  ]
  const hasEdgeCases = edgeCasePatterns.some(pattern => pattern.test(code))
  
  // Check for comments
  const hasComments = /\/\/|\/\*|\*\//m.test(code)
  
  // Check code cleanliness
  const lines = code.split('\n').filter(l => l.trim())
  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length
  const hasConsistentIndentation = lines.every(line => 
    !line.trim() || /^(\s{2})*\S/.test(line) || /^\t*\S/.test(line)
  )
  const isClean = avgLineLength < 80 && hasConsistentIndentation
  
  // Simple complexity check (very basic)
  const loopCount = (code.match(/\b(for|while)\b/g) || []).length
  const nestedLoops = /\b(for|while)\b.*\n([^}]*\n)*.*\b(for|while)\b/.test(code)
  const hasOptimalComplexity = !nestedLoops || loopCount <= 2
  
  return {
    hasEdgeCases,
    hasComments,
    isClean,
    hasOptimalComplexity
  }
}
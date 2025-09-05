// Behavioral analysis for intelligent intervention system

interface CodeBehavior {
  linesOfCode: number
  hasFunction: boolean
  hasSyntaxError: boolean
  hasReturn: boolean
  hasLoop: boolean
  hasCondition: boolean
  recentChanges: number // Number of changes in last minute
  complexity: 'simple' | 'moderate' | 'complex'
}

interface UserBehavior {
  timeSinceLastCode: number // seconds
  timeSinceLastVoice: number // seconds
  codingVelocity: number // lines per minute
  isActivelyTyping: boolean
  patternType: 'steady' | 'bursts' | 'stuck' | 'thinking'
}

/**
 * Analyze code to understand progress and patterns
 */
export function analyzeCodeBehavior(currentCode: string, previousCode: string): CodeBehavior {
  const lines = currentCode.split('\n').filter(l => l.trim())
  const prevLines = previousCode.split('\n').filter(l => l.trim())
  
  // Calculate recent changes
  const recentChanges = Math.abs(lines.length - prevLines.length)
  
  // Check for various code elements
  const hasFunction = /function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*)?=>/.test(currentCode)
  const hasReturn = /return\s+/.test(currentCode)
  const hasLoop = /\b(?:for|while|do)\b/.test(currentCode)
  const hasCondition = /\b(?:if|else|switch)\b/.test(currentCode)
  
  // Simple syntax error detection
  const openBraces = (currentCode.match(/\{/g) || []).length
  const closeBraces = (currentCode.match(/\}/g) || []).length
  const openParens = (currentCode.match(/\(/g) || []).length
  const closeParens = (currentCode.match(/\)/g) || []).length
  const hasSyntaxError = openBraces !== closeBraces || openParens !== closeParens
  
  // Estimate complexity
  let complexity: 'simple' | 'moderate' | 'complex' = 'simple'
  if (lines.length > 30 || (hasLoop && hasCondition)) {
    complexity = 'complex'
  } else if (lines.length > 10 || hasFunction) {
    complexity = 'moderate'
  }
  
  return {
    linesOfCode: lines.length,
    hasFunction,
    hasSyntaxError,
    hasReturn,
    hasLoop,
    hasCondition,
    recentChanges,
    complexity
  }
}

/**
 * Analyze user behavior patterns
 */
export function analyzeUserBehavior(
  lastCodeChange: number,
  lastVoiceActivity: number,
  codeHistory: { timestamp: number; linesChanged: number }[]
): UserBehavior {
  const now = Date.now()
  const timeSinceLastCode = (now - lastCodeChange) / 1000
  const timeSinceLastVoice = (now - lastVoiceActivity) / 1000
  
  // Calculate coding velocity (lines per minute over last 5 minutes)
  const fiveMinutesAgo = now - 300000
  const recentChanges = codeHistory.filter(c => c.timestamp > fiveMinutesAgo)
  const totalLines = recentChanges.reduce((sum, c) => sum + c.linesChanged, 0)
  const codingVelocity = recentChanges.length > 0 ? (totalLines / 5) : 0
  
  // Determine if actively typing
  const isActivelyTyping = timeSinceLastCode < 10
  
  // Determine pattern type
  let patternType: 'steady' | 'bursts' | 'stuck' | 'thinking'
  if (timeSinceLastCode > 180) {
    patternType = 'stuck'
  } else if (timeSinceLastCode > 60 && timeSinceLastVoice < 30) {
    patternType = 'thinking' // Talking but not coding
  } else if (codingVelocity > 5) {
    patternType = 'steady'
  } else {
    patternType = 'bursts'
  }
  
  return {
    timeSinceLastCode,
    timeSinceLastVoice,
    codingVelocity,
    isActivelyTyping,
    patternType
  }
}

/**
 * Determine if and what type of intervention is needed
 */
export function determineIntervention(
  codeBehavior: CodeBehavior,
  userBehavior: UserBehavior,
  interventionCount: number,
  timeSinceLastIntervention: number
): { shouldIntervene: boolean; type?: string; message?: string } {
  // Minimum time between interventions based on count
  const minIntervalSeconds = interventionCount === 0 ? 240 : // 4 min for first
                             interventionCount === 1 ? 360 : // 6 min for second
                             600 // 10 min for subsequent
  
  if (timeSinceLastIntervention < minIntervalSeconds) {
    return { shouldIntervene: false }
  }
  
  // Analyze situation
  const { patternType, timeSinceLastCode, timeSinceLastVoice, isActivelyTyping } = userBehavior
  const { hasSyntaxError, hasFunction, complexity, linesOfCode } = codeBehavior
  
  // Don't interrupt if actively working
  if (isActivelyTyping) {
    return { shouldIntervene: false }
  }
  
  // Pattern-based interventions
  switch (patternType) {
    case 'stuck':
      if (timeSinceLastCode > 360 && timeSinceLastVoice > 120) {
        return {
          shouldIntervene: true,
          type: 'stuck_long',
          message: hasSyntaxError 
            ? "I see you might have a syntax issue. Need help with that?"
            : linesOfCode === 0
            ? "Need help getting started? What's your approach?"
            : "Stuck on something? Want to talk through it?"
        }
      }
      break
      
    case 'thinking':
      // User is talking but not coding - might need encouragement
      if (timeSinceLastCode > 120 && hasFunction) {
        return {
          shouldIntervene: true,
          type: 'thinking_to_action',
          message: "Good thinking. Ready to implement that approach?"
        }
      }
      break
      
    case 'steady':
    case 'bursts':
      // Check for completion milestones
      if (hasFunction && complexity === 'moderate' && timeSinceLastCode < 30) {
        // Just completed a moderate function
        if (interventionCount === 0 && timeSinceLastIntervention > 480) {
          return {
            shouldIntervene: true,
            type: 'milestone',
            message: "Looking good so far. How do you plan to test this?"
          }
        }
      }
      break
  }
  
  // Syntax error intervention (but not too often)
  if (hasSyntaxError && timeSinceLastCode > 60 && interventionCount < 2) {
    return {
      shouldIntervene: true,
      type: 'syntax_help',
      message: "Quick note - check your brackets/parentheses balance."
    }
  }
  
  // No intervention needed
  return { shouldIntervene: false }
}

/**
 * Generate contextual intervention message
 */
export function generateInterventionMessage(
  type: string,
  context: {
    problemType?: string
    hasApproach?: boolean
    linesOfCode: number
    timeInStage: number
  }
): string {
  const messages: Record<string, string[]> = {
    stuck_long: [
      "Need a nudge? What part are you thinking about?",
      "Take your time. What's the current challenge?",
      "Want to talk through where you're at?",
    ],
    thinking_to_action: [
      "Good analysis. Ready to code that up?",
      "Sounds like you have a plan. Let's see it.",
      "Makes sense. Time to implement?",
    ],
    milestone: [
      "Progress looks good. What's next?",
      "Nice work so far. How will you handle edge cases?",
      "Coming along well. Ready to test it?",
    ],
    syntax_help: [
      "Quick syntax check - brackets look balanced?",
      "Minor note - check your syntax there.",
      "Small issue with syntax - see it?",
    ],
    no_progress: [
      "How's it going? Need to discuss anything?",
      "Everything making sense so far?",
      "Where are we at with the solution?",
    ]
  }
  
  const typeMessages = messages[type] || messages.no_progress
  return typeMessages[Math.floor(Math.random() * typeMessages.length)]
}
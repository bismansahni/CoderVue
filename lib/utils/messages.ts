// Dynamic message generation for more realistic feedback

/**
 * Generate contextual success message based on performance
 */
export function getSuccessMessage(context: {
  testsTotal: number
  testsPassed: number
  executionTime?: number
  codeComplexity?: string
  attempts?: number
}): string {
  const { testsTotal, testsPassed, executionTime, attempts = 1 } = context
  
  // Perfect score variations
  if (testsPassed === testsTotal) {
    const perfectMessages = [
      "All tests passed! Great job!",
      "Perfect! All test cases are passing.",
      "Excellent work - all tests passed.",
      "Nice! Your solution passes all tests.",
      "All green! Well done.",
      "Great solution - all tests passed!",
      "Solid implementation. All tests passing.",
      "That's correct! All tests passed.",
      attempts > 1 
        ? "Good persistence - all tests now passing!"
        : "First try! All tests passed.",
    ]
    
    // Add time-based feedback if available
    if (executionTime && executionTime < 100) {
      perfectMessages.push("Fast and correct - excellent!")
      perfectMessages.push("Efficient solution! All tests passed.")
    }
    
    return perfectMessages[Math.floor(Math.random() * perfectMessages.length)]
  }
  
  // Partial success
  const percentage = Math.round((testsPassed / testsTotal) * 100)
  const partialMessages = [
    `${testsPassed}/${testsTotal} tests passed. Keep working on it!`,
    `${percentage}% there - ${testsPassed} of ${testsTotal} tests passing.`,
    `Making progress: ${testsPassed}/${testsTotal} tests passed.`,
    `${testsPassed} tests passing, ${testsTotal - testsPassed} to go.`,
    percentage >= 80 
      ? `Almost there! ${testsPassed}/${testsTotal} tests passed.`
      : `${testsPassed}/${testsTotal} tests passing. Review your logic.`,
  ]
  
  return partialMessages[Math.floor(Math.random() * partialMessages.length)]
}

/**
 * Generate contextual failure message
 */
export function getFailureMessage(context: {
  errorType?: string
  testsFailed: number
  testsTotal: number
  hasRuntimeError?: boolean
  hasSyntaxError?: boolean
}): string {
  const { errorType, testsFailed, testsTotal, hasRuntimeError, hasSyntaxError } = context
  
  if (hasSyntaxError) {
    const syntaxMessages = [
      "Syntax error detected. Check your code structure.",
      "There's a syntax issue. Review the error message.",
      "Code has syntax errors. Fix those first.",
      "Syntax error - make sure your brackets and syntax are correct.",
    ]
    return syntaxMessages[Math.floor(Math.random() * syntaxMessages.length)]
  }
  
  if (hasRuntimeError) {
    const runtimeMessages = [
      "Runtime error occurred. Check for edge cases.",
      "Code crashed during execution. Review the error.",
      "Runtime issue detected. Check your logic.",
      `Runtime error in your solution. ${testsFailed} tests affected.`,
    ]
    return runtimeMessages[Math.floor(Math.random() * runtimeMessages.length)]
  }
  
  // Logic errors
  const percentage = Math.round((testsFailed / testsTotal) * 100)
  const logicMessages = [
    `${testsFailed} tests failed. Review your approach.`,
    `${percentage}% of tests failing. Check your logic.`,
    `Some tests failed (${testsFailed}/${testsTotal}). Keep debugging.`,
    testsFailed === testsTotal
      ? "All tests failed. Let's reconsider the approach."
      : `${testsFailed} test${testsFailed > 1 ? 's' : ''} not passing yet.`,
  ]
  
  return logicMessages[Math.floor(Math.random() * logicMessages.length)]
}

/**
 * Generate hint message based on problem context
 */
export function getContextualHint(context: {
  problemType?: string
  userCode?: string
  failurePattern?: string
  timeStuck?: number
}): string {
  const { problemType, userCode = '', failurePattern, timeStuck } = context
  
  // Problem-specific hints
  const problemHints: Record<string, string[]> = {
    array: [
      "Consider edge cases like empty arrays or single elements.",
      "Are you handling array boundaries correctly?",
      "Think about the array traversal pattern you're using.",
      "Check if you're modifying the array while iterating.",
    ],
    string: [
      "Remember strings are immutable in most languages.",
      "Consider edge cases like empty strings.",
      "Are you handling character encoding correctly?",
      "Think about string manipulation efficiency.",
    ],
    'two-pointer': [
      "Make sure your pointers are moving in the right direction.",
      "Check your pointer boundary conditions.",
      "Consider when and how your pointers should meet.",
      "Are you updating both pointers correctly?",
    ],
    'sliding-window': [
      "Is your window size calculation correct?",
      "Check how you're expanding and shrinking the window.",
      "Make sure you're tracking the window state properly.",
      "Consider edge cases at the boundaries.",
    ],
    'hash-map': [
      "Are you using the right keys in your hash map?",
      "Check if you're handling collisions or duplicates.",
      "Consider the hash map initialization.",
      "Make sure you're updating the map correctly.",
    ],
  }
  
  // Analyze code patterns
  const hasLoop = /for|while/.test(userCode)
  // Check for recursive patterns (function calling itself)
  const functionName = userCode.match(/function\s+(\w+)/)?.[1]
  const hasRecursion = functionName ? new RegExp(`\\b${functionName}\\s*\\(`).test(userCode) : false
  const hasCondition = /if|else|switch/.test(userCode)
  
  // Time-based hints
  if (timeStuck && timeStuck > 300000) { // 5+ minutes
    return [
      "Take a step back and reconsider your approach.",
      "Would a different data structure help here?",
      "Try working through a simple example by hand.",
      "Consider breaking the problem into smaller pieces.",
    ][Math.floor(Math.random() * 4)]
  }
  
  // Pattern-based hints
  if (failurePattern === 'edge-cases') {
    return "Your logic looks good but check edge cases."
  }
  
  if (!hasLoop && !hasRecursion) {
    return "You might need iteration or recursion for this problem."
  }
  
  if (!hasCondition) {
    return "Consider if you need conditional logic here."
  }
  
  // Problem-specific hint
  if (problemType && problemHints[problemType]) {
    const hints = problemHints[problemType]
    return hints[Math.floor(Math.random() * hints.length)]
  }
  
  // Generic hints
  const genericHints = [
    "Think about what data structure would help you track elements efficiently.",
    "Consider the time and space complexity of your approach.",
    "Try working through the problem with a small example.",
    "What information do you need to track as you process the input?",
    "Are there any patterns in the problem you can exploit?",
  ]
  
  return genericHints[Math.floor(Math.random() * genericHints.length)]
}

/**
 * Generate interview stage transition message
 */
export function getTransitionMessage(fromStage: string, toStage: string): string {
  const transitions: Record<string, string[]> = {
    'greeting-problem': [
      "Alright, let's look at today's problem.",
      "Great! Here's what we'll work on.",
      "Perfect. Let me show you the problem.",
      "Okay, here's your challenge.",
    ],
    'problem-coding': [
      "Go ahead and start coding.",
      "Show me your implementation.",
      "Let's see the code.",
      "Time to code it up.",
    ],
    'coding-testing': [
      "Let's test your solution.",
      "Time to run the tests.",
      "Let's see if it works.",
      "Ready to test it out.",
    ],
  }
  
  const key = `${fromStage}-${toStage}`
  const messages = transitions[key] || ["Moving on..."]
  
  return messages[Math.floor(Math.random() * messages.length)]
}
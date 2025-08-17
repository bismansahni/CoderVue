import { NextRequest, NextResponse } from "next/server";

// Test cases for different problem types
const TEST_CASES: Record<string, any> = {
  "palindrome": [
    { input: "aab", expected: true, description: "Can form 'aba'" },
    { input: "code", expected: false, description: "No palindrome possible" },
    { input: "aabbcc", expected: true, description: "Can form 'abccba'" },
    { input: "abc", expected: false, description: "No palindrome possible" },
    { input: "", expected: true, description: "Empty string" },
    { input: "a", expected: true, description: "Single character" }
  ],
  "two_sum": [
    { input: [[2,7,11,15], 9], expected: [0,1], description: "Basic case" },
    { input: [[3,2,4], 6], expected: [1,2], description: "Different indices" },
    { input: [[3,3], 6], expected: [0,1], description: "Same values" }
  ],
  "default": [
    { input: "test", expected: "test", description: "Default test case" }
  ]
};

// Function to detect problem type from question
function detectProblemType(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('palindrome')) return 'palindrome';
  if (lowerQuestion.includes('two sum') || lowerQuestion.includes('two numbers')) return 'two_sum';
  
  return 'default';
}

// Function to execute Python code by converting to JS
function executePythonCode(code: string, testInput: any): { result: any, error: string | null } {
  try {
    // Extract function name from Python code
    const defMatch = code.match(/def\s+(\w+)/);
    if (!defMatch) {
      return { result: null, error: 'No function definition found' };
    }
    const functionName = defMatch[1];
    
    // Convert Python to JavaScript (basic conversion)
    let jsCode = code
      // Remove type hints from function parameters and return type
      .replace(/def\s+(\w+)\s*\((.*?)\)\s*(?:->.*?)?:/g, (match, funcName, params) => {
        // Remove type hints from parameters
        const cleanParams = params.replace(/:\s*[^,\)]+/g, '');
        return `function ${funcName}(${cleanParams}) {`;
      })
      .replace(/True/g, 'true')
      .replace(/False/g, 'false')
      .replace(/None/g, 'null')
      .replace(/elif/g, 'else if')
      .replace(/print\(/g, 'console.log(')
      .replace(/#/g, '//')
      // Convert Python dict.get() to JavaScript
      .replace(/(\w+)\.get\(([^,\)]+)(?:,\s*([^)]+))?\)/g, (match, dict, key, defaultVal) => {
        if (defaultVal) {
          return `(${dict}[${key}] !== undefined ? ${dict}[${key}] : ${defaultVal})`;
        }
        return `${dict}[${key}]`;
      })
      // Convert Python dictionary comprehension {k: v for k in ...}
      .replace(/\{([^{}]+?):\s*([^{}]+?)\s+for\s+(\w+)\s+in\s+([^{}]+?)\}/g, (match, key, value, iterVar, iterList) => {
        // Clean up the key and value expressions
        const cleanKey = key.trim();
        const cleanValue = value.trim();
        const cleanIterList = iterList.trim();
        return `Object.fromEntries(${cleanIterList}.map(${iterVar} => [${cleanKey}, ${cleanValue}]))`;
      })
      // Convert Python empty dict {} to JavaScript object
      .replace(/(\w+)\s*=\s*\{\}/g, '$1 = {}')
      // Convert Python for loops
      .replace(/for\s+(\w+)\s+in\s+(\w+):/g, 'for (let $1 of $2) {')
      // Ensure return statements work
      .replace(/^\s*return\s+/gm, '    return ')
      // Python string join with comprehension - handle ''.join(...)
      .replace(/['"](['"]?)\.join\((.*?)\)/g, (match, quote, inner) => {
        // Handle list comprehensions like [s[i] for i in indices]
        const listCompMatch = inner.match(/\[(.+?)\s+for\s+(\w+)\s+in\s+(\w+)\]/);
        if (listCompMatch) {
          const expr = listCompMatch[1].trim();
          const iterVar = listCompMatch[2];
          const iterList = listCompMatch[3];
          return `${iterList}.map(${iterVar} => ${expr}).join('')`;
        }
        // Handle generator expressions like (s[i] for i in indices)  
        const genMatch = inner.match(/\((.+?)\s+for\s+(\w+)\s+in\s+(\w+)\)/);
        if (genMatch) {
          const expr = genMatch[1].trim();
          const iterVar = genMatch[2];
          const iterList = genMatch[3];
          return `${iterList}.map(${iterVar} => ${expr}).join('')`;
        }
        // Handle direct iterables
        const directMatch = inner.match(/^(\w+)$/);
        if (directMatch) {
          return `${directMatch[1]}.join('')`;
        }
        return match;
      })
      // Handle range function
      .replace(/range\(([^)]+)\)/g, 'Array.from({length: $1}, (_, i) => i)')
      // Handle len function
      .replace(/len\(([^)]+)\)/g, '$1.length')
      // Handle list slicing
      .replace(/(\w+)\[(\d+):(\d+)\]/g, '$1.slice($2, $3)')
      .replace(/(\w+)\[(\d+):\]/g, '$1.slice($2)')
      .replace(/(\w+)\[:(\d+)\]/g, '$1.slice(0, $2)');
    
    // Add closing braces based on indentation
    const lines = jsCode.split('\n');
    let result = [];
    let indentStack = [0];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const indent = line.search(/\S/);
      
      if (indent === -1) continue; // Skip empty lines
      
      // Close blocks when indentation decreases
      while (indentStack.length > 1 && indent < indentStack[indentStack.length - 1]) {
        indentStack.pop();
        result.push(' '.repeat(indentStack[indentStack.length - 1]) + '}');
      }
      
      result.push(line);
      
      // Track new blocks
      if (line.includes('{')) {
        indentStack.push(indent + 2);
      }
    }
    
    // Close remaining blocks
    while (indentStack.length > 1) {
      indentStack.pop();
      result.push('}');
    }
    
    jsCode = result.join('\n');
    
    // Log the converted code for debugging
    console.log('Converted Python to JavaScript:');
    console.log(jsCode);
    
    // Execute the converted code
    const wrappedCode = `
      ${jsCode}
      
      // Call the function with test input
      if (typeof ${functionName} !== 'undefined') {
        if (Array.isArray(testInput) && testInput.length > 1) {
          return ${functionName}(...testInput);
        } else {
          return ${functionName}(testInput);
        }
      } else {
        throw new Error('Function ${functionName} not found');
      }
    `;
    
    const func = new Function('testInput', wrappedCode);
    const result2 = func(testInput);
    
    return { result: result2, error: null };
  } catch (error) {
    return { 
      result: null, 
      error: error instanceof Error ? error.message : 'Python execution failed' 
    };
  }
}

// Function to execute JavaScript or Python code
function executeCode(code: string, testInput: any): { result: any, error: string | null } {
  try {
    // Check if it's Python code
    const isPython = code.includes('def ') || code.includes('import ') || code.includes('print(');
    
    if (isPython) {
      return executePythonCode(code, testInput);
    }
    
    // JavaScript execution (existing code)
    // Extract function name from code
    const functionMatch = code.match(/function\s+(\w+)/);
    const constMatch = code.match(/const\s+(\w+)\s*=/);
    const arrowMatch = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*\([^)]*\)\s*=>/);
    
    let functionName = 'solution';
    if (functionMatch) functionName = functionMatch[1];
    else if (arrowMatch) functionName = arrowMatch[1];
    else if (constMatch) functionName = constMatch[1];
    
    // Create a function from the code
    const wrappedCode = `
      ${code}
      
      // Call the function with test input
      if (typeof ${functionName} !== 'undefined') {
        if (Array.isArray(testInput) && testInput.length > 1) {
          return ${functionName}(...testInput);
        } else {
          return ${functionName}(testInput);
        }
      } else {
        throw new Error('Function ${functionName} not found');
      }
    `;
    
    // Execute with Function constructor (safer than eval but still limited)
    const func = new Function('testInput', wrappedCode);
    const result = func(testInput);
    
    return { result, error: null };
  } catch (error) {
    return { 
      result: null, 
      error: error instanceof Error ? error.message : 'Execution failed' 
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { code, question, testCases: providedTestCases } = await req.json();
    
    if (!code || !question) {
      return NextResponse.json(
        { error: "Code and question are required" },
        { status: 400 }
      );
    }
    
    // Use provided test cases if available, otherwise fall back to hardcoded ones
    let testCases = providedTestCases && providedTestCases.length > 0 
      ? providedTestCases 
      : TEST_CASES[detectProblemType(question)] || TEST_CASES.default;
    
    console.log('Running tests with:', testCases.length, 'test cases');
    console.log('Test cases source:', providedTestCases ? 'AI-generated' : 'hardcoded');
    
    // Run tests
    const results = [];
    let passedCount = 0;
    
    for (const testCase of testCases) {
      const { result, error } = executeCode(code, testCase.input);
      
      let passed = false;
      if (!error) {
        // Check if result matches expected
        if (Array.isArray(testCase.expected)) {
          passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        } else {
          passed = result === testCase.expected;
        }
      }
      
      if (passed) passedCount++;
      
      results.push({
        description: testCase.description,
        input: testCase.input,
        expected: testCase.expected,
        actual: result,
        passed,
        error
      });
    }
    
    const allPassed = passedCount === testCases.length;
    
    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: testCases.length,
        passed: passedCount,
        failed: testCases.length - passedCount,
        allPassed
      },
      message: allPassed 
        ? "All tests passed! Great job!" 
        : `${passedCount}/${testCases.length} tests passed. Keep working on it!`
    });
    
  } catch (error) {
    console.error("Error in runTests:", error);
    return NextResponse.json(
      { error: "Failed to run tests", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
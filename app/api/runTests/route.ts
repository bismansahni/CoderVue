import { NextRequest, NextResponse } from "next/server";
import { getSuccessMessage } from "@/lib/utils/messages";

// Function to execute JavaScript code only (Python runs in browser via Pyodide)
function executeCode(code: string, testInput: any): { result: any, error: string | null } {
  try {
    // JavaScript execution only
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

// API endpoint for running JavaScript tests only
// Python tests run client-side via Pyodide
export async function POST(req: NextRequest) {
  try {
    const { code, testCases: providedTestCases } = await req.json();
    
    if (!code) {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }
    
    // Validate code has actual implementation
    const trimmedCode = code.trim();
    const isJavaScript = trimmedCode.includes('function') || trimmedCode.includes('=>') || trimmedCode.includes('const');
    const isPython = trimmedCode.includes('def ') || trimmedCode.includes('return ');
    
    // Check for minimal code content
    const hasImplementation = (isJavaScript || isPython) && 
                             trimmedCode.length > 50 && 
                             (trimmedCode.includes('return') || trimmedCode.includes('console.log'));
    
    // Count non-comment lines
    const codeLines = trimmedCode
      .split('\n')
      .filter(line => {
        const stripped = line.trim();
        return stripped && 
               !stripped.startsWith('//') && 
               !stripped.startsWith('#') &&
               !stripped.startsWith('/*') &&
               !stripped.startsWith('*');
      });
    
    if (!hasImplementation || codeLines.length < 3) {
      return NextResponse.json(
        { 
          error: "Please complete your implementation before running tests",
          details: "Your code needs more implementation details",
          success: false
        },
        { status: 400 }
      );
    }
    
    // Use provided test cases (AI-generated)
    const testCases = providedTestCases || [];
    
    console.log('Running tests with:', testCases.length, 'test cases');
    
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
      message: getSuccessMessage({
        testsTotal: testCases.length,
        testsPassed: passedCount
      })
    });
    
  } catch (error) {
    console.error("Error in runTests:", error);
    return NextResponse.json(
      { error: "Failed to run tests", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
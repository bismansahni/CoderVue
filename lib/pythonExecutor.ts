// Python execution using Pyodide
export class PythonExecutor {
  private pyodide: any = null;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;

  async initialize() {
    if (this.pyodide) return;
    if (this.isLoading) {
      await this.loadPromise;
      return;
    }

    this.isLoading = true;
    this.loadPromise = this.loadPyodide();
    await this.loadPromise;
  }

  private async loadPyodide() {
    try {
      // Load Pyodide from CDN
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      // @ts-ignore
      this.pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      });

      console.log('Pyodide loaded successfully');
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async runCode(code: string, testInput: any): Promise<{ result: any; error: string | null }> {
    try {
      await this.initialize();

      // Extract function name
      const defMatch = code.match(/def\s+(\w+)/);
      if (!defMatch) {
        return { result: null, error: 'No function definition found' };
      }
      const functionName = defMatch[1];

      // Prepare the test input as Python variables
      let inputSetup = '';
      if (Array.isArray(testInput) && testInput.length > 0) {
        // Convert JavaScript arrays/values to Python
        inputSetup = testInput.map((val, idx) => {
          const pythonVal = JSON.stringify(val);
          return `arg${idx} = ${pythonVal}`;
        }).join('\n');
      }

      // Create the full Python code to execute
      const fullCode = `
${code}

# Set up the input
${inputSetup}

# Call the function
if len([${testInput.map((_, idx) => `arg${idx}`).join(', ')}]) > 0:
    result = ${functionName}(${testInput.map((_, idx) => `arg${idx}`).join(', ')})
else:
    result = ${functionName}()

# Convert result to JSON-serializable format
import json
json.dumps(result)
`;

      // Run the Python code
      const resultJson = this.pyodide.runPython(fullCode);
      const result = JSON.parse(resultJson);

      return { result, error: null };
    } catch (error: any) {
      console.error('Python execution error:', error);
      return {
        result: null,
        error: error.message || 'Python execution failed'
      };
    }
  }

  async runTests(code: string, testCases: any[]): Promise<any[]> {
    const results = [];
    
    for (const testCase of testCases) {
      const { result, error } = await this.runCode(code, testCase.input);
      
      let passed = false;
      if (!error) {
        // Check if result matches expected
        if (Array.isArray(testCase.expected)) {
          passed = JSON.stringify(result) === JSON.stringify(testCase.expected);
        } else {
          passed = result === testCase.expected;
        }
      }
      
      results.push({
        description: testCase.description,
        input: testCase.input,
        expected: testCase.expected,
        actual: result,
        passed,
        error
      });
    }
    
    return results;
  }
}

// Create a singleton instance
export const pythonExecutor = new PythonExecutor();
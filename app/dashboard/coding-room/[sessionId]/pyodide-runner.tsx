'use client'

import { useEffect, useRef, useState } from 'react'

// Declare Pyodide types
declare global {
  interface Window {
    loadPyodide: any
    pyodide: any
  }
}


export class PyodideRunner {
  private pyodide: any = null
  private isReady = false

  async initialize() {
    if (this.isReady) return true
    
    try {
      // Check if Pyodide is already loaded globally
      if (window.pyodide) {
        this.pyodide = window.pyodide
        this.isReady = true
        return true
      }

      // Dynamically load Pyodide
      if (!window.loadPyodide) {
        // Load the Pyodide script
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Pyodide'))
          document.head.appendChild(script)
        })
      }

      // Initialize Pyodide
      console.log('Calling loadPyodide...')
      this.pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
      })
      
      // Test that Pyodide works
      console.log('Testing Pyodide with simple Python code...')
      const testResult = this.pyodide.runPython('1 + 1')
      console.log('Pyodide test result:', testResult)
      
      window.pyodide = this.pyodide
      this.isReady = true
      console.log('Pyodide initialized successfully!')
      return true
    } catch (error) {
      console.error('Failed to initialize Pyodide:', error)
      return false
    }
  }

  async runTests(code: string, testCases: any[]) {
    console.log('PyodideRunner.runTests called')
    console.log('Code:', code)
    console.log('Test cases count:', testCases.length)
    
    if (!this.isReady) {
      console.log('Pyodide not ready, initializing...')
      const success = await this.initialize()
      if (!success) {
        throw new Error('Pyodide not available')
      }
    }

    const results = []
    
    // Extract function name from code
    const defMatch = code.match(/def\s+(\w+)/)
    if (!defMatch) {
      throw new Error('No Python function found in code')
    }
    const functionName = defMatch[1]
    console.log('Function name:', functionName)

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i]
      console.log(`Running test ${i + 1}:`, testCase.description)
      
      try {
        // Build the test code
        let testCode = code + '\n\n'
        
        // Handle the input arguments
        if (Array.isArray(testCase.input) && testCase.input.length > 0) {
          const args = testCase.input.map((arg: any) => JSON.stringify(arg)).join(', ')
          testCode += `result = ${functionName}(${args})\n`
          console.log('Calling function with args:', args)
        } else {
          testCode += `result = ${functionName}()\n`
        }
        
        // Convert result to JSON for retrieval
        testCode += `import json\njson.dumps(result)`
        
        console.log('Full test code:', testCode)
        
        // Run the Python code
        const resultJson = this.pyodide.runPython(testCode)
        const result = JSON.parse(resultJson)
        
        console.log('Test result:', result)
        console.log('Expected:', testCase.expected)
        
        // Check if result matches expected
        const passed = JSON.stringify(result) === JSON.stringify(testCase.expected)
        console.log('Test passed:', passed)
        
        results.push({
          description: testCase.description,
          input: testCase.input,
          expected: testCase.expected,
          actual: result,
          passed,
          error: null
        })
      } catch (error: any) {
        console.error('Test execution error:', error)
        results.push({
          description: testCase.description,
          input: testCase.input,
          expected: testCase.expected,
          actual: null,
          passed: false,
          error: error.message || 'Execution failed'
        })
      }
    }
    
    // Calculate summary
    const passedCount = results.filter(r => r.passed).length
    return {
      success: true,
      results,
      summary: {
        total: testCases.length,
        passed: passedCount,
        failed: testCases.length - passedCount,
        allPassed: passedCount === testCases.length
      },
      message: passedCount === testCases.length 
        ? "All tests passed! Great job!" 
        : `${passedCount}/${testCases.length} tests passed. Keep working on it!`
    }
  }
}

export function usePyodide() {
  const [runner, setRunner] = useState<PyodideRunner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const runnerRef = useRef<PyodideRunner | null>(null)

  useEffect(() => {
    console.log('usePyodide hook: Starting initialization')
    const initPyodide = async () => {
      try {
        const pyRunner = new PyodideRunner()
        const success = await pyRunner.initialize()
        
        if (success) {
          console.log('usePyodide hook: Pyodide ready!')
          runnerRef.current = pyRunner
          setRunner(pyRunner)
          setError(null)
        } else {
          console.log('usePyodide hook: Failed to initialize')
          setError('Failed to initialize Python runtime')
        }
      } catch (err) {
        console.error('usePyodide hook: Initialization error:', err)
        setError('Failed to load Python runtime')
      } finally {
        setLoading(false)
      }
    }

    initPyodide()
  }, [])

  return { runner, loading, error }
}
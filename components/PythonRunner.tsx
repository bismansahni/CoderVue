'use client'

import { useEffect, useState } from 'react'

interface PythonRunnerProps {
  code: string
  testCases: any[]
  onResults: (results: any) => void
}

declare global {
  interface Window {
    loadPyodide: any
    pyodide: any
  }
}

export function PythonRunner({ code, testCases, onResults }: PythonRunnerProps) {
  const [pyodide, setPyodide] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load Pyodide
  useEffect(() => {
    const loadPyodideScript = async () => {
      try {
        // Check if already loaded
        if (window.pyodide) {
          setPyodide(window.pyodide)
          setLoading(false)
          return
        }

        // Load Pyodide script
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js'
        script.async = true
        
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = reject
          document.head.appendChild(script)
        })

        // Initialize Pyodide
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        })
        
        window.pyodide = pyodideInstance
        setPyodide(pyodideInstance)
        setLoading(false)
      } catch (err) {
        console.error('Failed to load Pyodide:', err)
        setError('Failed to load Python runtime')
        setLoading(false)
      }
    }

    loadPyodideScript()
  }, [])

  // Run tests when Pyodide is ready
  useEffect(() => {
    if (!pyodide || !code || !testCases) return

    const runTests = async () => {
      const results = []
      
      for (const testCase of testCases) {
        try {
          // Extract function name
          const defMatch = code.match(/def\s+(\w+)/)
          if (!defMatch) {
            results.push({
              ...testCase,
              actual: null,
              passed: false,
              error: 'No function definition found'
            })
            continue
          }
          const functionName = defMatch[1]

          // Prepare the Python code
          let testCode = code + '\n\n'
          
          // Handle input based on whether it's an array of arguments
          if (Array.isArray(testCase.input) && testCase.input.length > 0) {
            // Convert each argument to Python
            const args = testCase.input.map((arg: any) => {
              if (typeof arg === 'string') {
                return `"${arg}"`
              } else if (Array.isArray(arg)) {
                return JSON.stringify(arg)
              } else {
                return JSON.stringify(arg)
              }
            }).join(', ')
            
            testCode += `result = ${functionName}(${args})\n`
          } else {
            testCode += `result = ${functionName}()\n`
          }
          
          testCode += `import json\njson.dumps(result)`

          // Run the test
          const resultJson = pyodide.runPython(testCode)
          const result = JSON.parse(resultJson)
          
          // Check if result matches expected
          let passed = false
          if (Array.isArray(testCase.expected)) {
            passed = JSON.stringify(result) === JSON.stringify(testCase.expected)
          } else {
            passed = result === testCase.expected
          }
          
          results.push({
            ...testCase,
            actual: result,
            passed,
            error: null
          })
        } catch (err: any) {
          console.error('Test execution error:', err)
          results.push({
            ...testCase,
            actual: null,
            passed: false,
            error: err.message || 'Execution failed'
          })
        }
      }
      
      // Calculate summary
      const passedCount = results.filter(r => r.passed).length
      const summary = {
        total: testCases.length,
        passed: passedCount,
        failed: testCases.length - passedCount,
        allPassed: passedCount === testCases.length
      }
      
      onResults({
        success: true,
        results,
        summary,
        message: summary.allPassed 
          ? "All tests passed! Great job!" 
          : `${passedCount}/${testCases.length} tests passed. Keep working on it!`
      })
    }

    runTests()
  }, [pyodide, code, testCases, onResults])

  if (loading) {
    return <div className="text-sm text-gray-500">Loading Python runtime...</div>
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>
  }

  return null
}
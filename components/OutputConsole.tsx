// export default function OutputConsole() {
//   return (
//     <div className="bg-black text-green-400 p-4 rounded shadow h-32 overflow-y-auto">
//       <h2 className="text-xl font-semibold mb-2">Output Console</h2>
//       <pre>
//         {`> Console output will appear here...`}
//       </pre>
//     </div>
//   )
// }
//



'use client'

export default function OutputConsole({ output, testCases }: { output: string; testCases: Array<{ input: string; expected: string; result: string }> }) {
    return (
        <div className="bg-black text-green-400 p-4 rounded shadow h-48 overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Output Console</h2>

            {/* Execution Output */}
            <div className="mb-4">
                <h3 className="text-lg text-white">Execution Output:</h3>
                <pre className="bg-gray-800 text-green-300 p-2 rounded">
          {output || '> Console output will appear here...'}
        </pre>
            </div>

            {/* Test Case Results */}
            <div>
                <h3 className="text-lg text-white">Test Case Results:</h3>
                {testCases && testCases.length > 0 ? (
                    <ul className="list-disc pl-4">
                        {testCases.map((testCase, index) => (
                            <li key={index} className={`text-${testCase.result === 'Pass' ? 'green' : 'red'}-500`}>
                                Input: {testCase.input}, Expected: {testCase.expected}, Result: {testCase.result}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No test cases to display.</p>
                )}
            </div>
        </div>
    )
}

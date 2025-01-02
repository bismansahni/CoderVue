'use client'

import { useState } from 'react'

export default function CodeEditor() {
  const [code, setCode] = useState('')

  return (
    <div className="bg-white p-4 rounded shadow flex-grow">
      <h2 className="text-xl font-semibold mb-2">Code Editor</h2>
      <textarea
        className="w-full h-64 p-2 font-mono text-sm border rounded"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
      />
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'

export default function AIVoiceAnimation() {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating((prev) => !prev)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">AI Voice</h2>
      <div className="flex justify-center items-center h-24">
        <div className={`w-4 h-4 bg-blue-500 rounded-full mr-2 ${isAnimating ? 'animate-ping' : ''}`}></div>
        <div className={`w-4 h-4 bg-blue-500 rounded-full mr-2 ${isAnimating ? 'animate-ping' : ''}`}></div>
        <div className={`w-4 h-4 bg-blue-500 rounded-full ${isAnimating ? 'animate-ping' : ''}`}></div>
      </div>
    </div>
  )
}


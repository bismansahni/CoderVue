'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, ChevronRight, Lock, 
  CheckCircle, Code2, Brain, TrendingUp
} from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [terminalText, setTerminalText] = useState('')
  const [showDemo, setShowDemo] = useState(false)

  // Typewriter effect for terminal
  const fullText = `$ codervue --start
Initializing AI interviewer...
Loading question bank...
Setting up environment...

Ready to practice? (y/n): _`

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setTerminalText(fullText.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 30)
    return () => clearInterval(timer)
  }, [fullText])

  // Skill progression demo
  const skills = [
    { name: 'Arrays', level: 0, color: 'bg-green-500' },
    { name: 'Trees', level: 0, color: 'bg-blue-500' },
    { name: 'Dynamic Programming', level: 0, color: 'bg-purple-500' },
    { name: 'System Design', level: 0, color: 'bg-orange-500' }
  ]

  const interviewFlow = [
    { step: 'Question Received', icon: Terminal, status: 'complete' },
    { step: 'Solution Explained', icon: Brain, status: 'complete' },
    { step: 'Code Written', icon: Code2, status: 'active' },
    { step: 'Feedback Given', icon: TrendingUp, status: 'pending' }
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Minimal Nav */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5 text-green-400" />
            <span className="font-mono text-sm">codervue</span>
          </div>
          <button
            onClick={() => router.push('/sign-in')}
            className="text-xs font-mono text-gray-400 hover:text-white transition-colors"
          >
            login
          </button>
        </div>
      </nav>

      {/* Hero - Terminal Style */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Terminal Window */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden shadow-2xl"
          >
            {/* Terminal Header */}
            <div className="bg-gray-800 px-4 py-2 flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-xs text-gray-400 font-mono">interview-session</span>
            </div>
            
            {/* Terminal Body */}
            <div className="p-6 font-mono text-sm">
              <pre className="text-green-400 whitespace-pre-wrap">{terminalText}</pre>
            </div>
          </motion.div>

          {/* CTA Below Terminal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="mt-8 flex flex-col items-center"
          >
            <p className="text-gray-400 mb-6 text-center">
              Practice coding interviews in your comfort zone.<br />
              No pressure. Just progress.
            </p>
            <button
              onClick={() => router.push('/sign-up')}
              className="group bg-gray-900 border border-gray-700 px-8 py-3 rounded-lg font-mono text-sm hover:bg-gray-800 transition-all flex items-center space-x-2"
            >
              <span>Start Free Practice</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="mt-4 text-xs text-gray-500 hover:text-gray-300 font-mono"
            >
              {showDemo ? 'hide' : 'watch'} demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Demo Section */}
      <AnimatePresence>
        {showDemo && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-20"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
                <h3 className="font-mono text-sm text-gray-400 mb-6">{"// Interview Flow"}</h3>
                <div className="space-y-4">
                  {interviewFlow.map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-4"
                    >
                      <div className={`p-2 rounded-lg ${
                        item.status === 'complete' ? 'bg-green-900/30 text-green-400' :
                        item.status === 'active' ? 'bg-blue-900/30 text-blue-400 animate-pulse' :
                        'bg-gray-800 text-gray-600'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className={`font-mono text-sm ${
                        item.status === 'complete' ? 'text-green-400' :
                        item.status === 'active' ? 'text-blue-400' :
                        'text-gray-600'
                      }`}>
                        {item.step}
                      </span>
                      {item.status === 'complete' && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* How It Works - Minimal */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono text-sm text-gray-400 mb-12">{"// How It Works"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 group-hover:border-gray-700 transition-colors">
                <div className="text-green-400 mb-4">01</div>
                <h3 className="font-mono text-sm mb-2">Choose Difficulty</h3>
                <p className="text-xs text-gray-500">
                  Start easy, progress naturally. No judgment, just growth.
                </p>
              </div>
            </div>
            <div className="group">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 group-hover:border-gray-700 transition-colors">
                <div className="text-blue-400 mb-4">02</div>
                <h3 className="font-mono text-sm mb-2">Practice & Learn</h3>
                <p className="text-xs text-gray-500">
                  Real-time AI feedback. Make mistakes, learn faster.
                </p>
              </div>
            </div>
            <div className="group">
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 group-hover:border-gray-700 transition-colors">
                <div className="text-purple-400 mb-4">03</div>
                <h3 className="font-mono text-sm mb-2">Track Progress</h3>
                <p className="text-xs text-gray-500">
                  Visual skill tree. See exactly where you stand.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Tree Preview */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-mono text-sm text-gray-400 mb-12">{"// Your Journey"}</h2>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="relative mx-auto w-20 h-20 mb-3">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-800"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={226}
                        strokeDashoffset={226}
                        className={skill.color.replace('bg-', 'text-')}
                        initial={{ strokeDashoffset: 226 }}
                        whileInView={{ strokeDashoffset: 226 - (226 * 0.7) }}
                        transition={{ duration: 1, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <p className="font-mono text-xs text-gray-500">{skill.name}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500 font-mono">
                Unlock skills as you progress. Build confidence systematically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-mono text-green-400 mb-2">100%</div>
              <p className="text-xs text-gray-500">Private & Secure</p>
            </div>
            <div>
              <div className="text-2xl font-mono text-blue-400 mb-2">24/7</div>
              <p className="text-xs text-gray-500">Practice Anytime</p>
            </div>
            <div>
              <div className="text-2xl font-mono text-purple-400 mb-2">Free</div>
              <p className="text-xs text-gray-500">Start Today</p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 px-6 border-t border-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-mono text-lg mb-4">Ready to level up?</h2>
          <p className="text-gray-400 text-sm mb-8">
            No credit card. No pressure. Just practice.
          </p>
          <button
            onClick={() => router.push('/sign-up')}
            className="bg-green-900/30 border border-green-800 text-green-400 px-8 py-3 rounded-lg font-mono text-sm hover:bg-green-900/50 transition-all"
          >
            Start Practicing →
          </button>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="font-mono text-xs text-gray-600">
            © 2024 codervue
          </div>
          <div className="flex space-x-6 font-mono text-xs">
            <a href="#" className="text-gray-600 hover:text-gray-400">privacy</a>
            <a href="#" className="text-gray-600 hover:text-gray-400">terms</a>
            <a href="#" className="text-gray-600 hover:text-gray-400">github</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
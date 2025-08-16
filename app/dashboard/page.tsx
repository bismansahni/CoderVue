'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Terminal, Play, Lock, Unlock, ChevronRight, 
  Zap, Target, TrendingUp, Award, GitBranch,
  Code2, Brain, Timer, CheckCircle, Circle,
  Gauge, Activity, Star, Flame
} from 'lucide-react'
import { UserButton, useUser } from "@clerk/nextjs"
import { v4 as uuidv4 } from 'uuid'

// Skill tree structure
const skillTree = {
  fundamentals: {
    name: 'Fundamentals',
    skills: [
      { id: 'arrays', name: 'Arrays', level: 0, maxLevel: 5, unlocked: true },
      { id: 'strings', name: 'Strings', level: 0, maxLevel: 5, unlocked: true },
      { id: 'linkedlists', name: 'Linked Lists', level: 0, maxLevel: 5, unlocked: false },
      { id: 'stacks', name: 'Stacks & Queues', level: 0, maxLevel: 5, unlocked: false }
    ]
  },
  intermediate: {
    name: 'Intermediate',
    skills: [
      { id: 'trees', name: 'Trees', level: 0, maxLevel: 5, unlocked: false },
      { id: 'graphs', name: 'Graphs', level: 0, maxLevel: 5, unlocked: false },
      { id: 'dp', name: 'Dynamic Programming', level: 0, maxLevel: 5, unlocked: false },
      { id: 'backtracking', name: 'Backtracking', level: 0, maxLevel: 5, unlocked: false }
    ]
  },
  advanced: {
    name: 'Advanced',
    skills: [
      { id: 'system', name: 'System Design', level: 0, maxLevel: 5, unlocked: false },
      { id: 'concurrency', name: 'Concurrency', level: 0, maxLevel: 5, unlocked: false },
      { id: 'behavioral', name: 'Behavioral', level: 0, maxLevel: 5, unlocked: false },
      { id: 'optimization', name: 'Optimization', level: 0, maxLevel: 5, unlocked: false }
    ]
  }
}

export default function TodayView() {
  const { user } = useUser()
  const router = useRouter()
  const [streak, setStreak] = useState(0)
  const [todayComplete, setTodayComplete] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [selectedPersonality, setSelectedPersonality] = useState('friendly')
  const [currentView, setCurrentView] = useState<'today' | 'skills' | 'history'>('today')
  const [isStarting, setIsStarting] = useState(false)

  // Simulated data
  const todaysFocus = {
    skill: 'Arrays',
    topic: 'Two Pointers',
    estimatedTime: 45,
    difficulty: 'medium' as const,
    description: 'Master the two-pointer technique for array problems'
  }

  const stats = {
    totalSessions: 12,
    currentStreak: 3,
    averageScore: 78,
    readinessLevel: 65
  }

  const startPractice = () => {
    setIsStarting(true)
    const sessionId = uuidv4()
    setTimeout(() => {
      router.push(`/dashboard/coding-room/${sessionId}?difficulty=${selectedDifficulty}&personality=${selectedPersonality}`)
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Minimal Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <Terminal className="h-5 w-5 text-green-400" />
              <span className="font-mono text-sm">codervue</span>
            </div>
            
            {/* View Switcher */}
            <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('today')}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  currentView === 'today' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                today
              </button>
              <button
                onClick={() => setCurrentView('skills')}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  currentView === 'skills' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                skills
              </button>
              <button
                onClick={() => setCurrentView('history')}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
                  currentView === 'history' 
                    ? 'bg-gray-700 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                history
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Streak Counter */}
            <div className="flex items-center space-x-2 text-sm">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-mono text-orange-400">{stats.currentStreak}</span>
            </div>
            
            {/* Level Indicator */}
            <div className="flex items-center space-x-2 text-sm">
              <Award className="h-4 w-4 text-purple-400" />
              <span className="font-mono text-purple-400">LV.7</span>
            </div>

            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {currentView === 'today' && (
          <motion.main
            key="today"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 py-12"
          >
            {/* Welcome Message */}
            <div className="mb-8">
              <h1 className="font-mono text-2xl mb-2">
                Welcome back, {user?.firstName || 'developer'}
              </h1>
              <p className="text-gray-400 text-sm">
                {todayComplete 
                  ? "Great job today! Feel free to practice more or review your progress."
                  : "Ready for today's challenge? Let's build on yesterday's progress."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Practice Card */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="font-mono text-lg mb-1">Today's Focus</h2>
                        <p className="text-xs text-gray-500">Recommended based on your progress</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Timer className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-400">{todaysFocus.estimatedTime} min</span>
                      </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-900/30 rounded-lg">
                            <Code2 className="h-5 w-5 text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-mono text-sm text-white">{todaysFocus.skill}</h3>
                            <p className="text-xs text-gray-500">{todaysFocus.topic}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-mono ${
                          todaysFocus.difficulty === 'easy' ? 'bg-green-900/30 text-green-400' :
                          todaysFocus.difficulty === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {todaysFocus.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {todaysFocus.description}
                      </p>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-xs text-gray-500 font-mono block mb-2">
                          Difficulty
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['easy', 'medium', 'hard'] as const).map(level => (
                            <button
                              key={level}
                              onClick={() => setSelectedDifficulty(level)}
                              className={`py-2 px-3 rounded-lg border font-mono text-xs transition-all ${
                                selectedDifficulty === level
                                  ? 'bg-gray-800 border-gray-600 text-white'
                                  : 'border-gray-800 text-gray-500 hover:border-gray-700'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 font-mono block mb-2">
                          Interviewer Style
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'friendly', name: 'Friendly', desc: 'Supportive & helpful' },
                            { id: 'google', name: 'Google', desc: 'Algorithmic focus' },
                            { id: 'startup', name: 'Startup', desc: 'Practical & fast' },
                            { id: 'amazon', name: 'Amazon', desc: 'Leadership focused' }
                          ].map(style => (
                            <button
                              key={style.id}
                              onClick={() => setSelectedPersonality(style.id)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                selectedPersonality === style.id
                                  ? 'bg-gray-800 border-gray-600'
                                  : 'border-gray-800 hover:border-gray-700'
                              }`}
                            >
                              <div className="font-mono text-xs text-white">{style.name}</div>
                              <div className="text-xs text-gray-500 mt-1">{style.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={startPractice}
                      disabled={isStarting}
                      className="w-full bg-green-900/30 border border-green-800 text-green-400 py-3 rounded-lg font-mono text-sm hover:bg-green-900/50 transition-all flex items-center justify-center space-x-2 group"
                    >
                      {isStarting ? (
                        <>
                          <Terminal className="h-4 w-4 animate-pulse" />
                          <span>Initializing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Start Practice Session</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Stats Panel */}
              <div className="space-y-6">
                {/* Readiness Meter */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6"
                >
                  <h3 className="font-mono text-sm mb-4">Interview Readiness</h3>
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-800"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={352}
                        strokeDashoffset={352 - (352 * stats.readinessLevel / 100)}
                        className="text-green-400"
                        initial={{ strokeDashoffset: 352 }}
                        animate={{ strokeDashoffset: 352 - (352 * stats.readinessLevel / 100) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-mono">{stats.readinessLevel}%</div>
                        <div className="text-xs text-gray-500">Ready</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Sessions</span>
                      <span className="font-mono">{stats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Avg Score</span>
                      <span className="font-mono">{stats.averageScore}%</span>
                    </div>
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-6"
                >
                  <h3 className="font-mono text-sm mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-between group">
                      <span className="text-xs text-gray-400">Review yesterday</span>
                      <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-gray-400" />
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-between group">
                      <span className="text-xs text-gray-400">Random challenge</span>
                      <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-gray-400" />
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-between group">
                      <span className="text-xs text-gray-400">Mock interview</span>
                      <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-gray-400" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.main>
        )}

        {currentView === 'skills' && (
          <motion.main
            key="skills"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 py-12"
          >
            <h2 className="font-mono text-xl mb-8">Skill Tree</h2>
            
            {Object.entries(skillTree).map(([category, data]) => (
              <div key={category} className="mb-12">
                <h3 className="font-mono text-sm text-gray-400 mb-4">{data.name}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.skills.map(skill => (
                    <motion.div
                      key={skill.id}
                      whileHover={skill.unlocked ? { scale: 1.05 } : {}}
                      className={`bg-gray-900 border rounded-lg p-4 text-center cursor-pointer transition-all ${
                        skill.unlocked 
                          ? 'border-gray-700 hover:border-gray-600' 
                          : 'border-gray-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="mb-3">
                        {skill.unlocked ? (
                          <Unlock className="h-6 w-6 text-green-400 mx-auto" />
                        ) : (
                          <Lock className="h-6 w-6 text-gray-600 mx-auto" />
                        )}
                      </div>
                      <div className="font-mono text-xs mb-2">{skill.name}</div>
                      <div className="flex justify-center space-x-1 mb-1">
                        {[...Array(skill.maxLevel)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 w-4 rounded-full ${
                              i < skill.level ? 'bg-green-400' : 'bg-gray-800'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {skill.level}/{skill.maxLevel}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.main>
        )}

        {currentView === 'history' && (
          <motion.main
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6 py-12"
          >
            <h2 className="font-mono text-xl mb-8">Practice History</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <p className="text-gray-400 text-sm text-center">
                Your practice history will appear here after your first session.
              </p>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  )
}
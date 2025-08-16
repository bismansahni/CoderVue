'use client'

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Terminal, Send, Mic, MicOff, Code2, MessageSquare,
  Play, CheckCircle, AlertCircle, ChevronDown, ChevronUp,
  Sparkles, User, Bot, Clock, TestTube
} from "lucide-react"
import { InterviewOrchestrator, InterviewStage, type AgentResponse } from "@/lib/interview-agents-client"
import { NaturalVoiceRecognition, STAGE_SILENCE_THRESHOLDS, isUserTyping } from "@/lib/voice-recognition"

interface ChatMessage {
  id: string
  role: 'interviewer' | 'candidate' | 'system'
  content: string
  timestamp: Date
  stage?: InterviewStage
  actionButtons?: Array<{label: string; action: string; style: string}>
}

export default function InterviewRoom() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const chatEndRef = useRef<HTMLDivElement>(null)
  const codeEditorRef = useRef<HTMLTextAreaElement>(null)
  const [orchestrator, setOrchestrator] = useState<InterviewOrchestrator | null>(null)
  
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId
  const personality = (searchParams.get("personality") || "friendly") as any
  const difficulty = searchParams.get("difficulty") || "medium"
  
  // Core state
  const [currentStage, setCurrentStage] = useState<InterviewStage>(InterviewStage.GREETING)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [code, setCode] = useState(`// Your solution here
function solve() {
  
}`)
  const [isThinking, setIsThinking] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false) // Start with question hidden
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [lastCodeAnalysis, setLastCodeAnalysis] = useState<any>(null)
  const [codeAnalysisTimer, setCodeAnalysisTimer] = useState<NodeJS.Timeout | null>(null)
  const [voiceRecognition, setVoiceRecognition] = useState<NaturalVoiceRecognition | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const [interimTranscript, setInterimTranscript] = useState('')
  const [lastKeyPress, setLastKeyPress] = useState(Date.now())
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  // Initialize interview and voice
  useEffect(() => {
    initializeInterview()
    initializeVoice()
    
    return () => {
      voiceRecognition?.destroy()
    }
  }, [])
  
  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(prev => prev + 1), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const initializeInterview = async () => {
    try {
      // Get question from API but DON'T show it yet
      const response = await fetch("/api/getQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, topics: ['arrays', 'strings'] })
      })
      const data = await response.json()
      const question = data.question || "Given an array of integers, return indices of two numbers that add up to a target."
      
      // Store question but don't display it yet
      setCurrentQuestion(question)
      
      // Initialize orchestrator with sessionId
      const orch = new InterviewOrchestrator(question, personality, sessionId)
      setOrchestrator(orch)
      
      // Add initial system message first
      setMessages([{
        id: '1',
        role: 'system',
        content: '🎯 Interview session started. Speak naturally or type your responses.',
        timestamp: new Date()
      }])
      
      // Then add greeting from interviewer
      setTimeout(async () => {
        const greeting = await orch.handleAction('start')
        addInterviewerMessage(greeting)
      }, 500)
      
    } catch (error) {
      console.error("Error initializing:", error)
    }
  }
  
  const initializeVoice = () => {
    // Check if browser supports speech recognition
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: '⚠️ Voice recognition not supported in this browser. Please use Chrome or Edge.',
        timestamp: new Date()
      }])
      return;
    }
    
    // Request microphone permission first
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => {
        console.log('Microphone access granted')
        
        const voice = new NaturalVoiceRecognition(
          {
            continuous: true,
            interimResults: true,
            silenceThreshold: STAGE_SILENCE_THRESHOLDS[currentStage] || 2000
          },
          {
            onSpeechStart: () => {
              console.log('Speech detected - started speaking')
              setIsSpeaking(true)
              setIsListening(true)
            },
            onSpeechEnd: () => {
              console.log('Speech ended - stopped speaking')
              setIsSpeaking(false)
              // Don't immediately stop listening - wait for silence threshold
            },
            onResult: (transcript, isFinal) => {
              console.log('Voice result:', { transcript, isFinal })
              if (isFinal) {
                // Send as message when final
                if (transcript.trim() && !isUserTyping(lastKeyPress)) {
                  handleVoiceMessage(transcript)
                }
                setInterimTranscript('')
              } else {
                // Show interim results
                setInterimTranscript(transcript)
              }
            },
            onError: (error) => {
              console.error('Voice callback error:', error)
              // Only show error if it's not a normal abort/no-speech
              if (error !== 'no-speech' && error !== 'aborted') {
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  role: 'system',
                  content: `⚠️ Voice issue: ${error}. You can continue typing below.`,
                  timestamp: new Date()
                }])
              }
            }
          }
        )
        
        setVoiceRecognition(voice)
        
        // Don't start immediately - wait for user interaction
        console.log('Voice recognition initialized, waiting to start...')
        
        // Add system message about voice
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: '🎤 Microphone ready. Click "Start voice" below or just type your responses.',
          timestamp: new Date()
        }])
      })
      .catch((error) => {
        console.error('Microphone access denied:', error)
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          content: '🎤 Microphone access denied. Please type your responses.',
          timestamp: new Date()
        }])
      })
  }
  
  const handleVoiceMessage = async (transcript: string) => {
    // Don't process if user is typing or AI is thinking
    if (isUserTyping(lastKeyPress) || isThinking) return
    
    // Add user message from voice
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'candidate',
      content: transcript,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsThinking(true)
    
    // Process with orchestrator
    if (orchestrator) {
      try {
        const response = await orchestrator.processMessage(transcript, showCode ? code : undefined)
        addInterviewerMessage(response)
        
        // Update stage
        const newStage = orchestrator.getStage()
        if (newStage !== currentStage) {
          handleStageTransition(newStage)
        }
      } catch (error) {
        console.error("Error processing voice:", error)
      } finally {
        setIsThinking(false)
      }
    }
  }
  
  const addInterviewerMessage = (response: AgentResponse) => {
    if (response.message) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        role: 'interviewer',
        content: response.message,
        timestamp: new Date(),
        stage: orchestrator?.getStage(),
        actionButtons: response.actionButtons
      }
      setMessages(prev => [...prev, message])
    }
    
    // Handle stage-specific UI changes
    if (response.shouldShowCode) {
      setShowCode(true)
    }
    
    // Handle stage transitions from response
    if (response.suggestedNextStage) {
      handleStageTransition(response.suggestedNextStage)
    }
  }
  
  const handleStageTransition = (newStage: InterviewStage) => {
    setCurrentStage(newStage)
    
    // Handle stage-specific UI changes
    if (newStage === InterviewStage.PROBLEM_INTRODUCTION) {
      // Don't auto-show question, let user click to see it
      // This prevents the question from taking over the screen
    } else if (newStage === InterviewStage.CLARIFICATION) {
      setShowQuestion(true) // Show question when clarifying
    } else if (newStage === InterviewStage.CODING) {
      setShowCode(true)
      setShowQuestion(false) // Hide question to make room for code
    }
    
    // Update voice recognition thresholds
    voiceRecognition?.setSilenceThreshold(STAGE_SILENCE_THRESHOLDS[newStage] || 2000)
  }
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !orchestrator) return
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'candidate',
      content: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsThinking(true)
    
    // Process with orchestrator - ALWAYS send current code so AI can see it
    try {
      const response = await orchestrator.processMessage(inputMessage, showCode ? code : undefined)
      addInterviewerMessage(response)
      
      // Update stage
      const newStage = orchestrator.getStage()
      if (newStage !== currentStage) {
        handleStageTransition(newStage)
        
        // Handle stage transitions
        if (newStage === InterviewStage.PROBLEM_INTRODUCTION) {
          setShowQuestion(true)
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: '📋 Here\'s today\'s problem. Take your time to read it.',
            timestamp: new Date()
          }])
        } else if (newStage === InterviewStage.CODING) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'system',
            content: '📝 Moving to coding phase. The code editor is now available.',
            timestamp: new Date()
          }])
          setShowCode(true)
        }
      }
    } catch (error) {
      console.error("Error processing message:", error)
    } finally {
      setIsThinking(false)
    }
  }
  
  const handleAction = async (action: string) => {
    if (!orchestrator) return
    
    setIsThinking(true)
    try {
      const response = await orchestrator.handleAction(action)
      addInterviewerMessage(response)
      
      // Update stage after action
      const newStage = orchestrator.getStage()
      if (newStage !== currentStage) {
        handleStageTransition(newStage)
      }
    } catch (error) {
      console.error("Error handling action:", error)
    } finally {
      setIsThinking(false)
    }
  }
  
  const runTests = async () => {
    // Simulate test running
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: '🧪 Running tests...',
      timestamp: new Date()
    }])
    
    setTimeout(() => {
      const results = [
        { input: '[1,2,3], target=5', expected: '[1,2]', actual: '[1,2]', passed: true },
        { input: '[0,0,1], target=0', expected: '[0,1]', actual: '[0,1]', passed: true },
        { input: '[-1,0,1], target=0', expected: '[0,2]', actual: 'undefined', passed: false }
      ]
      
      const passed = results.filter(r => r.passed).length
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: `Test Results: ${passed}/${results.length} passed`,
        timestamp: new Date()
      }])
      
      // Let orchestrator handle test results
      if (orchestrator) {
        orchestrator.processMessage(`I got ${passed} out of ${results.length} tests passing`, code)
      }
    }, 2000)
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Analyze code as user types (debounced)
  const analyzeCode = async (currentCode: string) => {
    if (!currentCode.trim() || currentCode.length < 20) return;
    
    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: currentCode,
          question: currentQuestion,
          sessionId
        })
      });
      
      const data = await response.json();
      setLastCodeAnalysis(data);
      
      // If AI thinks intervention is needed, add a subtle hint
      if (data.needsIntervention && orchestrator && currentStage === InterviewStage.CODING) {
        // Only intervene occasionally, not every time
        const shouldIntervene = Math.random() > 0.7; // 30% chance
        if (shouldIntervene) {
          const hint = data.suggestions[0];
          if (hint) {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'system',
              content: `💡 Hint: ${hint}`,
              timestamp: new Date()
            }]);
          }
        }
      }
    } catch (error) {
      console.error('Error analyzing code:', error);
    }
  }
  
  // Watch code changes
  useEffect(() => {
    if (currentStage !== InterviewStage.CODING) return;
    
    // Clear existing timer
    if (codeAnalysisTimer) {
      clearTimeout(codeAnalysisTimer);
    }
    
    // Set new timer (debounce for 2 seconds)
    const timer = setTimeout(() => {
      analyzeCode(code);
    }, 2000);
    
    setCodeAnalysisTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [code, currentStage])
  
  // Get stage indicator
  const getStageIndicator = () => {
    const stages = {
      [InterviewStage.GREETING]: { label: 'Introduction', color: 'text-blue-400' },
      [InterviewStage.PROBLEM_INTRODUCTION]: { label: 'Problem', color: 'text-yellow-400' },
      [InterviewStage.CLARIFICATION]: { label: 'Clarifications', color: 'text-purple-400' },
      [InterviewStage.SOLUTION_DISCUSSION]: { label: 'Approach', color: 'text-orange-400' },
      [InterviewStage.CODING]: { label: 'Coding', color: 'text-green-400' },
      [InterviewStage.TESTING]: { label: 'Testing', color: 'text-cyan-400' },
      [InterviewStage.OPTIMIZATION]: { label: 'Optimization', color: 'text-pink-400' }
    }
    return stages[currentStage] || { label: 'Interview', color: 'text-gray-400' }
  }
  
  const stageInfo = getStageIndicator()
  
  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-green-400" />
            <span className="font-mono text-xs">interview.session</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${stageInfo.color.replace('text-', 'bg-')} animate-pulse`} />
            <span className={`font-mono text-xs ${stageInfo.color}`}>{stageInfo.label}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3 text-gray-500" />
            <span className="font-mono text-xs text-gray-400">{formatTime(elapsedTime)}</span>
          </div>
        </div>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-mono text-gray-500 hover:text-gray-300"
        >
          end session
        </button>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Problem Statement (collapsible) */}
          <div className="border-b border-gray-800">
            <button
              onClick={() => setShowQuestion(!showQuestion)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-900/50 transition-colors"
              disabled={currentStage === InterviewStage.GREETING}
            >
              <div className="flex items-center space-x-2">
                <Code2 className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-mono text-gray-400">
                  {currentStage === InterviewStage.GREETING 
                    ? 'Problem will be shared soon...' 
                    : showQuestion 
                      ? 'Hide Problem Statement' 
                      : 'Show Problem Statement'}
                </span>
              </div>
              {showQuestion ? <ChevronUp className="h-3 w-3 text-gray-500" /> : <ChevronDown className="h-3 w-3 text-gray-500" />}
            </button>
            
            <AnimatePresence>
              {showQuestion && currentQuestion && currentStage !== InterviewStage.GREETING && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap bg-gray-900 rounded p-3">
                      {currentQuestion}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Terminal className="h-8 w-8 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Initializing interview...</p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${message.role === 'system' ? 'w-full' : ''}`}>
                  {message.role === 'system' ? (
                    <div className="bg-gray-900/50 border border-gray-800 rounded px-3 py-2 text-xs text-gray-400 text-center">
                      {message.content}
                    </div>
                  ) : (
                    <div className={`flex items-start space-x-2 ${message.role === 'candidate' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        message.role === 'interviewer' ? 'bg-blue-900/30' : 'bg-green-900/30'
                      }`}>
                        {message.role === 'interviewer' ? 
                          <Bot className="h-3 w-3 text-blue-400" /> : 
                          <User className="h-3 w-3 text-green-400" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className={`rounded-lg px-3 py-2 ${
                          message.role === 'interviewer' 
                            ? 'bg-gray-900 border border-gray-800' 
                            : 'bg-gray-800 border border-gray-700'
                        }`}>
                          <p className="text-sm text-gray-200">{message.content}</p>
                        </div>
                        
                        {/* Action buttons */}
                        {message.actionButtons && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {message.actionButtons.map((btn, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAction(btn.action)}
                                disabled={isThinking}
                                className={`text-xs px-3 py-1 rounded-lg font-mono transition-all ${
                                  btn.style === 'primary' 
                                    ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 border border-blue-800'
                                    : btn.style === 'secondary'
                                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                    : 'text-gray-500 hover:text-gray-300'
                                }`}
                              >
                                {btn.label}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-1 text-xs text-gray-600">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isThinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-gray-400"
              >
                <Bot className="h-4 w-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </motion.div>
            )}
            
            <div ref={chatEndRef} />
          </div>
          
          {/* Input with Voice Transcription */}
          <div className="border-t border-gray-800 p-4 space-y-2">
            {/* Voice transcription display */}
            {(interimTranscript || isSpeaking) && (
              <div className="flex items-start space-x-2 text-sm">
                <div className="flex items-center space-x-1">
                  <Mic className="h-3 w-3 text-green-400 animate-pulse" />
                  <span className="text-xs text-gray-500">You:</span>
                </div>
                <p className="flex-1 text-gray-300 italic">
                  {interimTranscript || "Listening..."}
                </p>
              </div>
            )}
            
            {/* Text input (optional fallback) */}
            <div className="flex items-center space-x-2">
              {/* Voice indicator */}
              <div className="flex items-center space-x-1 px-2">
                {isListening ? (
                  <div className="flex space-x-1 items-center">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <div className="h-3 w-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                    <div className="h-4 w-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                    <div className="h-3 w-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    <div className="h-2 w-1 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <MicOff className="h-3 w-3" />
                    <span className="text-xs">Voice off</span>
                  </div>
                )}
              </div>
              
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value)
                  setLastKeyPress(Date.now())
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage()
                  }
                  setLastKeyPress(Date.now())
                }}
                placeholder="Type or speak naturally..."
                className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-700"
              />
              
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isThinking}
                className="p-2 bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-blue-800"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
            {/* Voice status and controls */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className={`font-mono ${isListening ? 'text-green-400' : 'text-gray-500'}`}>
                  {isSpeaking ? "🔴 Speaking..." : isListening ? "🟢 Listening..." : "⚫ Voice off"}
                </span>
                {/* Manual voice toggle */}
                <button
                  onClick={() => {
                    if (voiceRecognition) {
                      if (isListening) {
                        voiceRecognition.stop()
                        setIsListening(false)
                        console.log('Voice stopped manually')
                      } else {
                        voiceRecognition.start()
                        setIsListening(true)
                        console.log('Voice started manually')
                      }
                    } else {
                      console.log('Voice not initialized, trying to initialize...')
                      initializeVoice()
                    }
                  }}
                  className="text-gray-500 hover:text-gray-300 underline"
                >
                  {isListening ? 'Stop voice' : 'Start voice'}
                </button>
                {/* Test voice button */}
                <button
                  onClick={() => {
                    const testMessage = "Testing voice input"
                    setInterimTranscript(testMessage)
                    setTimeout(() => {
                      handleVoiceMessage(testMessage)
                      setInterimTranscript('')
                    }, 1000)
                  }}
                  className="text-gray-500 hover:text-gray-300 text-xs"
                >
                  [Test]
                </button>
              </div>
              <span className="text-gray-500">Speak naturally • Pause to send</span>
            </div>
            
            {/* Quick actions based on stage */}
            <div className="flex space-x-2 mt-2">
              {currentStage === InterviewStage.CODING && (
                <button
                  onClick={runTests}
                  className="text-xs px-3 py-1 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 font-mono border border-green-800"
                >
                  <TestTube className="h-3 w-3 inline mr-1" />
                  Run Tests
                </button>
              )}
              {(currentStage === InterviewStage.CODING || currentStage === InterviewStage.SOLUTION_DISCUSSION) && (
                <button
                  onClick={() => handleAction('hint')}
                  className="text-xs px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-lg hover:bg-yellow-900/50 font-mono border border-yellow-800"
                >
                  <Sparkles className="h-3 w-3 inline mr-1" />
                  Get Hint
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Code Editor (when visible) */}
        {showCode && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '50%' }}
            className="bg-gray-925 flex flex-col"
          >
            <div className="border-b border-gray-800 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono text-gray-400">solution.js</span>
                {lastCodeAnalysis && (
                  <div className="flex items-center space-x-1">
                    <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-green-400">AI watching</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">{code.split('\n').length} lines</span>
                {lastCodeAnalysis?.suggestions && lastCodeAnalysis.suggestions.length > 0 && (
                  <span className="text-xs text-yellow-400">
                    {lastCodeAnalysis.suggestions.length} suggestions
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-1 flex">
              <div className="w-12 bg-gray-900/50 border-r border-gray-800 py-4 text-right">
                {code.split('\n').map((_, i) => (
                  <div key={i} className="px-2 text-xs text-gray-600 font-mono" style={{ lineHeight: '1.5' }}>
                    {i + 1}
                  </div>
                ))}
              </div>
              
              <textarea
                ref={codeEditorRef}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value)
                  setLastKeyPress(Date.now())
                  // Pause voice when typing
                  voiceRecognition?.pause()
                  setTimeout(() => voiceRecognition?.resume(), 2000)
                }}
                className="flex-1 bg-transparent text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none"
                style={{ lineHeight: '1.5', tabSize: 2 }}
                placeholder="// Start coding..."
                spellCheck={false}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
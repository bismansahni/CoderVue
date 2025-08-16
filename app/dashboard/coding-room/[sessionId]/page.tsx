'use client'

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Terminal, Mic, Volume2, ChevronRight, Loader2,
  MessageSquare, Code2, Sparkles
} from "lucide-react"

// Interview stages that trigger screen changes
type InterviewStage = 'greeting' | 'problem_introduction' | 'clarification' | 'coding' | 'testing' | 'complete'
type ScreenState = 'greeting' | 'problem' | 'coding' | 'complete'

export default function VoiceInterviewRoom() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  
  const sessionId = Array.isArray(params.sessionId) ? params.sessionId[0] : params.sessionId
  const personality = searchParams.get("personality") || "friendly"
  const difficulty = searchParams.get("difficulty") || "medium"
  
  // Core state
  const [stage, setStage] = useState<InterviewStage>('greeting')
  const [screen, setScreen] = useState<ScreenState>('greeting')
  const stageRef = useRef<InterviewStage>('greeting') // Track current stage in ref for immediate access
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [code, setCode] = useState(`// Your solution here
function solution() {
  
}`)
  
  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [aiMessage, setAiMessage] = useState("")
  const [recognition, setRecognition] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Session history for context
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  // Use ref to always have access to latest history in callbacks
  const conversationHistoryRef = useRef<Array<{role: string, content: string}>>([])
  
  // Track initialization to prevent double calls
  const [isInitialized, setIsInitialized] = useState(false)
  const initializingRef = useRef(false) // Use ref to prevent StrictMode double-init
  const hasGreetedRef = useRef(false) // Track if greeting was already sent
  const hasAskedForThoughtsRef = useRef(false) // Track if we asked for problem thoughts
  
  // For accumulating speech
  const accumulatedTranscriptRef = useRef<string>('')
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Initialize on mount
  useEffect(() => {
    if (!isInitialized && !initializingRef.current) {
      initializingRef.current = true
      setIsInitialized(true)
      initializeInterview()
    }
  }, [])
  
  // Handle stage changes to update screen
  useEffect(() => {
    console.log('=== STAGE CHANGE DETECTED ===')
    console.log('New stage:', stage)
    console.log('Updating stageRef to match:', stage)
    stageRef.current = stage // Ensure ref is always in sync
    
    // Map stages to screens
    if (stage === 'greeting') {
      setScreen('greeting')
    } else if (stage === 'problem_introduction' || stage === 'clarification') {
      setScreen('problem')
    } else if (stage === 'coding' || stage === 'testing') {
      setScreen('coding')
    }
    console.log('Screen updated based on stage')
    console.log('============================')
  }, [stage])
  
  const initializeInterview = async () => {
    // Guard against multiple initializations
    if (hasGreetedRef.current) {
      console.log('Interview already initialized, skipping')
      return
    }
    
    try {
      // Get question first
      const response = await fetch("/api/getQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, topics: ['arrays', 'strings'] })
      })
      const data = await response.json()
      const question = data.question || "Given an array, find two numbers that sum to a target."
      setCurrentQuestion(question)
      console.log('Question loaded:', question.substring(0, 50) + '...')
      
      // Initialize voice
      initializeVoice()
      
      // Start with greeting agent (only once)
      // Don't use setTimeout with stale closure - call directly after a delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Only call greeting if not already started
      if (!hasGreetedRef.current && conversationHistoryRef.current.length === 0) {
        hasGreetedRef.current = true // Mark as greeted immediately to prevent double calls
        console.log('Starting interview with greeting agent')
        callAgent('greeting', null)
      } else {
        console.log('Skipping greeting - already greeted or history exists')
      }
    } catch (error) {
      console.error('Error initializing interview:', error)
    }
  }
  
  const initializeVoice = () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported')
      return
    }
    
    const speechRecognition = new (window as any).webkitSpeechRecognition()
    speechRecognition.continuous = true
    speechRecognition.interimResults = true
    speechRecognition.lang = "en-US"
    
    speechRecognition.onstart = () => {
      setIsListening(true)
      console.log('Voice: Listening started')
    }
    
    speechRecognition.onresult = (event: any) => {
      // Get the current segment
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      
      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      
      if (event.results[current].isFinal) {
        // Add to accumulated transcript
        accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + transcript
        console.log('Segment:', transcript)
        console.log('Accumulated so far:', accumulatedTranscriptRef.current)
        
        // Show accumulated transcript
        setTranscript(accumulatedTranscriptRef.current)
        
        // Set timer to process after silence
        silenceTimerRef.current = setTimeout(() => {
          const fullText = accumulatedTranscriptRef.current.trim()
          if (fullText) {
            console.log('Processing full statement:', fullText)
            processUserSpeech(fullText)
            accumulatedTranscriptRef.current = ''
            setTranscript('')
          }
        }, 1500) // Wait 1.5 seconds of silence before processing
        
      } else {
        // Show interim results (current segment + what we have so far)
        const tempTranscript = accumulatedTranscriptRef.current + 
          (accumulatedTranscriptRef.current ? ' ' : '') + transcript
        setTranscript(tempTranscript)
      }
    }
    
    speechRecognition.onerror = (event: any) => {
      console.error('Speech error:', event.error)
      // Auto restart on common errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setTimeout(() => startListening(), 500)
      }
    }
    
    speechRecognition.onend = () => {
      setIsListening(false)
      console.log('Voice: Listening ended')
      
      // Process any remaining accumulated text
      if (accumulatedTranscriptRef.current.trim()) {
        const fullText = accumulatedTranscriptRef.current.trim()
        console.log('Processing remaining text on end:', fullText)
        processUserSpeech(fullText)
        accumulatedTranscriptRef.current = ''
        setTranscript('')
      }
      
      // Auto restart for continuous listening
      if (!isSpeaking && !isProcessing) {
        setTimeout(() => {
          console.log('Auto-restarting voice recognition...')
          startListening()
        }, 1000)
      }
    }
    
    setRecognition(speechRecognition)
    
    // Start listening after delay
    setTimeout(() => startListening(), 2000)
  }
  
  const startListening = () => {
    if (recognition && !isListening && !isSpeaking) {
      try {
        recognition.start()
        console.log('Started listening')
      } catch (e) {
        console.log('Already listening')
      }
    }
  }
  
  const stopListening = () => {
    if (recognition && isListening) {
      try {
        recognition.stop()
        console.log('Stopped listening')
      } catch (e) {
        console.log('Error stopping recognition')
      }
    }
  }
  
  // Keep track of current audio to prevent overlaps
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastSpokenTextRef = useRef<string>("")
  const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const speak = async (text: string) => {
    // Prevent duplicate calls for the same text
    if (lastSpokenTextRef.current === text && isSpeaking) {
      console.log('Already speaking this text, skipping duplicate')
      return
    }
    
    // Clear any pending speak timeout
    if (speakingTimeoutRef.current) {
      clearTimeout(speakingTimeoutRef.current)
      speakingTimeoutRef.current = null
    }
    
    try {
      // Cancel any existing speech first
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
      window.speechSynthesis.cancel() // Cancel any browser TTS
      
      // Stop listening while AI speaks
      stopListening()
      setIsSpeaking(true)
      lastSpokenTextRef.current = text
      console.log('AI speaking:', text)
      
      // Call OpenAI TTS API with request ID to track duplicates
      const requestId = `${Date.now()}-${Math.random()}`
      console.log(`TTS API call - Request ID: ${requestId}`)
      
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice: 'nova', // You can change to: alloy, echo, fable, onyx, shimmer
          requestId // For debugging
        })
      })
      
      if (!response.ok) {
        throw new Error('TTS failed')
      }
      
      // Get audio blob and play it
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio
      
      audio.onended = () => {
        setIsSpeaking(false)
        console.log('AI finished speaking')
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        lastSpokenTextRef.current = "" // Clear last spoken text
        // Resume listening after AI finishes
        setTimeout(() => startListening(), 500)
      }
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        setIsSpeaking(false)
        currentAudioRef.current = null
        // Fallback to browser TTS
        fallbackSpeak(text)
      }
      
      await audio.play()
      
    } catch (error) {
      console.error('OpenAI TTS error:', error)
      // Fallback to browser TTS
      fallbackSpeak(text)
    }
  }
  
  const fallbackSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        setTimeout(() => startListening(), 500)
      }
      
      window.speechSynthesis.speak(utterance)
    }
  }
  
  const callAgent = async (agentType: string, userMessage: string | null, stageOverride?: string) => {
    // Prevent duplicate calls while processing
    if (isProcessing) {
      console.log('Skipping duplicate agent call - already processing')
      return
    }
    
    setIsProcessing(true)
    console.log(`Calling ${agentType} agent with message:`, userMessage, stageOverride ? `(stage override: ${stageOverride})` : '')
    
    try {
      // Build conversation history for context
      // Use the ref to get the latest history (avoids stale closure issues)
      const history = [
        ...conversationHistoryRef.current,
        ...(userMessage ? [{role: 'user', content: userMessage}] : [])
      ]
      
      console.log('Sending history to API:', history.length, 'messages')
      console.log('History content:', JSON.stringify(history, null, 2))
      
      // Call the appropriate agent endpoint
      const response = await fetch('/api/interview-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          stage: stageOverride || stage,  // Use override if provided, otherwise current stage
          sessionId,
          personality,
          userMessage,
          code: (stageOverride || stage) === 'coding' ? code : undefined,
          question: currentQuestion,
          history
        })
      })
      
      const data = await response.json()
      console.log('Agent response:', data)
      console.log('Response contains nextStage?', data.nextStage ? `Yes: ${data.nextStage}` : 'No')
      
      // Build new history FIRST before any stage transitions
      // Check if last message is the same to prevent duplicates
      const lastMessage = conversationHistoryRef.current[conversationHistoryRef.current.length - 1]
      const isDuplicate = lastMessage && lastMessage.role === 'assistant' && lastMessage.content === data.message
      
      if (isDuplicate) {
        console.log('Skipping duplicate assistant message')
        // BUT still process stage transitions even for duplicates!
        if (data.nextStage) {
          console.log('Duplicate message but has stage transition - processing transition')
          stageRef.current = data.nextStage
          setStage(data.nextStage)
        }
        return // Don't add duplicate messages
      }
      
      const newHistory = userMessage 
        ? [...conversationHistoryRef.current, 
           {role: 'user', content: userMessage},
           {role: 'assistant', content: data.message}]
        : [...conversationHistoryRef.current, 
           {role: 'assistant', content: data.message}];
      
      // Update both state and ref immediately
      setConversationHistory(newHistory)
      conversationHistoryRef.current = newHistory
      console.log('Updated history:', newHistory.length, 'items')
      console.log('Full history:', newHistory)
      
      // NOW handle stage transitions with updated history
      if (data.nextStage) {
        console.log(`Stage transition: ${stage} → ${data.nextStage}`)
        console.log(`Updating stageRef to: ${data.nextStage}`)
        // CRITICAL: Update ref IMMEDIATELY for speech processing
        stageRef.current = data.nextStage 
        setStage(data.nextStage)
        
        // If moving to problem_introduction, announce it and ask for thoughts
        if (data.nextStage === 'problem_introduction') {
          console.log('Transitioned to problem_introduction stage - problem is now visible')
          
          if (!hasAskedForThoughtsRef.current) {
            hasAskedForThoughtsRef.current = true // Prevent duplicate calls immediately
            // Store the new stage value to use in the timeout
            const newStage = data.nextStage
            // Now the ref already has the updated history
            setTimeout(() => {
              console.log('Calling problem_thoughts with stage:', newStage, ', history has:', conversationHistoryRef.current.length, 'items')
              // We need to pass the correct stage since setState might not have updated yet
              callAgent('problem_thoughts', null, newStage)
            }, 3000) // Give them 3 seconds to read the problem
          } else {
            console.log('Skipping problem_thoughts - already asked')
          }
        }
      } else {
        console.log('No stage transition suggested by agent')
      }
      
      // Show and speak the response
      setAiMessage(data.message)
      // Add small delay to prevent double calls from re-renders
      setTimeout(() => {
        if (!isSpeaking) {
          speak(data.message)
        }
      }, 100)
      
    } catch (error) {
      console.error('Error calling agent:', error)
      const fallback = "Let me think about that for a moment."
      setAiMessage(fallback)
      // Add delay here too
      setTimeout(() => {
        if (!isSpeaking) {
          speak(fallback)
        }
      }, 100)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const processUserSpeech = async (text: string) => {
    // Don't process if already processing or if AI is speaking
    if (isProcessing || isSpeaking) {
      console.log('Skipping speech processing - busy')
      return
    }
    
    const lowerText = text.toLowerCase()
    const currentStage = stageRef.current // Use ref to get current stage immediately
    console.log('=== PROCESSING USER SPEECH ===')
    console.log('Current stage (from ref):', currentStage)
    console.log('Current stage (from state):', stage)
    console.log('User said:', text)
    console.log('==============================')
    
    // Route to different agents based on current stage
    switch(currentStage) {
      case 'greeting':
        // Greeting agent handles initial interaction
        console.log('Greeting stage - processing:', text)
        
        // Check if user explicitly wants to skip to coding/problem
        if (lowerText.includes('show') && lowerText.includes('problem') ||
            lowerText.includes('let') && lowerText.includes('code') ||
            lowerText.includes('start coding') ||
            lowerText.includes('skip') ||
            lowerText.includes('begin') ||
            lowerText.includes('ready')) {
          console.log('User wants to skip to problem/coding')
          // First respond to their request
          await callAgent('greeting_response', text)
          // The agent will set nextStage to problem_introduction
        } else {
          // Normal greeting flow
          await callAgent('greeting_response', text)
        }
        break
        
      case 'problem_introduction':
        // Problem agent handles any response when viewing problem
        console.log('Problem introduction stage - processing response')
        
        // Check if they want to jump to coding
        if (lowerText.includes('ready to code') || 
            lowerText.includes('start coding') ||
            lowerText.includes("let's code")) {
          await callAgent('coding_start', text)
        } else {
          // Move to clarification/discussion
          await callAgent('problem_ready', text)
        }
        break
        
      case 'clarification':
        // Clarification agent handles questions and approach discussion
        console.log('Clarification stage - processing:', text)
        
        // Check if user wants to start coding
        if (lowerText.includes('ready to code') || lowerText.includes('start coding') ||
            lowerText.includes("let's code") || lowerText.includes('begin coding') ||
            lowerText.includes("let's start") || lowerText.includes("i'm ready") ||
            lowerText.includes("want to code") || lowerText.includes("start implementing") ||
            lowerText.includes("move to code") || lowerText.includes("open editor")) {
          await callAgent('coding_start', text)
        } else {
          // Handle clarification questions or approach discussion
          await callAgent('clarification', text)
        }
        break
        
      case 'coding':
        // Coding agent provides help during coding
        await callAgent('coding_help', text)
        break
        
      case 'testing':
        // Testing agent handles test discussions
        await callAgent('testing', text)
        break
    }
  }
  
  return (
    <div className="h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <Terminal className="h-4 w-4 text-green-400" />
          <span className="font-mono text-xs">ai interview • {stage.replace('_', ' ')}</span>
          
          {/* Voice Status */}
          <div className="flex items-center space-x-3">
            {isListening && !isSpeaking && (
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">Listening</span>
              </div>
            )}
            
            {isSpeaking && (
              <div className="flex items-center space-x-1">
                <Volume2 className="h-3 w-3 text-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400">AI speaking</span>
              </div>
            )}
            
            {isProcessing && (
              <div className="flex items-center space-x-1">
                <Loader2 className="h-3 w-3 text-yellow-400 animate-spin" />
                <span className="text-xs text-yellow-400">Thinking</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs font-mono text-gray-500 hover:text-gray-300"
        >
          end session
        </button>
      </header>
      
      {/* Main Content - Changes based on screen state */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* GREETING SCREEN */}
          {screen === 'greeting' && (
            <motion.div
              key="greeting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex items-center justify-center p-8"
            >
              <div className="max-w-2xl text-center">
                <div className="mb-8">
                  <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {isSpeaking ? (
                      <Volume2 className="h-10 w-10 text-white animate-pulse" />
                    ) : isProcessing ? (
                      <Loader2 className="h-10 w-10 text-white animate-spin" />
                    ) : (
                      <Mic className="h-10 w-10 text-white" />
                    )}
                  </div>
                  
                  <h1 className="text-2xl font-mono mb-6">AI Interview Session</h1>
                  
                  {/* AI Message */}
                  {aiMessage && (
                    <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-800">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="h-4 w-4 text-blue-400 mt-1" />
                        <p className="text-lg text-gray-300 text-left">{aiMessage}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* User Transcript */}
                  {transcript && (
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <p className="text-sm text-gray-400 font-mono">You: {transcript}</p>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500">
                  Speak naturally • The AI will guide you through the interview
                </p>
                
                {/* Manual controls for testing */}
                <div className="mt-4 flex gap-2 justify-center">
                  <button
                    onClick={() => processUserSpeech("Hi, I'm ready for the interview")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm"
                    disabled={isProcessing}
                  >
                    Test Response →
                  </button>
                  
                  <button
                    onClick={() => {
                      if (isListening) {
                        stopListening()
                      } else {
                        startListening()
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isListening ? 'Stop Mic' : 'Start Mic'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* PROBLEM SCREEN */}
          {screen === 'problem' && (
            <motion.div
              key="problem"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="h-full flex flex-col p-8"
            >
              <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
                {/* AI Message Bar */}
                {aiMessage && (
                  <div className="mb-4 p-3 bg-gray-900 rounded-lg border border-gray-800">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <p className="text-sm text-gray-300">{aiMessage}</p>
                    </div>
                  </div>
                )}
                
                {/* Problem Display */}
                <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-6 overflow-y-auto">
                  <h2 className="text-lg font-mono text-gray-300 mb-4">Problem Statement</h2>
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                    {currentQuestion}
                  </pre>
                </div>
                
                {/* Voice Transcript */}
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    {transcript ? (
                      <p className="text-sm text-gray-400 font-mono">You: {transcript}</p>
                    ) : (
                      <p className="text-xs text-gray-500">
                        Ask clarifying questions or say "I'm ready to code"
                      </p>
                    )}
                    
                    {isProcessing && (
                      <Loader2 className="h-4 w-4 text-yellow-400 animate-spin" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* CODING SCREEN */}
          {screen === 'coding' && (
            <motion.div
              key="coding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full flex"
            >
              {/* Code Editor */}
              <div className="flex-1 flex flex-col">
                <div className="border-b border-gray-800 px-4 py-2 bg-gray-900/50">
                  <span className="text-xs font-mono text-gray-400">solution.js</span>
                </div>
                
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-gray-950 text-gray-100 font-mono text-sm p-4 resize-none focus:outline-none"
                  style={{ lineHeight: '1.6', tabSize: 2 }}
                  placeholder="// Start coding your solution..."
                  spellCheck={false}
                  autoFocus
                />
              </div>
              
              {/* AI Assistant Panel */}
              <div className="w-96 border-l border-gray-800 flex flex-col bg-gray-900/50">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-sm font-mono text-gray-400 flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>AI Assistant</span>
                  </h3>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  {/* AI Message */}
                  {aiMessage && (
                    <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Code2 className="h-4 w-4 text-blue-400 mt-1" />
                        <p className="text-sm text-gray-300">{aiMessage}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* User Transcript */}
                  {transcript && (
                    <div className="p-3 bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-400">You: {transcript}</p>
                    </div>
                  )}
                  
                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 text-yellow-400 animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t border-gray-800">
                  <p className="text-xs text-gray-500 text-center">
                    Think out loud • Ask for hints • Discuss approach
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
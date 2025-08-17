'use client'

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import dynamic from 'next/dynamic'
import { 
  Terminal, Mic, Volume2, ChevronRight, Loader2,
  MessageSquare, Code2, Sparkles, ChevronUp, ChevronDown
} from "lucide-react"

// Dynamic import Monaco to avoid SSR issues
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-gray-400">Loading editor...</div>
})

// Interview stages that trigger screen changes
type InterviewStage = 'greeting' | 'problem_introduction' | 'problem_discussion' | 'coding' | 'testing' | 'complete'
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
  const currentQuestionRef = useRef<string>("") // Track question in ref to avoid stale closures
  const [showQuestionInCoding, setShowQuestionInCoding] = useState(true) // Show problem by default in coding
  const [code, setCode] = useState(`// Your solution here
function solution() {
  
}`)
  const codeRef = useRef<string>(`// Your solution here
function solution() {
  
}`) // Track code in ref for reliable access
  const pendingStageTransitionRef = useRef<string | null>(null) // Store pending stage transitions
  const approachSummaryRef = useRef<string>('') // Store the discussed approach
  
  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const isSpeakingRef = useRef(false) // Track speaking state in ref for reliable access
  const [transcript, setTranscript] = useState("")
  const [aiMessage, setAiMessage] = useState("")
  const [recognition, setRecognition] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0) // Visual feedback for mic input
  
  // Session history for context
  const [conversationHistory, setConversationHistory] = useState<Array<{role: string, content: string}>>([])
  // Use ref to always have access to latest history in callbacks
  const conversationHistoryRef = useRef<Array<{role: string, content: string}>>([])
  
  // Stage-specific isolated histories
  const stageHistories = useRef<Record<string, Array<{role: string, content: string}>>>({  
    greeting: [],
    problem_introduction: [],
    problem_discussion: [],
    coding: [],
    testing: []
  })
  
  // Track initialization to prevent double calls
  const [isInitialized, setIsInitialized] = useState(false)
  const initializingRef = useRef(false) // Use ref to prevent StrictMode double-init
  const hasGreetedRef = useRef(false) // Track if greeting was already sent
  const hasAskedForThoughtsRef = useRef(false) // Track if we asked for problem thoughts
  
  // For accumulating speech
  const accumulatedTranscriptRef = useRef<string>('')
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Code monitoring for intelligent interventions
  const lastCodeChangeRef = useRef<number>(Date.now())
  const lastVoiceActivityRef = useRef<number>(Date.now())
  const codeAnalysisTimerRef = useRef<NodeJS.Timeout | null>(null)
  const interventionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastInterventionRef = useRef<number>(Date.now())
  const interventionCountRef = useRef<number>(0)
  const lastCodeRef = useRef<string>('')
  const stuckOnLineTimerRef = useRef<NodeJS.Timeout | null>(null)
  
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
      // Clear greeting history on entry for fresh start
      if (!stageHistories.current.greeting.length) {
        console.log('Starting fresh greeting stage')
      }
    } else if (stage === 'problem_introduction' || stage === 'problem_discussion') {
      setScreen('problem')
      // Clear problem/problem_discussion history when entering from greeting
      if (stage === 'problem_introduction' && !stageHistories.current.problem_introduction.length) {
        console.log('Starting fresh problem stage - no greeting context')
        // Optionally clear greeting history to save memory
        stageHistories.current.greeting = []
      }
    } else if (stage === 'coding' || stage === 'testing') {
      setScreen('coding')
      // Clear coding history when first entering
      if (stage === 'coding' && !stageHistories.current.coding.length) {
        console.log('Starting fresh coding stage - no problem/problem_discussion context')
        // Optionally clear previous stage histories to save memory
        stageHistories.current.problem_introduction = []
        stageHistories.current.problem_discussion = []
      }
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
      currentQuestionRef.current = question // Store in ref for reliable access
      console.log('Question loaded:', question.substring(0, 50) + '...')
      
      // Initialize voice
      initializeVoice()
      
      // Start listening immediately so user can respond
      setTimeout(() => {
        console.log('Starting microphone for initial greeting')
        startListening()
      }, 500)
      
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
  
  const initializeVoice = async () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported')
      return
    }
    
    // Initialize speech recognition first (it can work without getUserMedia)
    const speechRecognition = new (window as any).webkitSpeechRecognition()
    // Use non-continuous mode for better accuracy and responsiveness
    speechRecognition.continuous = false  // Changed from true to prevent lag
    speechRecognition.interimResults = true
    speechRecognition.lang = "en-US"
    speechRecognition.maxAlternatives = 3  // Get alternatives for better accuracy
    
    speechRecognition.onstart = () => {
      setIsListening(true)
      console.log('Voice: Listening started')
    }
    
    speechRecognition.onresult = (event: any) => {
      // Ignore results if AI is speaking (backup check)
      if (isSpeakingRef.current) {
        console.log('Ignoring speech result - AI is speaking')
        return
      }
      
      const current = event.resultIndex
      const result = event.results[current]
      const transcript = result[0].transcript
      const confidence = result[0].confidence
      
      // Log confidence for debugging
      if (result.isFinal) {
        console.log('Recognition confidence:', confidence || 'N/A')
        
        // Check alternatives if confidence is low
        if (confidence && confidence < 0.8 && result.length > 1) {
          console.log('Low confidence, alternatives available:')
          for (let i = 1; i < Math.min(result.length, 3); i++) {
            console.log(`  Alt ${i}: "${result[i].transcript}" (conf: ${result[i].confidence})`)
          }
        }
      }
      
      // Clear any existing silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      
      if (result.isFinal) {
        // Final result - add to accumulated transcript
        accumulatedTranscriptRef.current += (accumulatedTranscriptRef.current ? ' ' : '') + transcript
        console.log('Final segment:', transcript)
        console.log('Accumulated so far:', accumulatedTranscriptRef.current)
        
        // Track voice activity for intervention system
        lastVoiceActivityRef.current = Date.now()
        
        // Show accumulated transcript
        setTranscript(accumulatedTranscriptRef.current)
        
        // Reduced silence timeout for faster response (1000ms instead of 1500ms)
        silenceTimerRef.current = setTimeout(() => {
          const fullText = accumulatedTranscriptRef.current.trim()
          if (fullText) {
            console.log('Processing full statement:', fullText)
            processUserSpeech(fullText)
            accumulatedTranscriptRef.current = ''
            setTranscript('')
          }
        }, 1000) // Reduced from 1500ms to 1000ms for faster response
        
        // Since we're in non-continuous mode, restart recognition
        setTimeout(() => {
          if (!isSpeaking && recognition) {
            try {
              recognition.start()
              console.log('Restarted recognition after final result')
            } catch (e) {
              console.log('Recognition already started:', e)
            }
          }
        }, 100)
        
      } else {
        // Show interim results
        const tempTranscript = accumulatedTranscriptRef.current + 
          (accumulatedTranscriptRef.current ? ' ' : '') + transcript
        setTranscript(tempTranscript)
      }
    }
    
    speechRecognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error, event)
      
      // Handle different error types
      switch(event.error) {
        case 'no-speech':
          console.log('No speech detected - restarting...')
          setTimeout(() => {
            if (recognition && !isSpeaking) {
              try {
                recognition.start()
              } catch (e) {
                console.log('Failed to restart after no-speech:', e)
              }
            }
          }, 100)
          break
          
        case 'aborted':
          console.log('Recognition aborted - restarting...')
          setTimeout(() => startListening(), 200)
          break
          
        case 'audio-capture':
          console.error('Microphone error - check permissions')
          alert('Microphone access error. Please check your microphone and permissions.')
          break
          
        case 'network':
          console.error('Network error - retrying...')
          setTimeout(() => startListening(), 1000)
          break
          
        case 'not-allowed':
          console.error('Microphone permission denied')
          alert('Microphone permission denied. Please allow microphone access and refresh.')
          break
          
        default:
          console.log('Unknown error, attempting restart...')
          setTimeout(() => startListening(), 500)
      }
    }
    
    speechRecognition.onend = () => {
      console.log('Voice: Recognition ended')
      
      // Process any remaining accumulated text if silence timer hasn't fired
      if (accumulatedTranscriptRef.current.trim() && !silenceTimerRef.current) {
        const fullText = accumulatedTranscriptRef.current.trim()
        console.log('Processing remaining text on end:', fullText)
        processUserSpeech(fullText)
        accumulatedTranscriptRef.current = ''
        setTranscript('')
      }
      
      // Auto-restart for continuous listening experience
      // Only restart if not speaking and not processing
      if (!isSpeaking && !isProcessing) {
        setTimeout(() => {
          console.log('Auto-restarting recognition...')
          try {
            speechRecognition.start()
            setIsListening(true)
          } catch (e: any) {
            if (e.message && e.message.includes('already started')) {
              console.log('Recognition already running')
            } else {
              console.log('Restart failed, retrying:', e.message)
              // Retry once more after a short delay
              setTimeout(() => {
                try {
                  speechRecognition.start()
                  setIsListening(true)
                  console.log('Restart successful on retry')
                } catch (e2) {
                  console.error('Failed to restart recognition:', e2)
                }
              }, 500)
            }
          }
        }, 100) // Quick restart for seamless experience
      } else {
        console.log('Not restarting - speaking or processing')
      }
    }
    
    setRecognition(speechRecognition)
    
    // Try to get enhanced audio stream (optional enhancement)
    try {
      // Get high-quality audio stream with preprocessing
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,      // Remove echo from speakers
          noiseSuppression: true,      // Remove background noise (fans, typing)
          autoGainControl: true,       // Normalize volume levels
          sampleRate: 44100,          // High quality sample rate
          channelCount: 1,            // Mono is sufficient for speech
          latency: 0,                 // Request low latency
          sampleSize: 16              // 16-bit audio depth
        }
      })
      
      console.log('Got enhanced audio stream with noise suppression')
      
      // Optional: Create audio context for additional processing if needed
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContext.createMediaStreamSource(stream)
      
      // Monitor audio levels (optional - for debugging)
      const analyser = audioContext.createAnalyser()
      source.connect(analyser)
      analyser.fftSize = 256
      
      // Monitor audio levels for visual feedback
      const checkAudioLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        
        // Update audio level for UI (normalized 0-100)
        const normalizedLevel = Math.min(100, Math.round((average / 128) * 100))
        setAudioLevel(normalizedLevel)
        
        if (average > 20) { // Log significant audio
          console.log('Audio level:', Math.round(average), 'Normalized:', normalizedLevel)
        }
      }
      
      // Check audio level more frequently for smoother visualization
      setInterval(checkAudioLevel, 100) // Every 100ms
      
    } catch (error) {
      console.warn('Could not get enhanced audio stream, using default:', error)
      // Speech recognition will still work with default audio
    }
    
    // Start listening after delay
    setTimeout(() => startListening(), 2000)
  }
  
  const startListening = () => {
    if (recognition && !isSpeaking) {
      try {
        recognition.start()
        setIsListening(true)
        console.log('Started listening')
      } catch (e: any) {
        if (e.message && e.message.includes('already started')) {
          console.log('Recognition already active')
          setIsListening(true)
        } else {
          console.error('Failed to start recognition:', e)
          // Retry after a short delay
          setTimeout(() => {
            try {
              recognition.start()
              setIsListening(true)
              console.log('Started listening on retry')
            } catch (retryError) {
              console.error('Retry failed:', retryError)
            }
          }, 500)
        }
      }
    } else if (isSpeaking) {
      console.log('Not starting - AI is speaking')
    } else if (!recognition) {
      console.log('Recognition not initialized')
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
    console.log('=== SPEAK CALLED ===')
    console.log('Text to speak:', text)
    console.log('Currently speaking?', isSpeakingRef.current)
    console.log('Last spoken text:', lastSpokenTextRef.current)
    
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
        console.log('Canceling existing audio')
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }
      window.speechSynthesis.cancel() // Cancel any browser TTS
      
      // IMPORTANT: Stop listening while AI speaks to prevent feedback
      stopListening()
      setIsSpeaking(true)
      isSpeakingRef.current = true
      lastSpokenTextRef.current = text
      console.log('AI speaking (mic paused):', text)
      
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
        isSpeakingRef.current = false
        console.log('AI finished speaking - restarting mic')
        URL.revokeObjectURL(audioUrl)
        currentAudioRef.current = null
        lastSpokenTextRef.current = "" // Clear last spoken text
        
        // Process any pending stage transition
        if (pendingStageTransitionRef.current) {
          const nextStage = pendingStageTransitionRef.current
          console.log(`Processing delayed stage transition: ${stageRef.current} → ${nextStage}`)
          
          // If transitioning to coding, first get approach summary
          if (nextStage === 'coding' && stageRef.current === 'problem_discussion') {
            console.log('Transitioning to coding - getting approach summary')
            const problem_discussionHistory = stageHistories.current['problem_discussion'] || []
            if (problem_discussionHistory.length > 0) {
              // Make API call to summarize approach
              fetch('/api/interview-agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  agentType: 'approach_summary',
                  stage: 'problem_discussion',
                  sessionId,
                  personality,
                  history: problem_discussionHistory
                })
              }).then(res => res.json()).then(summaryData => {
                approachSummaryRef.current = summaryData.message
                console.log('Approach summary stored:', summaryData.message)
              }).catch(err => {
                console.error('Failed to get approach summary:', err)
              })
            }
          }
          
          stageRef.current = nextStage
          setStage(nextStage as InterviewStage)
          
          // Handle specific stage transitions
          if (nextStage === 'problem_introduction' && !hasAskedForThoughtsRef.current) {
            hasAskedForThoughtsRef.current = true
            setTimeout(() => {
              console.log('Calling problem_discussion after transition')
              // Only call if not already speaking
              if (!isSpeakingRef.current) {
                callAgent('problem_discussion', null, nextStage)
              } else {
                console.log('Skipping problem_discussion - still speaking')
                // Try again later
                setTimeout(() => {
                  if (!isSpeakingRef.current) {
                    callAgent('problem_discussion', null, nextStage)
                  }
                }, 2000)
              }
            }, 3000)
          }
          
          pendingStageTransitionRef.current = null
        }
        
        // Restart listening after AI finishes
        setTimeout(() => {
          startListening()
        }, 100)
      }
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e)
        setIsSpeaking(false)
        isSpeakingRef.current = false
        currentAudioRef.current = null
        // Restart mic before fallback
        startListening()
        // Fallback to browser TTS
        fallbackSpeak(text)
      }
      
      await audio.play()
      console.log('Audio playback started successfully')
      
    } catch (error) {
      console.error('OpenAI TTS error:', error)
      // Fallback to browser TTS
      fallbackSpeak(text)
    }
  }
  
  const fallbackSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop mic first to prevent feedback
      stopListening()
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      
      utterance.onstart = () => {
        setIsSpeaking(true)
        isSpeakingRef.current = true
        console.log('AI speaking (fallback TTS) - mic paused')
      }
      utterance.onend = () => {
        setIsSpeaking(false)
        isSpeakingRef.current = false
        console.log('AI finished speaking (fallback) - restarting mic')
        
        // Process any pending stage transition
        if (pendingStageTransitionRef.current) {
          const nextStage = pendingStageTransitionRef.current
          console.log(`Processing delayed stage transition: ${stageRef.current} → ${nextStage}`)
          stageRef.current = nextStage
          setStage(nextStage as InterviewStage)
          
          // Handle specific stage transitions
          if (nextStage === 'problem_introduction' && !hasAskedForThoughtsRef.current) {
            hasAskedForThoughtsRef.current = true
            setTimeout(() => {
              console.log('Calling problem_discussion after transition')
              // Only call if not already speaking
              if (!isSpeakingRef.current) {
                callAgent('problem_discussion', null, nextStage)
              } else {
                console.log('Skipping problem_discussion - still speaking')
                // Try again later
                setTimeout(() => {
                  if (!isSpeakingRef.current) {
                    callAgent('problem_discussion', null, nextStage)
                  }
                }, 2000)
              }
            }, 3000)
          }
          
          pendingStageTransitionRef.current = null
        }
        
        // Restart listening after fallback TTS finishes
        setTimeout(() => {
          startListening()
        }, 100)
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
    
    // Determine the actual stage first
    const actualStage = stageOverride || stageRef.current || stage
    
    try {
      // COMPLETE ISOLATION - Each stage has its own separate history
      let history = stageHistories.current[actualStage] || []
      
      // Limit history per stage to prevent context overflow
      const maxHistoryPerStage = {
        greeting: 4,        // 2 exchanges
        problem_introduction: 2, // 1 exchange  
        problem_discussion: 4,   // 2 exchanges
        coding: 6,          // 3 exchanges
        testing: 4          // 2 exchanges
      }
      
      // Trim history if too long
      const maxItems = maxHistoryPerStage[actualStage as keyof typeof maxHistoryPerStage] || 4
      if (history.length > maxItems) {
        history = history.slice(-maxItems)
      }
      
      // Add current message if provided (but not for AI interventions)
      if (userMessage && agentType !== 'coding_intervention') {
        history = [...history, {role: 'user', content: userMessage}]
      }
      
      console.log(`Sending ${actualStage} history to API:`, history.length, 'messages (ISOLATED)')
      console.log('Stage-specific history:', JSON.stringify(history, null, 2))
      
      // Debug logging for stage and question
      console.log('=== API CALL DEBUG ===')
      console.log('Stage from state:', stage)
      console.log('Stage from ref:', stageRef.current)
      console.log('Stage override:', stageOverride)
      console.log('Actual stage being sent:', actualStage)
      console.log('Question from state:', currentQuestion ? currentQuestion.substring(0, 50) + '...' : 'NO QUESTION')
      console.log('Question from ref:', currentQuestionRef.current ? currentQuestionRef.current.substring(0, 50) + '...' : 'NO QUESTION IN REF')
      console.log('====================')
      
      // Call the appropriate agent endpoint
      const response = await fetch('/api/interview-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          stage: actualStage,  // Use ref as primary source
          sessionId,
          personality,
          userMessage,
          code: actualStage === 'coding' ? (codeRef.current || code) : undefined,
          question: currentQuestionRef.current || currentQuestion, // Use ref as primary source,
          history,
          approachSummary: actualStage === 'coding' ? approachSummaryRef.current : undefined
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
      
      // Don't add intervention types as user messages
      const isIntervention = agentType === 'coding_intervention'
      
      // Update stage-specific history
      const currentStageHistory = stageHistories.current[actualStage] || []
      const newStageHistory = userMessage && !isIntervention
        ? [...currentStageHistory, 
           {role: 'user', content: userMessage},
           {role: 'assistant', content: data.message}]
        : [...currentStageHistory, 
           {role: 'assistant', content: data.message}];
      
      // Update stage-specific history
      stageHistories.current[actualStage] = newStageHistory
      
      // Also update global history for UI display (but stages remain isolated)
      const newHistory = userMessage && !isIntervention
        ? [...conversationHistoryRef.current, 
           {role: 'user', content: userMessage},
           {role: 'assistant', content: data.message}]
        : [...conversationHistoryRef.current, 
           {role: 'assistant', content: data.message}];
      
      setConversationHistory(newHistory)
      conversationHistoryRef.current = newHistory
      console.log(`Updated ${actualStage} stage history:`, newStageHistory.length, 'items')
      console.log('Stage-isolated history:', newStageHistory)
      console.log('Global history (for UI):', newHistory.length, 'items')
      
      // NOW handle stage transitions with updated history
      if (data.nextStage) {
        console.log(`Stage transition pending: ${stage} → ${data.nextStage}`)
        console.log(`Will transition after AI finishes speaking`)
        console.log(`AgentType was: ${data.agentType}`)
        
        // Store the pending transition - will be processed after AI finishes speaking
        pendingStageTransitionRef.current = data.nextStage
        console.log(`Pending transition stored: ${data.nextStage}`)
      } else {
        console.log('No stage transition suggested by agent')
      }
      
      // Show and speak the response
      setAiMessage(data.message)
      // Add small delay to prevent double calls from re-renders
      setTimeout(() => {
        if (!isSpeakingRef.current) {
          speak(data.message)
        } else {
          console.log('Skipping speak - already speaking')
        }
      }, 100)
      
    } catch (error) {
      console.error('Error calling agent:', error)
      const fallback = "Let me think about that for a moment."
      setAiMessage(fallback)
      // Add delay here too
      setTimeout(() => {
        if (!isSpeakingRef.current) {
          speak(fallback)
        }
      }, 100)
    } finally {
      setIsProcessing(false)
    }
  }
  
  const processUserSpeech = async (text: string) => {
    // Don't process if already processing or if AI is speaking
    if (isProcessing || isSpeakingRef.current) {
      console.log('Skipping speech processing - busy (processing:', isProcessing, ', speaking:', isSpeakingRef.current, ')')
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
        // Problem discussion agent handles all problem-related discussion
        console.log('Problem introduction stage - processing response')
        // Always use problem_discussion agent
        await callAgent('problem_discussion', text)
        break
        
      case 'problem_discussion':
        // Problem discussion agent handles questions and approach discussion
        console.log('Problem discussion stage - processing:', text)
        // Let the agent handle all discussion and transition logic
        await callAgent('problem_discussion', text)
        break
        
      case 'coding':
        // Coding agent provides help during coding
        console.log('In coding stage - processing:', text)
        // Always stay in coding stage once we're here
        await callAgent('coding_help', text)
        break
        
      case 'testing':
        // Testing agent handles test discussions
        await callAgent('testing', text)
        break
    }
  }
  
  // Code monitoring and intelligent intervention system
  const analyzeCodeProgress = () => {
    if (stageRef.current !== 'coding') return
    
    const currentTime = Date.now()
    const timeSinceLastCode = (currentTime - lastCodeChangeRef.current) / 1000 // seconds
    const timeSinceLastVoice = (currentTime - lastVoiceActivityRef.current) / 1000
    const timeSinceLastIntervention = (currentTime - lastInterventionRef.current) / 1000
    
    console.log('Code analysis:', {
      timeSinceLastCode,
      timeSinceLastVoice,
      timeSinceLastIntervention,
      interventionCount: interventionCountRef.current
    })
    
    // Much more conservative - minimum 5 minutes between interventions
    if (timeSinceLastIntervention < 300) {
      console.log('Too soon since last intervention, skipping')
      return
    }
    
    // Only intervene after 2 interventions if really necessary
    if (interventionCountRef.current >= 2 && timeSinceLastIntervention < 600) {
      console.log('Too many interventions already, being less intrusive')
      return
    }
    
    // Very conservative intervention triggers
    if (timeSinceLastCode > 360 && timeSinceLastVoice > 180) {
      // User seems stuck - 6 minutes no code + 3 minutes no voice
      console.log('Triggering stuck intervention')
      triggerIntervention('stuck')
    } else if (timeSinceLastCode > 420) {
      // No code changes for 7+ minutes
      console.log('Triggering no_progress intervention')
      triggerIntervention('no_progress')
    } else if (detectFunctionCompletion(codeRef.current || code)) {
      // User just completed a function - only if 6+ minutes passed
      if (timeSinceLastIntervention > 360) {
        console.log('Triggering function_complete intervention')
        triggerIntervention('function_complete')
      }
    }
  }
  
  const detectFunctionCompletion = (currentCode: string) => {
    // Simple heuristic: check if user just closed a function
    const lines = currentCode.split('\n')
    const lastNonEmptyLine = lines.filter(l => l.trim()).pop()
    const prevCode = lastCodeRef.current
    
    // Check if user just added a closing brace after content
    if (lastNonEmptyLine === '}' && prevCode && prevCode.length < currentCode.length) {
      const funcCount = (currentCode.match(/function/g) || []).length
      const prevFuncCount = (prevCode.match(/function/g) || []).length
      return funcCount === prevFuncCount && currentCode.includes('return')
    }
    return false
  }
  
  const triggerIntervention = async (type: string) => {
    // Don't trigger if already processing or speaking
    if (isProcessing || isSpeaking) {
      console.log('Skipping intervention - already processing or speaking')
      return
    }
    
    console.log('Triggering intervention:', type)
    lastInterventionRef.current = Date.now()
    interventionCountRef.current++
    
    // Don't pass message as userMessage - let AI generate its own intervention
    // Pass the intervention type instead
    await callAgent('coding_intervention', type, 'coding')
  }
  
  // Set up code monitoring when in coding stage
  useEffect(() => {
    if (stage === 'coding') {
      // Reset all timestamps when entering coding stage to prevent immediate triggers
      console.log('Entering coding stage - resetting intervention timestamps')
      lastInterventionRef.current = Date.now()
      lastCodeChangeRef.current = Date.now()
      lastVoiceActivityRef.current = Date.now()
      interventionCountRef.current = 0
      
      // Wait 5 minutes before starting ANY monitoring to let user get settled
      const startMonitoringDelay = setTimeout(() => {
        console.log('Starting code monitoring after 5min delay')
        
        // Check every 90 seconds for intervention opportunities (much less frequent)
        const monitoringInterval = setInterval(() => {
          analyzeCodeProgress()
        }, 90000) // Check every 90 seconds instead of 60
        
        // Store for cleanup
        interventionTimerRef.current = monitoringInterval as any
        
        return () => clearInterval(monitoringInterval)
      }, 300000) // 5 minute delay before monitoring starts
      
      // NO first check-in - it's annoying
      const firstCheckIn = null
      
      return () => {
        clearTimeout(startMonitoringDelay)
        clearTimeout(firstCheckIn)
        if (interventionTimerRef.current) {
          clearInterval(interventionTimerRef.current as any)
        }
      }
    }
  }, [stage])
  
  // Track code changes with debouncing
  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    codeRef.current = newCode // Update ref for reliable access
    lastCodeChangeRef.current = Date.now()
    
    // Clear existing timer
    if (codeAnalysisTimerRef.current) {
      clearTimeout(codeAnalysisTimerRef.current)
    }
    
    // Debounce code analysis - analyze after 2 seconds of no typing
    codeAnalysisTimerRef.current = setTimeout(() => {
      if (stageRef.current === 'coding' && newCode !== lastCodeRef.current) {
        lastCodeRef.current = newCode
        // Could send code to AI for analysis here if needed
        console.log('Code changed, lines:', newCode.split('\n').length)
      }
    }, 2000)
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
              className="h-full flex flex-col"
            >
              {/* Collapsible Problem Statement */}
              <div className="border-b border-gray-800 bg-gray-900/50">
                <button
                  onClick={() => setShowQuestionInCoding(!showQuestionInCoding)}
                  className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Code2 className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-mono text-gray-400">
                      Problem Statement {showQuestionInCoding ? '(click to hide)' : '(click to show)'}
                    </span>
                  </div>
                  {showQuestionInCoding ? 
                    <ChevronUp className="h-3 w-3 text-gray-500" /> : 
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  }
                </button>
                
                {showQuestionInCoding && (
                  <div className="px-4 pb-3 max-h-48 overflow-y-auto border-b border-gray-800">
                    <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap bg-gray-900 rounded p-3">
                      {currentQuestion || "Loading problem..."}
                    </pre>
                  </div>
                )}
              </div>
              
              {/* Main coding area */}
              <div className="flex-1 flex">
                {/* Code Editor */}
                <div className="flex-1 flex flex-col">
                  <div className="border-b border-gray-800 px-4 py-2 bg-gray-900/50">
                    <span className="text-xs font-mono text-gray-400">solution.js</span>
                  </div>
                  
                  <div className="flex-1">
                    <MonacoEditor
                      height="100%"
                      language="javascript"
                      theme="vs-dark"
                      value={code}
                      onChange={(value) => handleCodeChange(value || '')}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineHeight: 22,
                        padding: { top: 16, bottom: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,  // Python standard is 4 spaces
                        insertSpaces: true,
                        detectIndentation: false,
                        wordWrap: 'on',
                        autoIndent: 'full',  // Smart indentation
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: {
                          other: true,
                          comments: false,
                          strings: false
                        },
                        parameterHints: { enabled: true },
                        formatOnPaste: true,
                        formatOnType: true,
                        acceptSuggestionOnCommitCharacter: true,
                        acceptSuggestionOnTab: false,  // Allow tab to insert tabs
                        snippetSuggestions: 'inline',
                        suggest: {
                          showKeywords: true,
                          showSnippets: true,
                        },
                        tabCompletion: 'off'  // Disable tab completion
                      }}
                    />
                  </div>
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
              </div>{/* Close Main coding area div */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
"use client"

import {useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Mic, Play} from "lucide-react"

const MainButton = ({
                        onFetchQuestion,
                        onSendResponse,
                        isSpeaking, // Add this prop to check if AI is speaking
                    }: {
    onFetchQuestion: () => void
    onSendResponse: (spokenText: string) => void
    isSpeaking: boolean // AI speaking state from the parent
}) => {
    const [isInterviewStarted, setIsInterviewStarted] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)

    useEffect(() => {
        if ("webkitSpeechRecognition" in window) {
            const speechRecognition = new (window as any).webkitSpeechRecognition()
            speechRecognition.continuous = false
            speechRecognition.interimResults = false
            speechRecognition.lang = "en-US"

            speechRecognition.onstart = () => setIsListening(true)
            speechRecognition.onend = () => setIsListening(false)

            speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
                const spokenText = event.results[0][0].transcript.trim()
                console.log("Captured Speech:", spokenText)
                onSendResponse(spokenText)
            }

            setRecognition(speechRecognition)
        } else {
            console.error("SpeechRecognition is not supported in this browser.")
        }
    }, [onSendResponse])

    const handleFetchQuestion = () => {
        onFetchQuestion()
        setIsInterviewStarted(true)
    }

    const startListening = () => {
        if (recognition && !isListening) {
            recognition.start()
        }
    }

    return (
        <Button
            onClick={isInterviewStarted ? startListening : handleFetchQuestion}
            disabled={isSpeaking} // Disable button if AI is speaking
            size="lg"
            className={`w-full sm:w-[300px] py-4 ${
                isListening ? "bg-orange-500 hover:bg-orange-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
            {isInterviewStarted ? (
                isListening ? (
                    <>
                        <Mic className="mr-2 h-4 w-4 animate-pulse"/>
                        Listening...
                    </>
                ) : (
                    <>
                        <Mic className="mr-2 h-4 w-4"/>
                        Tell Your Thoughts
                    </>
                )
            ) : (
                <>
                    <Play className="mr-2 h-4 w-4"/>
                    Start Interview
                </>
            )}
        </Button>
    )
}

export default MainButton

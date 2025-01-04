//
//
// "use client";
// import axios from "axios";
// import { useState, useEffect } from "react";
//
// const MainButton = ({
//                         onFetchQuestion,
//                         onSendResponse,
//                     }: {
//     onFetchQuestion: (question: string) => void;
//     onSendResponse: (spokenText: string) => void;
// }) => {
//     const [isInterviewStarted, setIsInterviewStarted] = useState(false);
//     const [isListening, setIsListening] = useState(false);
//     const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
//
//     // Initialize Speech Recognition
//     useEffect(() => {
//         if ("webkitSpeechRecognition" in window) {
//             const speechRecognition = new (window as any).webkitSpeechRecognition();
//             speechRecognition.continuous = false;
//             speechRecognition.interimResults = false;
//             speechRecognition.lang = "en-US";
//
//             speechRecognition.onstart = () => setIsListening(true);
//             speechRecognition.onend = () => setIsListening(false);
//
//             speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
//                 const spokenText = event.results[0][0].transcript.trim();
//                 console.log("Captured Speech:", spokenText);
//                 onSendResponse(spokenText); // Send the captured text to the parent
//             };
//
//             setRecognition(speechRecognition);
//         } else {
//             console.error("SpeechRecognition is not supported in this browser.");
//         }
//     }, [onSendResponse]);
//
//     const fetchAQuestion = async () => {
//         try {
//             const response = await axios.post(`/api/getQuestion`);
//             const fetchedQuestion = response.data.question?.trim();
//             if (fetchedQuestion) {
//                 onFetchQuestion(fetchedQuestion); // Pass the question to the parent
//                 setIsInterviewStarted(true); // Update button state
//             }
//         } catch (err) {
//             console.error("Error fetching the question:", err);
//         }
//     };
//
//     const startListening = () => {
//         if (recognition && !isListening) {
//             recognition.start();
//         }
//     };
//
//     return (
//         <button
//             onClick={isInterviewStarted ? startListening : fetchAQuestion}
//             className="mt-6 p-3 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-all"
//         >
//             {isInterviewStarted
//                 ? isListening
//                     ? "Listening..."
//                     : "Tell Your Thoughts to the Interviewer"
//                 : "Start Interview"}
//         </button>
//     );
// };
//
// export default MainButton;


//
// "use client"
//
// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Mic, Play } from 'lucide-react'
// import axios from "axios"
//
// const MainButton = ({
//                         onFetchQuestion,
//                         onSendResponse,
//                     }: {
//     onFetchQuestion: (question: string) => void
//     onSendResponse: (spokenText: string) => void
// }) => {
//     const [isInterviewStarted, setIsInterviewStarted] = useState(false)
//     const [isListening, setIsListening] = useState(false)
//     const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
//
//     useEffect(() => {
//         if ("webkitSpeechRecognition" in window) {
//             const speechRecognition = new (window as any).webkitSpeechRecognition()
//             speechRecognition.continuous = false
//             speechRecognition.interimResults = false
//             speechRecognition.lang = "en-US"
//
//             speechRecognition.onstart = () => setIsListening(true)
//             speechRecognition.onend = () => setIsListening(false)
//
//             speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
//                 const spokenText = event.results[0][0].transcript.trim()
//                 console.log("Captured Speech:", spokenText)
//                 onSendResponse(spokenText)
//             }
//
//             setRecognition(speechRecognition)
//         } else {
//             console.error("SpeechRecognition is not supported in this browser.")
//         }
//     }, [onSendResponse])
//
//     const fetchAQuestion = async () => {
//         try {
//             const response = await axios.post(`/api/getQuestion`)
//             const fetchedQuestion = response.data.question?.trim()
//             if (fetchedQuestion) {
//                 onFetchQuestion(fetchedQuestion)
//                 setIsInterviewStarted(true)
//             }
//         } catch (err) {
//             console.error("Error fetching the question:", err)
//         }
//     }
//
//     const startListening = () => {
//         if (recognition && !isListening) {
//             recognition.start()
//         }
//     }
//
//     return (
//         <Button
//             onClick={isInterviewStarted ? startListening : fetchAQuestion}
//             size="lg"
//             className="w-full sm:w-[300px] py-4"
//         >
//             {isInterviewStarted ? (
//                 isListening ? (
//                     <>
//                         <Mic className="mr-2 h-4 w-4 animate-pulse" />
//                         Listening...
//                     </>
//                 ) : (
//                     <>
//                         <Mic className="mr-2 h-4 w-4" />
//                         Tell Your Thoughts
//                     </>
//                 )
//             ) : (
//                 <>
//                     <Play className="mr-2 h-4 w-4" />
//                     Start Interview
//                 </>
//             )}
//         </Button>
//     )
// }
//
// export default MainButton
//




"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Play } from "lucide-react"

const MainButton = ({
                        onFetchQuestion,
                        onSendResponse,
                    }: {
    onFetchQuestion: () => void // Parent handles API call
    onSendResponse: (spokenText: string) => void
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
        onFetchQuestion() // Call the parent's API function
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
            size="lg"
            className="w-full sm:w-[300px] py-4"
        >
            {isInterviewStarted ? (
                isListening ? (
                    <>
                        <Mic className="mr-2 h-4 w-4 animate-pulse" />
                        Listening...
                    </>
                ) : (
                    <>
                        <Mic className="mr-2 h-4 w-4" />
                        Tell Your Thoughts
                    </>
                )
            ) : (
                <>
                    <Play className="mr-2 h-4 w-4" />
                    Start Interview
                </>
            )}
        </Button>
    )
}

export default MainButton

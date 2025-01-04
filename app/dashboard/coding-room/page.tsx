//
//
// 'use client'
//
// import { useState } from "react"
// import Header from "@/components/Header"
// import Question from "@/components/Question"
// import CodeEditor from "@/components/CodeEditor"
// import MainButton from "@/components/MainButton"
// import AIVoiceAnimation from "@/components/AIVoiceAnimation"
// import Transcription from "@/components/Transcription"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//
// export default function InterviewRoom() {
//     const [currentQuestion, setCurrentQuestion] = useState<string>("")
//     const [aiResponse, setAiResponse] = useState<string>("")
//     const [transcription, setTranscription] = useState<Array<{ speaker: string; text: string }>>([])
//     const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
//     const [currentCode, setCurrentCode] = useState<string>("")
//
//     const startConversationWithAI = async (codingQuestion: string) => {
//         try {
//             const response = await fetch("/api/conversationalInterface", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ codingQuestion }),
//             })
//
//             const data = await response.json()
//             const aiResponseText = data.response
//
//             setAiResponse(aiResponseText)
//             setTranscription((prev) => [...prev, { speaker: "AI", text: aiResponseText }])
//             speakResponse(aiResponseText)
//         } catch (error) {
//             console.error("Error starting conversation with AI:", error)
//         }
//     }
//
//     const sendUserResponseToAI = async (spokenText: string) => {
//         try {
//             const response = await fetch("/api/conversationalInterface", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ message: spokenText, code: currentCode }),
//             })
//
//             const result = await response.json()
//             const aiResponseText = result.response
//
//             setTranscription((prev) => [
//                 ...prev,
//                 { speaker: "User", text: spokenText },
//                 { speaker: "AI", text: aiResponseText },
//             ])
//
//             speakResponse(aiResponseText)
//         } catch (error) {
//             console.error("Error sending user response to the API:", error)
//         }
//     }
//
//     const speakResponse = (text: string) => {
//         if ("speechSynthesis" in window) {
//             const utterance = new SpeechSynthesisUtterance(text)
//             utterance.onstart = () => setIsSpeaking(true)
//             utterance.onend = () => setIsSpeaking(false)
//             speechSynthesis.speak(utterance)
//         } else {
//             console.error("Text-to-Speech is not supported in this browser.")
//         }
//     }
//
//     const handleFetchQuestion = (question: string) => {
//         setCurrentQuestion(question)
//         startConversationWithAI(question)
//     }
//
//     return (
//         <div className="flex flex-col min-h-screen bg-gray-100">
//             <Header />
//             <main className="flex-grow container mx-auto px-4 py-4 flex flex-col h-[calc(100vh-40px)]">
//                 <div className="flex flex-col lg:flex-row gap-8 h-full">
//                     <div className="flex-grow lg:w-3/5 flex flex-col space-y-4">
//                         <Question question={currentQuestion} />
//                         <CodeEditor onCodeChange={setCurrentCode}  />
//                         <div className="flex justify-center">
//                             <MainButton
//                                 onFetchQuestion={handleFetchQuestion}
//                                 onSendResponse={sendUserResponseToAI}
//                             />
//                         </div>
//                     </div>
//                     <div className="lg:w-2/5 flex flex-col space-y-4">
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>AI Interviewer</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <AIVoiceAnimation isSpeaking={isSpeaking} />
//                             </CardContent>
//                         </Card>
//                         <Card>
//                             <CardHeader>
//                                 <CardTitle>Conversation</CardTitle>
//                             </CardHeader>
//                             <CardContent>
//                                 <Transcription transcription={transcription} />
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             </main>
//         </div>
//     )
// }
//



'use client'

import { useState } from "react"
import Header from "@/components/Header"
import Question from "@/components/Question"
import CodeEditor from "@/components/CodeEditor"
import MainButton from "@/components/MainButton"
import AIVoiceAnimation from "@/components/AIVoiceAnimation"
import Transcription from "@/components/Transcription"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InterviewRoom() {
    const [currentQuestion, setCurrentQuestion] = useState<string>("")
    const [aiResponse, setAiResponse] = useState<string>("")
    const [transcription, setTranscription] = useState<Array<{ speaker: string; text: string }>>([])
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
    const [currentCode, setCurrentCode] = useState<string>("")

    const startConversationWithAI = async (codingQuestion: string) => {
        try {
            const response = await fetch("/api/conversationalInterface", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ codingQuestion }),
            })

            const data = await response.json()
            const aiResponseText = data.response

            setAiResponse(aiResponseText)
            setTranscription((prev) => [...prev, { speaker: "AI", text: aiResponseText }])
            speakResponse(aiResponseText)
        } catch (error) {
            console.error("Error starting conversation with AI:", error)
        }
    }

    const sendUserResponseToAI = async (spokenText: string) => {
        try {
            const response = await fetch("/api/conversationalInterface", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: spokenText, code: currentCode }),
            })

            const result = await response.json()
            const aiResponseText = result.response

            setTranscription((prev) => [
                ...prev,
                { speaker: "User", text: spokenText },
                { speaker: "AI", text: aiResponseText },
            ])

            speakResponse(aiResponseText)
        } catch (error) {
            console.error("Error sending user response to the API:", error)
        }
    }

    const speakResponse = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => setIsSpeaking(false)
            speechSynthesis.speak(utterance)
        } else {
            console.error("Text-to-Speech is not supported in this browser.")
        }
    }

    const handleFetchQuestion = (question: string) => {
        setCurrentQuestion(question)
        startConversationWithAI(question)
    }

    const handleEndInterview = async () => {
        try {
            const response = await fetch("/api/endInterview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: currentQuestion,
                    transcription,
                }),
            })

            if (response.ok) {
                console.log("Interview data sent successfully!")
            } else {
                console.error("Failed to send interview data.")
            }
        } catch (error) {
            console.error("Error ending interview:", error)
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <Header onEndInterview={handleEndInterview} />
            <main className="flex-grow container mx-auto px-4 py-4 flex flex-col h-[calc(100vh-40px)]">
                <div className="flex flex-col lg:flex-row gap-8 h-full">
                    <div className="flex-grow lg:w-3/5 flex flex-col space-y-4">
                        <Question question={currentQuestion} />
                        <CodeEditor onCodeChange={setCurrentCode}  />
                        <div className="flex justify-center">
                            <MainButton
                                onFetchQuestion={handleFetchQuestion}
                                onSendResponse={sendUserResponseToAI}
                            />
                        </div>
                    </div>
                    <div className="lg:w-2/5 flex flex-col space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Interviewer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AIVoiceAnimation isSpeaking={isSpeaking} />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Transcription transcription={transcription} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

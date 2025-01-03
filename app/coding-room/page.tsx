//
//
//
// "use client";
//
// import { useState } from "react";
// import Header from "@/components/Header";
// import Question from "@/components/Question";
// import CodeEditor from "@/components/CodeEditor";
// import MainButton from "@/components/MainButton";
// import AIVoiceAnimation from "@/components/AIVoiceAnimation";
// import Transcription from "@/components/Transcription";
//
// export default function InterviewRoom() {
//     const [currentQuestion, setCurrentQuestion] = useState<string>(""); // Current coding question
//     const [aiResponse, setAiResponse] = useState<string>(""); // AI's latest response
//     const [transcription, setTranscription] = useState<Array<{ speaker: string; text: string }>>([]); // Full transcript
//     const [isSpeaking, setIsSpeaking] = useState<boolean>(false); // Control AI voice animation
//
//     /**
//      * Starts the AI conversation by sending the coding question
//      */
//     const startConversationWithAI = async (codingQuestion: string) => {
//         try {
//             const response = await fetch("/api/conversationalInterface", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ codingQuestion }),
//             });
//
//             const data = await response.json();
//             const aiResponseText = data.response;
//
//             // Update AI response and transcription
//             setAiResponse(aiResponseText);
//             setTranscription((prev) => [...prev, { speaker: "AI", text: aiResponseText }]);
//
//             // Speak the AI response
//             speakResponse(aiResponseText);
//         } catch (error) {
//             console.error("Error starting conversation with AI:", error);
//         }
//     };
//
//     /**
//      * Handles user's verbal response
//      */
//     const sendUserResponseToAI = async (spokenText: string) => {
//         try {
//             const response = await fetch("/api/conversationalInterface", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ message: spokenText }),
//             });
//
//             const result = await response.json();
//             const aiResponseText = result.response;
//
//             // Update transcription with user input and AI response
//             setTranscription((prev) => [
//                 ...prev,
//                 { speaker: "User", text: spokenText },
//                 { speaker: "AI", text: aiResponseText },
//             ]);
//
//             // Speak the AI response
//             speakResponse(aiResponseText);
//         } catch (error) {
//             console.error("Error sending user response to the API:", error);
//         }
//     };
//
//     /**
//      * Speaks the AI's response and controls voice animation
//      */
//     const speakResponse = (text: string) => {
//         if ("speechSynthesis" in window) {
//             const utterance = new SpeechSynthesisUtterance(text);
//
//             // Control animation when speaking starts and ends
//             utterance.onstart = () => setIsSpeaking(true);
//             utterance.onend = () => setIsSpeaking(false);
//
//             speechSynthesis.speak(utterance);
//         } else {
//             console.error("Text-to-Speech is not supported in this browser.");
//         }
//     };
//
//     /**
//      * Handles fetching of a question and starts the AI conversation
//      */
//     const handleFetchQuestion = (question: string) => {
//         setCurrentQuestion(question); // Update the current question
//         startConversationWithAI(question); // Initiate the conversation with AI
//     };
//
//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <Header />
//             <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
//                 {/* Left Section: Question and Code Editor */}
//                 <div className="flex flex-col w-full md:w-3/4 space-y-4">
//                     <Question question={currentQuestion} />
//                     <CodeEditor />
//                 </div>
//
//                 {/* Right Section: AI Voice Animation and Transcription */}
//                 <div className="w-full md:w-1/4 space-y-4">
//                     <AIVoiceAnimation isSpeaking={isSpeaking} />
//                     <Transcription transcription={transcription} />
//                 </div>
//             </div>
//
//             {/* Bottom Section: Main Button */}
//             <div className="p-4 flex justify-center bg-gray-200">
//                 <MainButton
//                     onFetchQuestion={handleFetchQuestion}
//                     onSendResponse={sendUserResponseToAI}
//                 />
//             </div>
//         </div>
//     );
// }




"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Question from "@/components/Question";
import CodeEditor from "@/components/CodeEditor";
import MainButton from "@/components/MainButton";
import AIVoiceAnimation from "@/components/AIVoiceAnimation";
import Transcription from "@/components/Transcription";

export default function InterviewRoom() {
    const [currentQuestion, setCurrentQuestion] = useState<string>(""); // Current coding question
    const [aiResponse, setAiResponse] = useState<string>(""); // AI's latest response
    const [transcription, setTranscription] = useState<Array<{ speaker: string; text: string }>>([]); // Full transcript
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false); // Control AI voice animation
    const [currentCode, setCurrentCode] = useState<string>(""); // Current code from CodeEditor

    /**
     * Starts the AI conversation by sending the coding question
     */
    const startConversationWithAI = async (codingQuestion: string) => {
        try {
            const response = await fetch("/api/conversationalInterface", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ codingQuestion }),
            });

            const data = await response.json();
            const aiResponseText = data.response;

            // Update AI response and transcription
            setAiResponse(aiResponseText);
            setTranscription((prev) => [...prev, { speaker: "AI", text: aiResponseText }]);

            // Speak the AI response
            speakResponse(aiResponseText);
        } catch (error) {
            console.error("Error starting conversation with AI:", error);
        }
    };

    /**
     * Handles user's verbal response and sends it along with the code to the API
     */
    const sendUserResponseToAI = async (spokenText: string) => {
        try {
            const response = await fetch("/api/conversationalInterface", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: spokenText, code: currentCode }), // Include code in the payload
            });

            const result = await response.json();
            const aiResponseText = result.response;

            // Update transcription with user input and AI response
            setTranscription((prev) => [
                ...prev,
                { speaker: "User", text: spokenText },
                { speaker: "AI", text: aiResponseText },
            ]);

            // Speak the AI response
            speakResponse(aiResponseText);
        } catch (error) {
            console.error("Error sending user response to the API:", error);
        }
    };

    /**
     * Speaks the AI's response and controls voice animation
     */
    const speakResponse = (text: string) => {
        if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);

            // Control animation when speaking starts and ends
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);

            speechSynthesis.speak(utterance);
        } else {
            console.error("Text-to-Speech is not supported in this browser.");
        }
    };

    /**
     * Handles fetching of a question and starts the AI conversation
     */
    const handleFetchQuestion = (question: string) => {
        setCurrentQuestion(question); // Update the current question
        startConversationWithAI(question); // Initiate the conversation with AI
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Header />
            <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
                {/* Left Section: Question and Code Editor */}
                <div className="flex flex-col w-full md:w-3/4 space-y-4">
                    <Question question={currentQuestion} />
                    <CodeEditor onCodeChange={setCurrentCode} />
                </div>

                {/* Right Section: AI Voice Animation and Transcription */}
                <div className="w-full md:w-1/4 space-y-4">
                    <AIVoiceAnimation isSpeaking={isSpeaking} />
                    <Transcription transcription={transcription} />
                </div>
            </div>

            {/* Bottom Section: Main Button */}
            <div className="p-4 flex justify-center bg-gray-200">
                <MainButton
                    onFetchQuestion={handleFetchQuestion}
                    onSendResponse={sendUserResponseToAI}
                />
            </div>
        </div>
    );
}

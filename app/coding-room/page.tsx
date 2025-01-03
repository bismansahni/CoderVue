//
//
//
// "use client";
//
// import { useState, useEffect } from "react";
// import AIVoiceAnimation from "@/components/AIVoiceAnimation";
// import CodeEditor from "@/components/CodeEditor";
// import Header from "@/components/Header";
// import Question from "@/components/Question";
// import Transcription from "@/components/Transcription";
//
// export default function InterviewRoom() {
//     const [question, setQuestion] = useState<string>("");
//     const [aiResponse, setAiResponse] = useState<string>(""); // To store the AI's response
//
//     // Function to call the conversational interface API
//     const startConversationWithAI = async (codingQuestion: string) => {
//         try {
//             const response = await fetch("/api/conversationalInterface", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({ codingQuestion: ` ${codingQuestion}` }),
//             });
//
//             const data = await response.json();
//             console.log("AI Response:", data.response); // Debugging the AI's response
//             setAiResponse(data.response); // Save the AI response
//         } catch (error) {
//             console.error("Error starting conversation with AI:", error);
//         }
//     };
//
//     // Function to speak the AI's response
//     const speakResponse = (text: string) => {
//         if ("speechSynthesis" in window) {
//             const utterance = new SpeechSynthesisUtterance(text);
//             speechSynthesis.speak(utterance);
//         } else {
//             console.error("Text-to-Speech is not supported in this browser.");
//         }
//     };
//
//
//     // useEffect to trigger the API call when the question is set
//     useEffect(() => {
//         if (question) {
//             startConversationWithAI(question);
//         }
//     }, [question]);
//
//     // useEffect to speak the AI's response when it's updated
//     useEffect(() => {
//         if (aiResponse) {
//             speakResponse(aiResponse);
//         }
//     }, [aiResponse]);
//
//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <Header />
//             <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
//                 <div className="flex flex-col w-full md:w-3/4 space-y-4">
//                     <Question question={question} />
//                     <CodeEditor />
//                 </div>
//                 <div className="w-full md:w-1/4 space-y-4">
//                     <AIVoiceAnimation />
//                     {/*<Transcription setQuestion={setQuestion} />*/}
//                 </div>
//             </div>
//         </div>
//     );
// }

//
// "use client";
//
// import {useEffect, useState} from "react";
// import Header from "@/components/Header";
// import Question from "@/components/Question";
// import CodeEditor from "@/components/CodeEditor";
// import MainButton from "@/components/MainButton";
// import AIVoiceAnimation from "@/components/AIVoiceAnimation"
// import Transcription from "@/components/Transcription";
//
// export default function InterviewRoom() {
//     const [currentQuestion, setCurrentQuestion] = useState<string>("");
//
//     // Simulate fetching a question (Replace this with actual API call)
//     useEffect(() => {
//         setTimeout(() => setCurrentQuestion("What is your experience with React?"), 1000);
//     }, []);
//
//
//
//
//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <Header />
//             <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
//                 <div className="flex flex-col w-full md:w-3/4 space-y-4">
//                     <Question question={currentQuestion} />
//                     <CodeEditor />
//                 </div>
//                 <div className="w-full md:w-1/4 space-y-4">
//                     <AIVoiceAnimation />
//                     <Transcription />
//                 </div>
//             </div>
//             <div className="p-4 flex justify-center bg-gray-200">
//                 <MainButton />
//             </div>
//         </div>
//     );



//
// "use client";
//
// import { useEffect, useState } from "react";
// import Header from "@/components/Header";
// import Question from "@/components/Question";
// import CodeEditor from "@/components/CodeEditor";
// import MainButton from "@/components/MainButton";
// import AIVoiceAnimation from "@/components/AIVoiceAnimation";
// import Transcription from "@/components/Transcription";
//
// export default function InterviewRoom() {
//     const [currentQuestion, setCurrentQuestion] = useState<string>("");
//
//     // Simulate fetching a question (Replace this with actual API call)
//     useEffect(() => {
//         setTimeout(() => setCurrentQuestion("What is your experience with React?"), 1000);
//     }, []);
//
//     return (
//         <div className="flex flex-col h-screen bg-gray-100">
//             <Header />
//             <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
//                 <div className="flex flex-col w-full md:w-3/4 space-y-4 relative">
//                     <Question question={currentQuestion} />
//                     {/* CodeEditor and MainButton */}
//                     <div className="flex flex-col h-full relative">
//                         <CodeEditor />
//                         <div className="absolute bottom-0 left-0 w-full flex justify-center">
//                             <MainButton />
//                         </div>
//                     </div>
//                 </div>
//                 <div className="w-full md:w-1/4 space-y-4">
//                     <AIVoiceAnimation />
//                     <Transcription />
//                 </div>
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
    const [currentQuestion, setCurrentQuestion] = useState<string>("");

    // Function to update the current question
    const handleFetchQuestion = (question: string) => {
        setCurrentQuestion(question);
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Header />
            <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex flex-col w-full md:w-3/4 space-y-4 relative">
                    <Question question={currentQuestion} />
                    <div className="flex flex-col h-full relative">
                        <CodeEditor />
                        <div className="absolute bottom-0 left-0 w-full flex justify-center">
                            <MainButton onFetchQuestion={handleFetchQuestion} />
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/4 space-y-4">
                    <AIVoiceAnimation />
                    <Transcription />
                </div>
            </div>
        </div>
    );
}

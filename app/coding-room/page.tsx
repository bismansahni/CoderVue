

"use client";

import { useState, useEffect } from "react";
import AIVoiceAnimation from "@/components/AIVoiceAnimation";
import CodeEditor from "@/components/CodeEditor";
import Header from "@/components/Header";
import Question from "@/components/Question";
import Transcription from "@/components/Transcription";

export default function InterviewRoom() {
    const [question, setQuestion] = useState<string>("");

    // Function to call the conversational interface API
    const startConversationWithAI = async (codingQuestion: string) => {
        try {
            const response = await fetch("/api/conversationalInterface", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: `The coding question is: ${codingQuestion}` }),
            });

            const data = await response.json();
            console.log("AI Response:", data.response); // Debugging the AI's initial response
        } catch (error) {
            console.error("Error starting conversation with AI:", error);
        }
    };

    // useEffect to trigger the API call when the question is set
    useEffect(() => {
        if (question) {
            startConversationWithAI(question);
        }
    }, [question]); // Dependency array includes `question` to re-run when it's updated

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Header />
            <div className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex flex-col w-full md:w-3/4 space-y-4">
                    <Question question={question} />
                    <CodeEditor />
                </div>
                <div className="w-full md:w-1/4 space-y-4">
                    <AIVoiceAnimation />
                    <Transcription setQuestion={setQuestion} />
                </div>
            </div>
        </div>
    );
}



"use client";
import axios from "axios";
import {useState} from "react";

const MainButton = ({ onFetchQuestion }: { onFetchQuestion: (question: string) => void }) => {
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);

    const fetchAQuestion = async () => {
        try {
            const response = await axios.post(`/api/getQuestion`);
            const fetchedQuestion = response.data.question?.trim();
            if (fetchedQuestion) {
                onFetchQuestion(fetchedQuestion); // Pass the question to parent
                setIsInterviewStarted(true); // Update button state
            }
        } catch (err) {
            console.error("Error fetching the question:", err);
        }
    };

    return (
        <button
            onClick={fetchAQuestion}
            className="mt-6 p-3 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-all"
        >
            {isInterviewStarted ? "Tell Your Thoughts to the Interviewer" : "Start Interview"}
        </button>
    );
};

export default MainButton;

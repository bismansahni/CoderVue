
'use client';

import { useState } from 'react';
import axios from "axios";

interface TalkButtonProps {
    code: string; // Adjust the type based on what `code` should be
}

const TalkButton: React.FC<TalkButtonProps> = ({ code }) => {
    const [recording, setRecording] = useState(false);

    const handleThoughtsSubmit = async () => {
        if (recording) return; // Prevent multiple recordings at the same time

        try {
            // Initialize Speech Recognition API
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => {
                setRecording(true);
                console.log('Recording started...');
            };

            recognition.onend = () => {
                setRecording(false);
                console.log('Recording stopped.');
            };

            recognition.onresult = async (event) => {
                const spokenText = event.results[0][0].transcript;
                console.log('Captured Text:', spokenText);

                try {
                    // Send the captured text and code to the conversationalInterface endpoint
                    const response = await fetch('/api/conversationalInterface', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message: spokenText, code }),
                    });

                    const result = await response.json();
                    console.log('AI Response:', result.response);

                    // Speak the AI's response
                    speakResponse(result.response);
                } catch (apiError) {
                    console.error('Error sending text to the API:', apiError);
                }
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setRecording(false);
            };

            recognition.start();
        } catch (error) {
            console.error('Error initializing Speech Recognition:', error);
        }
    };

    const speakResponse = (text: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => console.log('Finished speaking response');
            speechSynthesis.speak(utterance);
        } else {
            console.error('Text-to-Speech is not supported in this browser.');
        }
    };

    const fetchAQuestion = async () => {
        try {
            const response = await axios.post(`/api/getQuestion`);
            const fetchedQuestion = response.data.question?.trim();
            setQuestion(fetchedQuestion);
        } catch (err) {
            console.error("Error fetching the question:", err);
            setQuestion("Error fetching the question. Please try again.");
        }
    };


    return (
        // initially when interview has not started, lets have the start interview button only.


        <button
            onClick={fetchAQuestion}
            className={`mt-6 p-3 ${recording ? 'bg-red-500' : 'bg-slate-600'} text-white rounded-lg shadow-md hover:bg-slate-700 transition-all`}
            // Disable the button while recording
        >
            {Start interview}
        </button>

        // after that when the question has been set, we can have the interview component.
    <button
        onClick={handleThoughtsSubmit}
        className={`mt-6 p-3 ${recording ? 'bg-red-500' : 'bg-slate-600'} text-white rounded-lg shadow-md hover:bg-slate-700 transition-all`}
        disabled={recording} // Disable the button while recording
    >
        {recording ? 'Recording...' : 'Talk to the Interviewer'}
    </button>
    );
};

export default TalkButton;

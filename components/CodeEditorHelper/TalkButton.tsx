//
// const TalkButton = () => {
//     return (
//         <button
//
//             className="mt-6 p-3 bg-slate-600 text-white rounded-lg shadow-md hover:bg-slate-700 transition-all"
//         >
//             Talk to the Interviewer
//         </button>
//     );
// };
//
// export default TalkButton;



'use client';

import { useState } from 'react';

const TalkButton = () => {
    const [recording, setRecording] = useState(false);

    const handleThoughtsSubmit = async () => {
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

                // Send the captured text to the conversationalInterface endpoint
                const response = await fetch('/api/conversationalInterface', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: spokenText }),
                });

                const result = await response.json();
                console.log('AI Response:', result.response);
            };

            recognition.start();
        } catch (error) {
            console.error('Error capturing or sending speech:', error);
        }
    };

    return (
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

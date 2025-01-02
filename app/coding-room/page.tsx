//
//
// 'use client';
//
// import { useState, useEffect } from 'react';
// import Header from '@/components/Header';
// import CodeEditor from '@/components/CodeEditor';
// import Question from '@/components/Question';
// import Transcription from '@/components/Transcription';
//
// export default function InterviewRoom() {
//     const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
//     const [currentQuestion, setCurrentQuestion] = useState('');
//     const [userCode, setUserCode] = useState('');
//     const [isListening, setIsListening] = useState(false);
//
//     const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
//     const recognition = SpeechRecognition ? new SpeechRecognition() : null;
//
//     if (recognition) {
//         recognition.lang = 'en-US';
//         recognition.interimResults = false;
//
//         recognition.onstart = () => setIsListening(true);
//         recognition.onend = () => setIsListening(false);
//         recognition.onresult = (event: SpeechRecognitionEvent) => {
//             const transcript = event.results[0][0].transcript;
//             handleSend(transcript);
//         };
//     }
//
//     const speak = (text: string) => {
//         if (!text.trim()) return;
//         const utterance = new SpeechSynthesisUtterance(text);
//         utterance.lang = 'en-US';
//         utterance.rate = 1;
//         utterance.pitch = 1;
//         window.speechSynthesis.speak(utterance);
//     };
//
//     const handleSend = async (userSpeech: string) => {
//         setConversation((prev) => [...prev, { role: 'user', content: userSpeech }]);
//
//         try {
//             const response = await fetch('/api/getRandomDSAQuestion', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ userSpeech, code: userCode }),
//             });
//
//             const data = await response.json();
//             if (data.response) {
//                 const assistantResponse = data.response;
//                 setConversation((prev) => [...prev, { role: 'assistant', content: assistantResponse }]);
//                 speak(assistantResponse); // Speak Gemini's response
//
//                 if (assistantResponse.includes('Problem:')) {
//                     setCurrentQuestion(assistantResponse); // Update question section
//                 }
//             }
//         } catch (error) {
//             console.error('Error communicating with backend:', error);
//         }
//     };
//
//     const startListening = () => {
//         if (recognition) {
//             recognition.start();
//         } else {
//             console.error('Speech recognition not supported in this browser.');
//         }
//     };
//
//     return (
//         <div className="flex flex-col h-screen bg-beige-100">
//             <Header />
//             <div className="flex-grow flex flex-col md:flex-row p-6 space-y-6 md:space-y-0 md:space-x-6">
//                 {/* Left Section: Question and Code Editor */}
//                 <div className="flex flex-col w-full md:w-3/4 space-y-6">
//                     <Question question={currentQuestion || 'Waiting for question...'} />
//                     <CodeEditor value={userCode} onChange={setUserCode} />
//                 </div>
//
//                 {/* Right Section: Transcription */}
//                 <div className="w-full md:w-1/4 space-y-6">
//                     <Transcription conversation={conversation} />
//                     <button
//                         className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//                         onClick={startListening}
//                     >
//                         Tell Your Thoughts
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }



'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import Question from '@/components/Question';
import Transcription from '@/components/Transcription';

export default function InterviewRoom() {
    const [conversation, setConversation] = useState<Array<{ role: string; content: string }>>([]);
    const [currentQuestion, setCurrentQuestion] = useState('');
    const [userCode, setUserCode] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isInterviewStarted, setIsInterviewStarted] = useState(false);

    const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    if (recognition) {
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            handleSend(transcript);
        };
    }

    const speak = (text: string) => {
        if (!text.trim()) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    };

    const startInterview = async () => {
        try {
            const response = await fetch('/api/getRandomDSAQuestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userSpeech: 'Start interview' }),
            });

            const data = await response.json();
            if (data.response) {
                const assistantResponse = data.response;
                setConversation((prev) => [...prev, { role: 'assistant', content: assistantResponse }]);
                speak(assistantResponse); // Speak Gemini's response

                if (assistantResponse.includes('Problem:')) {
                    setCurrentQuestion(assistantResponse); // Update question section
                }
                setIsInterviewStarted(true); // Mark interview as started
            }
        } catch (error) {
            console.error('Error starting the interview:', error);
        }
    };

    const handleSend = async (userSpeech: string) => {
        setConversation((prev) => [...prev, { role: 'user', content: userSpeech }]);

        try {
            const response = await fetch('/api/getRandomDSAQuestion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userSpeech, code: userCode }),
            });

            const data = await response.json();
            if (data.response) {
                const assistantResponse = data.response;
                setConversation((prev) => [...prev, { role: 'assistant', content: assistantResponse }]);
                speak(assistantResponse); // Speak Gemini's response

                if (assistantResponse.includes('Problem:')) {
                    setCurrentQuestion(assistantResponse); // Update question section
                }
            }
        } catch (error) {
            console.error('Error communicating with backend:', error);
        }
    };

    const startListening = () => {
        if (recognition) {
            recognition.start();
        } else {
            console.error('Speech recognition not supported in this browser.');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-beige-100">
            <Header />
            <div className="flex-grow flex flex-col md:flex-row p-6 space-y-6 md:space-y-0 md:space-x-6">
                {/* Left Section: Question and Code Editor */}
                <div className="flex flex-col w-full md:w-3/4 space-y-6">
                    <Question question={currentQuestion || 'Waiting for question...'} />
                    {isInterviewStarted && <CodeEditor value={userCode} onChange={setUserCode} />}
                </div>

                {/* Right Section: Transcription */}
                <div className="w-full md:w-1/4 space-y-6">
                    {!isInterviewStarted ? (
                        <Transcription onStartInterview={startInterview} />
                    ) : (
                        <>
                            <Transcription conversation={conversation} />
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                                onClick={startListening}
                            >
                                Tell Your Thoughts
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

//
//
// "use client";
//
// import { useState } from "react";
// import QuestionFetcher from "@/components/TranscriptionBoxHelper/QuestionFetcher";
// import TranscriptHandler from "@/components/TranscriptionBoxHelper/TranscriptHandler";
//
// export default function Transcription() {
//     const [question, setQuestion] = useState(null);
//
//     return (
//         <>
//             {question ? (
//                 <TranscriptHandler/>
//             ) : (
//                 <QuestionFetcher/>
//             )}
//         </>
//     );
// }

//
// "use client";
//
// import { useState } from "react";
// import QuestionFetcher from "@/components/TranscriptionBoxHelper/QuestionFetcher";
// import TranscriptHandler from "@/components/TranscriptionBoxHelper/TranscriptHandler";
//
// export default function Transcription({ setQuestion }: { setQuestion: (question: string) => void }) {
//     const [question, setLocalQuestion] = useState<string | null>(null);
//
//     const handleSetQuestion = (fetchedQuestion: string) => {
//         setLocalQuestion(fetchedQuestion);
//         setQuestion(fetchedQuestion); // Pass the question up to the parent
//     };
//
//     return (
//         <>
//             {question ? (
//                 <TranscriptHandler />
//             ) : (
//                 <QuestionFetcher setQuestion={handleSetQuestion} />
//             )}
//         </>
//     );
// }


export default function Transcription() {
    return (
        <div className="bg-white p-4 rounded shadow flex-grow overflow-y-auto">
            <h2 className="text-xl font-semibold mb-2">Transcription</h2>
            <div className="space-y-2">
                <p><strong>AI:</strong> Hello! Welcome to your coding interview. Are you ready to begin?</p>
                <p><strong>You:</strong> Yes, I'm ready.</p>
                <p><strong>AI:</strong> Great! Let's start with the first question. Please take a look at the coding question displayed on your screen.</p>
            </div>
        </div>
    )
}

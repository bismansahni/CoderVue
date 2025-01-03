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


"use client";

import { useState } from "react";
import QuestionFetcher from "@/components/TranscriptionBoxHelper/QuestionFetcher";
import TranscriptHandler from "@/components/TranscriptionBoxHelper/TranscriptHandler";

export default function Transcription({ setQuestion }: { setQuestion: (question: string) => void }) {
    const [question, setLocalQuestion] = useState<string | null>(null);

    const handleSetQuestion = (fetchedQuestion: string) => {
        setLocalQuestion(fetchedQuestion);
        setQuestion(fetchedQuestion); // Pass the question up to the parent
    };

    return (
        <>
            {question ? (
                <TranscriptHandler />
            ) : (
                <QuestionFetcher setQuestion={handleSetQuestion} />
            )}
        </>
    );
}

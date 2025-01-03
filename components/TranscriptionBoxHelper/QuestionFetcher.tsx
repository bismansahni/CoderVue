//
// "use client";
//
// import { useState } from "react";
// import axios from "axios";
// import Question from "@/components/Question";
//
// export default function QuestionFetcher() {
//     const [question, setQuestion] = useState<string | null>(null);
//     const [error, setError] = useState<string | null>(null);
//
//     const fetchAQuestion = async () => {
//         try {
//             const response = await axios.post(`/api/getQuestion`);
//             console.log("API Response:", response.data); // Debug the response
//             const fetchedQuestion = response.data.question?.trim(); // Trim any extra whitespace or newline
//             console.log("Fetched Question:", fetchedQuestion); // Ensure it's the correct question
//             setQuestion(fetchedQuestion); // Update the question state
//             setError(null); // Clear any previous errors
//         } catch (err) {
//             setError("Error fetching the question. Please try again.");
//             console.error(err);
//         }
//     };
//
//     return (
//         <div className="bg-white p-4 rounded shadow flex-grow overflow-y-auto">
//             {question ? (
//                 <Question question={question} /> // Pass the fetched question
//             ) : (
//                 <div className="space-y-4">
//                     {error && <div className="text-red-500">{error}</div>}
//                     <button
//                         className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
//                         onClick={fetchAQuestion}
//                     >
//                         Start Interview
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// }

//
//
// "use client";
//
// import { useState } from "react";
// import axios from "axios";
//
// export default function QuestionFetcher({ setQuestion }: { setQuestion: (question: string) => void }) {
//     const [error, setError] = useState<string | null>(null);
//
//     const fetchAQuestion = async () => {
//         try {
//             const response = await axios.post(`/api/getQuestion`);
//             console.log("API Response:", response.data); // Debug the response
//             const fetchedQuestion = response.data.question?.trim(); // Trim any extra whitespace or newline
//             console.log("Fetched Question:", fetchedQuestion); // Ensure it's the correct question
//             setQuestion(fetchedQuestion); // Pass the fetched question to the parent
//             setError(null); // Clear any previous errors
//         } catch (err) {
//             setError("Error fetching the question. Please try again.");
//             console.error(err);
//         }
//     };
//
//     return (
//         <div className="space-y-4">
//             {error && <div className="text-red-500">{error}</div>}
//             <button
//                 className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
//                 onClick={fetchAQuestion}
//             >
//                 Start Interview
//             </button>
//         </div>
//     );
// }


//
//
// "use client";
//
// import axios from "axios";
// import Question from "@/components/Question";
//
//
// export default function QuestionFetcher({ setQuestion }: { setQuestion: (question: string) => void }) {
//     const fetchAQuestion = async () => {
//         try {
//             const response = await axios.post(`/api/getQuestion`);
//             console.log("API Response:", response.data); // Debug the response
//             const fetchedQuestion = response.data.question?.trim(); // Trim any extra whitespace or newline
//             console.log("Fetched Question:", fetchedQuestion); // Ensure it's the correct question
//             setQuestion(fetchedQuestion); // Pass the fetched question to the parent
//         } catch (err) {
//             console.error("Error fetching the question:", err);
//             setQuestion("Error fetching the question. Please try again."); // Handle errors by passing a fallback message
//         }
//     };
//
//     return (
//         <div className="space-y-4">
//             <button
//                 className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
//                 onClick={fetchAQuestion}
//             >
//                 Start Interview
//             </button>
//         </div>
//     );
// }


"use client";

import axios from "axios";

export default function QuestionFetcher({ setQuestion }: { setQuestion: (question: string) => void }) {
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
        <div className="space-y-4">
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={fetchAQuestion}
            >
                Start Interview
            </button>
        </div>
    );
}

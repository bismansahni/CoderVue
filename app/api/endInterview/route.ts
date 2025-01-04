
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the generative AI client
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to analyze interview transcription and provide feedback
async function endInterview(transcription:string, question:string) {
    console.log("Inside endInterview");
    // console.log("Transcription:", transcription);
    console.log("Question:", question);

    const formattedTranscription = Array.isArray(transcription)
        ? transcription.map((entry) => JSON.stringify(entry)).join("\n")
        : JSON.stringify(transcription);

    console.log("Formatted Transcription:", formattedTranscription);

    const prompt = `
        You are given a transcription of a coding interview where "ai" represents the AI interviewer and "user" represents the candidate.
        Read the transcription and the coding question provided below and provide constructive feedback on the candidate's performance.
        Additionally, score the interview quality as a percentage. Return the response in this format:
        {
            "feedback": "Your feedback here",
            "score": 85
        }

        Transcription:
        ${formattedTranscription}

        Question:
        ${question}
    `;

    try {
        console.log("Prompt sent to Gemini:", prompt);

        const result = await model.generateContent(prompt);
       const response=result.response.text();


        return response;
    } catch (error) {
        console.error("Error in endInterview function:", error);
        throw new Error("Failed to analyze interview.");
    }
}

// Export the POST handler for Next.js API route
export async function POST(req) {
    try {
        // Parse request body to get transcription and question
        const { transcription, question } = await req.json();

        console.log("transcription", transcription);
        console.log("question", question);

        if (!transcription || !question) {
            return NextResponse.json(
                { error: "Both 'transcription' and 'question' are required." },
                { status: 400 }
            );
        }

        // Call the endInterview function
        const result = await endInterview(transcription, question);

        console.log("Feedback Result:", result);

        return NextResponse.json({ feedback: result });
    } catch (error) {
        console.error("Error in POST /endInterview:", error);
        return NextResponse.json(
            { error: "An error occurred while processing the interview data." },
            { status: 500 }
        );
    }
}

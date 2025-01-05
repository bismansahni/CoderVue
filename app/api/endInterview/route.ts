import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";


// Initialize Firebase Admin SDK
if (!getApps().length) {
    initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_KEY || "{}")),
    });
}
const db = getFirestore();

// Initialize the generative AI client
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to analyze interview transcription and provide feedback
async function endInterview(formattedTranscription: string, question: string) {
    console.log("Inside endInterview");
    console.log("Transcription:", formattedTranscription);
    console.log("Question:", question);

    const prompt = `
        You are given a transcription of a coding interview where "ai" represents the AI interviewer and "user" represents the candidate.
        Read the transcription and the coding question provided below and provide constructive feedback on the candidate's performance.
        Additionally, score the interview quality as a percentage. Give feedback to this, and your feedback should look like a human has spoken it, in plain conversational tone to sound natural.  Return the response in this format:
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
        const responseText = result.response?.text();

        if (!responseText) {
            throw new Error("Empty response from AI model.");
        }

        const mockJsonResp = responseText
            .replace("```json", "")
            .replace("```", "");
        const parsedResp = JSON.parse(mockJsonResp);

        return parsedResp; // Return the parsed JSON response
    } catch (error) {
        console.error("Error in endInterview function:", error);
        throw new Error("Failed to analyze interview.");
    }
}

// Function to save results to Firestore
async function saveResultToDb(
    result: any,
    formattedTranscription: string,
    question: string,
    userId: string,
    userEmail: string
) {
   // Generate a unique ID

    try {
        await db
            .collection("users")
            .doc(userId)
            .collection("interviews")
            .doc()
            .set({
                question,
                transcription: formattedTranscription,
                result,
                userEmail,
                createdAt: new Date().toISOString(),
            });

        console.log("Result saved to Firestore successfully!");
    } catch (error) {
        console.error("Error saving result to Firestore:", error);
        throw new Error("Failed to save result to Firestore.");
    }
}

// Export the POST handler for Next.js API route
export async function POST(req: NextRequest) {
    try {
        // Parse request body to get transcription, question, userId, and userEmail
        const { transcription, question, userId, userEmail } = await req.json();

        console.log("transcription:", transcription);
        console.log("question:", question);
        console.log("userId:", userId);
        console.log("userEmail:", userEmail);

        if (!transcription || !question || !userId || !userEmail) {
            return NextResponse.json(
                { error: "All fields ('transcription', 'question', 'userId', 'userEmail') are required." },
                { status: 400 }
            );
        }

        const formattedTranscription = Array.isArray(transcription)
            ? transcription.map((entry) => JSON.stringify(entry)).join("\n")
            : JSON.stringify(transcription);

        console.log("Formatted Transcription:", formattedTranscription);

        // Call the endInterview function
        const result = await endInterview(formattedTranscription, question);

        // Save the result to Firestore
        await saveResultToDb(result, formattedTranscription, question, userId, userEmail);

        return NextResponse.json({ message: "Saved!" });
    } catch (error) {
        console.error("Error in POST /endInterview:", error);
        return NextResponse.json(
            { error: "An error occurred while saving/processing the interview data." },
            { status: 500 }
        );
    }
}

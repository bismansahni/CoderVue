import { AIInterviewer } from "@/lib/openai";
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

// Function to save results to Firestore
async function saveResultToDb(
    result: any,
    formattedTranscription: string,
    question: string,
    userId: string,
    userEmail: string,
    finalCode?: string
) {
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
                finalCode: finalCode || '',
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
        const { transcription, question, userId, userEmail, finalCode } = await req.json();

        console.log("Ending interview for user:", userId);
        console.log("Question:", question);
        console.log("Transcription length:", transcription?.length);
        console.log("Final code provided:", !!finalCode);

        // Validate required fields
        if (!transcription || !question || !userId || !userEmail) {
            return NextResponse.json(
                { error: "Missing required fields: transcription, question, userId, or userEmail." },
                { status: 400 }
            );
        }

        // Format the transcription for better readability
        const formattedTranscription = Array.isArray(transcription)
            ? transcription.map((item: any) => `${item.speaker}: ${item.text}`).join('\n')
            : transcription;

        // Initialize AI Interviewer for evaluation
        const interviewer = new AIInterviewer();
        
        // Get comprehensive evaluation using OpenAI
        const evaluation = await interviewer.evaluateInterview(
            formattedTranscription,
            question,
            finalCode || 'No code provided'
        );

        console.log("AI Evaluation completed:", {
            score: evaluation.score,
            strengthsCount: evaluation.strengths.length,
            improvementsCount: evaluation.improvements.length
        });

        // Prepare the result object
        const result = {
            feedback: evaluation.feedback,
            score: evaluation.score,
            strengths: evaluation.strengths,
            improvements: evaluation.improvements,
            evaluatedAt: new Date().toISOString()
        };

        // Save the result to Firestore
        await saveResultToDb(
            result,
            formattedTranscription,
            question,
            userId,
            userEmail,
            finalCode
        );

        // Return the evaluation result
        return NextResponse.json({
            success: true,
            result,
            message: "Interview ended and results saved successfully."
        });
    } catch (error) {
        console.error("Error in POST /endInterview:", error);
        return NextResponse.json(
            { 
                error: "An error occurred while ending the interview.",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}
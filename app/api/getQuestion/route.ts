import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the generative AI client
const API_KEY = process.env.GEMINI_API_KEY || "your-api-key-here";

console.log("gemini api key", API_KEY);
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to generate a single coding question
async function generateQuestion() {
    const prompt = `
        You are a coding interviewer taking an in-person coding round.
        Just provide a question with easy to medium difficulty.
        Do not give any examples or anything else; it should just be a plain, normal question as a human would tell another human.
        Only provide the question text.
    `;

    try {
        const result = await model.generateContent(prompt);
        console.log(result.response.text());
        return result.response.text()
    } catch (error) {
        console.error("Error generating question:", error);
        throw new Error("Failed to generate a question.");
    }
}

// Export the POST handler for Next.js API route
export async function POST() {
    try {
        const question = await generateQuestion();
        return NextResponse.json({ question });
    } catch (error) {
        console.error("Error in POST /generateQuestion:", error);
        return NextResponse.json(
            { error: "An error occurred while generating the question." },
            { status: 500 }
        );
    }
}

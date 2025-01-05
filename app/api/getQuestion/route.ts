import {GoogleGenerativeAI} from "@google/generative-ai";
import {NextResponse} from "next/server";

// Initialize the generative AI client
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

// Function to generate a single coding question
async function generateQuestion(pastQuestions: string[]): Promise<string> {
    // Validate input
    if (!Array.isArray(pastQuestions)) {
        throw new Error("Invalid pastQuestions format. Expected an array of strings.");
    }

    console.log("pastQuestions received in backend:", pastQuestions);

    const prompt = `
        You are a coding interviewer conducting an in-person coding round.
        Provide a question with easy to medium difficulty.
        Do not give any examples or additional details—just the question text as a human would ask another human.
        Avoid asking any of the following past questions: ${pastQuestions.join(", ")}.
    `;

    try {
        const result = await model.generateContent(prompt);

        const question = result?.response?.text()?.trim();

        if (!question) {
            throw new Error("AI response did not contain a valid question.");
        }

        console.log("Generated question:", question);
        return question;
    } catch (error) {
        console.error("Error generating question:", error);
        throw new Error("Failed to generate a question.");
    }
}

// Export the POST handler for Next.js API route
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const body: { pastQuestions: string[] } = await req.json(); // Parse the request body
        const pastQuestions = body.pastQuestions || [];

        console.log("Type of pastQuestions is:", typeof pastQuestions);

        if (!Array.isArray(pastQuestions)) {
            throw new Error("Invalid pastQuestions format. Expected an array.");
        }

        const question = await generateQuestion(pastQuestions);

        return NextResponse.json({question});
    } catch (error) {
        console.error("Error in POST /generateQuestion:", error);
        return NextResponse.json(
            {error: "An error occurred while generating the question."},
            {status: 500}
        );
    }
}

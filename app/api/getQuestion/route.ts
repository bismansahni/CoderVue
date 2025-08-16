import { AIInterviewer } from "@/lib/openai";
import { NextResponse } from "next/server";

// Export the POST handler for Next.js API route
export async function POST(req: Request): Promise<NextResponse> {
    try {
        const body: { 
            pastQuestions?: string[]; 
            difficulty?: 'easy' | 'medium' | 'hard';
            topics?: string[];
        } = await req.json();
        
        const pastQuestions = body.pastQuestions || [];
        const difficulty = body.difficulty || 'medium';
        const topics = body.topics || ['arrays', 'strings', 'algorithms', 'data structures'];

        console.log("Generating question with difficulty:", difficulty);
        console.log("Topics:", topics);
        console.log("Avoiding past questions:", pastQuestions.length);

        // Validate input
        if (!Array.isArray(pastQuestions)) {
            return NextResponse.json(
                { error: "Invalid pastQuestions format. Expected an array." },
                { status: 400 }
            );
        }

        // Initialize AI Interviewer
        const interviewer = new AIInterviewer();
        
        // Generate a new question using OpenAI
        const question = await interviewer.generateQuestion(difficulty, topics, pastQuestions);

        if (!question) {
            throw new Error("Failed to generate a question.");
        }

        console.log("Generated question successfully");

        return NextResponse.json({ question });
    } catch (error) {
        console.error("Error in POST /getQuestion:", error);
        return NextResponse.json(
            { error: "An error occurred while generating the question." },
            { status: 500 }
        );
    }
}
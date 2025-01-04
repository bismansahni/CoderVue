// import {GoogleGenerativeAI} from "@google/generative-ai";
// import {NextRequest, NextResponse} from "next/server";
//
// // Initialize the generative AI client
// const API_KEY = process.env.GEMINI_API_KEY || "your-api-key-here";
//
// // Initialize the Gemini API client
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});
//
// // Function to dynamically create the system prompt with a coding question
// function createSystemPrompt(codingQuestion: string) {
//     return `
//         "You are an AI interviewer for a coding round. The candidate is applying for a software development position.
//         As an interviewer, your goal is to assess the candidate's coding skills, problem-solving abilities, and their understanding of algorithms and data structures.
//         The coding question provided is ${codingQuestion}, which is already written on the screen of the candidate.
//
//         Start the interview with a friendly introduction, telling the candidate that you'll be discussing the question presented already on the screen, and briefly summarize the question,  and ask them to present their thought process to you before writing the solution.
//         Keep the tone conversational and approachable, while maintaining professionalism throughout.
//         Let the candidate know that they can ask questions at any time and that it's okay to take their time to think through the problems.
//
//         Encourage the candidate to explain their thought process as they code. If they get stuck, guide them back to the correct path by asking follow-up questions or offering hints without directly giving the answer.
//         Throughout the interview, emphasize the importance of clarity and problem-solving over simply writing the correct code.
//
//         Avoid giving long responses. Instead, provide short prompts to guide the candidate, such as:
//         - "Can you explain how you would approach this problem?"
//         - "What do you think the time complexity of your solution is?"
//         - "Can you break down the logic you're using here?"
//         - "What would you do if you encountered an edge case?"
//
//         At the end of the interview, ask the candidate if they have any questions or if there’s anything else they'd like to add.
//         End the conversation with a polite thank you. Keep your responses small since the responses are being spoken to the user, so it needs to be small. Just give the response in normal text which can be spoken as it is like human. Remember, do not deviate from the interview, do not give any vague answers which are not suitable for interview, if the candidate says something off, do not deviate. Be as human as possible.
//     `;
// }
//
//
// // In-memory storage for session-specific conversation histories
// const sessionHistories: Record<string, { role: string; content: string }[]> = {};
//
// // Function to generate the assistant's response
// async function generateResponse(sessionId: string): Promise<string> {
//     const history = sessionHistories[sessionId] || [];
//     const prompt = history.map((entry) => `${entry.role}: ${entry.content}`).join("\n");
//
//     try {
//         const result = await model.generateContent(prompt);
//         const assistantResponse = result.response.text()?.trim() || "No response generated.";
//
//         // Append the assistant's response to the session history
//         sessionHistories[sessionId].push({role: "assistant", content: assistantResponse});
//
//         return assistantResponse;
//     } catch (error) {
//         console.error("Error generating response:", error);
//         throw new Error("Failed to generate a response.");
//     }
// }
//
// // Export the POST handler for Next.js API route
// export async function POST(req: NextRequest): Promise<NextResponse> {
//     try {
//         // Extract sessionId from the query parameters
//         const sessionId = req.nextUrl.searchParams.get("sessionId");
//
//         if (!sessionId) {
//             throw new Error("Missing sessionId in the query parameters.");
//         }
//
//         const data = await req.json();
//         const {message, codingQuestion, code} = data;
//
//         // Initialize session history if not already present
//         if (!sessionHistories[sessionId]) {
//             sessionHistories[sessionId] = [];
//         }
//
//         // If codingQuestion is provided and it's the first interaction, set up the system prompt
//         if (codingQuestion && sessionHistories[sessionId].length === 0) {
//             const systemPrompt = createSystemPrompt(codingQuestion);
//             sessionHistories[sessionId].push({role: "system", content: systemPrompt});
//         }
//
//         // Append user message to the session history
//         if (message) {
//             sessionHistories[sessionId].push({role: "user", content: message});
//         }
//
//         // Append user code to the session history
//         if (code) {
//             sessionHistories[sessionId].push({role: "user", content: `Code: ${code}`});
//         }
//
//         // Generate the assistant's response
//         const response = await generateResponse(sessionId);
//
//         console.log("Complete Session Histories:");
//         console.dir(sessionHistories, {depth: null});
//
//
//         // Return the assistant's response
//         return NextResponse.json({response});
//     } catch (error) {
//         console.error("Error in POST /conversationalInterface:", error);
//         return NextResponse.json(
//             {error: "An error occurred while generating the response."},
//             {status: 500}
//         );
//     }
// }



import redis from "@/lib/redis";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

interface SessionEntry {
    role: string;
    content: string;
}

// Initialize the generative AI client
const API_KEY = process.env.GEMINI_API_KEY || "your-api-key-here";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to dynamically create the system prompt with a coding question
function createSystemPrompt(codingQuestion: string) {
    return `
        "You are an AI interviewer for a coding round. The candidate is applying for a software development position.
        As an interviewer, your goal is to assess the candidate's coding skills, problem-solving abilities, and their understanding of algorithms and data structures.
        The coding question provided is ${codingQuestion}, which is already written on the screen of the candidate.

        Start the interview with a friendly introduction, telling the candidate that you'll be discussing the question presented already on the screen, and briefly summarize the question,  and ask them to present their thought process to you before writing the solution.
        Keep the tone conversational and approachable, while maintaining professionalism throughout.
        Let the candidate know that they can ask questions at any time and that it's okay to take their time to think through the problems.

        Encourage the candidate to explain their thought process as they code. If they get stuck, guide them back to the correct path by asking follow-up questions or offering hints without directly giving the answer.
        Throughout the interview, emphasize the importance of clarity and problem-solving over simply writing the correct code.

        Avoid giving long responses. Instead, provide short prompts to guide the candidate, such as:
        - "Can you explain how you would approach this problem?"
        - "What do you think the time complexity of your solution is?"
        - "Can you break down the logic you're using here?"
        - "What would you do if you encountered an edge case?"

        At the end of the interview, ask the candidate if they have any questions or if there’s anything else they'd like to add.
        End the conversation with a polite thank you. Keep your responses small since the responses are being spoken to the user, so it needs to be small. Just give the response in normal text which can be spoken as it is like human. Remember, do not deviate from the interview, do not give any vague answers which are not suitable for interview, if the candidate says something off, do not deviate. Be as human as possible.
    `;
}

// Function to retrieve the session history from Redis
async function getSessionHistory(sessionId: string) {
    const sessionData = await redis.get(sessionId);
    return sessionData ? JSON.parse(sessionData) : [];
}

// Function to save the session history to Redis
// async function saveSessionHistory(sessionId: string, history: { role: string; content: string }[]) {
//     await redis.set(sessionId, JSON.stringify(history));
// }


async function saveSessionHistory(sessionId: string, history: { role: string; content: string }[]) {
    const expiryInSeconds = 30 * 60; // 30 minutes
    await redis.set(sessionId, JSON.stringify(history), "EX", expiryInSeconds);
}

// Function to generate the assistant's response
async function generateResponse(sessionId: string): Promise<string> {
    const history = await getSessionHistory(sessionId);
    const prompt = history.map((entry:SessionEntry) => `${entry.role}: ${entry.content}`).join("\n");

    try {
        const result = await model.generateContent(prompt);
        const assistantResponse = result.response.text()?.trim() || "No response generated.";

        // Append the assistant's response to the session history
        history.push({ role: "assistant", content: assistantResponse });
        await saveSessionHistory(sessionId, history);

        return assistantResponse;
    } catch (error) {
        console.error("Error generating response:", error);
        throw new Error("Failed to generate a response.");
    }
}

// Export the POST handler for Next.js API route
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // Extract sessionId from the query parameters
        const sessionId = req.nextUrl.searchParams.get("sessionId");

        if (!sessionId) {
            throw new Error("Missing sessionId in the query parameters.");
        }

        const data = await req.json();
        const { message, codingQuestion, code } = data;

        // Get the current session history or initialize it
        const history = await getSessionHistory(sessionId);

        // If codingQuestion is provided and it's the first interaction, set up the system prompt
        if (codingQuestion && history.length === 0) {
            const systemPrompt = createSystemPrompt(codingQuestion);
            history.push({ role: "system", content: systemPrompt });
        }

        // Append user message to the session history
        if (message) {
            history.push({ role: "user", content: message });
        }

        // Append user code to the session history
        if (code) {
            history.push({ role: "user", content: `Code: ${code}` });
        }

        // Save the updated session history
        await saveSessionHistory(sessionId, history);

        // Generate the assistant's response
        const response = await generateResponse(sessionId);

        // console.log("Complete Session Histories:");
        // console.dir(await getSessionHistory(sessionId), { depth: null });

        // Return the assistant's response
        return NextResponse.json({ response });
    } catch (error) {
        console.error("Error in POST /conversationalInterface:", error);
        return NextResponse.json(
            { error: "An error occurred while generating the response." },
            { status: 500 }
        );
    }
}

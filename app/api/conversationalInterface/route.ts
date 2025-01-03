



import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize the generative AI client
const API_KEY = process.env.GEMINI_API_KEY || "your-api-key-here";

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const coding_question = "How would you reverse a linked list in place?";

// System prompt for the coding interview (unchanged)
const system_prompt = `
    "You are an AI interviewer for a coding round. The candidate is applying for a software development position. 
    As an interviewer, your goal is to assess the candidate's coding skills, problem-solving abilities, and their understanding of algorithms and data structures. 
    The coding question provided is ${coding_question}, which is already written on the screen of the candidate.
    
    Start the interview with a friendly introduction, telling the candidate that you'll be discussing the question presented already on the screen. 
    Keep the tone conversational and approachable, while maintaining professionalism throughout. 
    Let the candidate know that they can ask questions at any time and that it's okay to take their time to think through the problems.

   Tell them they can start the interview after this, and ask them to present the initial thoughts of the question. Tell them you can speak with me with the button presented on the screen.

    Encourage the candidate to explain their thought process as they code. If they get stuck, guide them back to the correct path by asking follow-up questions or offering hints without directly giving the answer. 
    Throughout the interview, emphasize the importance of clarity and problem-solving over simply writing the correct code.

    Avoid giving long responses. Instead, provide short prompts to guide the candidate, such as:
    - "Can you explain how you would approach this problem?"
    - "What do you think the time complexity of your solution is?"
    - "Can you break down the logic you're using here?"
    - "What would you do if you encountered an edge case?"

    At the end of the interview, ask the candidate if they have any questions or if there’s anything else they'd like to add. 
    End the conversation with a polite thank you. Keep your responses small since the responses are being spoken to the user, so it needs to be small.
`;

// Initialize conversation history
const conversationHistory = [
    { role: "system", content: system_prompt }  // Start with the system prompt to set the context
];

// Function to generate a coding interview question while maintaining conversation history
async function generateQuestion() {
    // Append all messages in the conversation history
    const prompt = conversationHistory.map(entry => `${entry.role}: ${entry.content}`).join("\n");

    try {
        const result = await model.generateContent(prompt);
        const assistantResponse = result.response.text();

        // Append the assistant's response to the conversation history
        conversationHistory.push({ role: "assistant", content: assistantResponse });

        return assistantResponse;
    } catch (error) {
        console.error("Error generating question:", error);
        throw new Error("Failed to generate a question.");
    }
}

// Export the POST handler for Next.js API route
export async function POST(req) {
    try {
        const data = await req.json(); // Corrected to handle incoming JSON request data
        const userMessage = data.message; // Assuming the user message is sent with the "message" key

        // Append the user message to the conversation history
        conversationHistory.push({ role: "user", content: userMessage });

        const question = await generateQuestion(); // Generate the question based on updated conversation history
        return NextResponse.json({ question }); // Return the generated question as a response
    } catch (error) {
        console.error("Error in POST /conversationalInterface:", error);
        return NextResponse.json(
            { error: "An error occurred while generating the question." },
            { status: 500 }
        );
    }
}

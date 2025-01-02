// import { NextResponse } from 'next/server';
// import { GoogleGenerativeAI } from '@google/generative-ai';
//
// const API_KEY = process.env.GEMINI_API_KEY;
//
// // Initialize the generative AI client
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//
// // Persistent conversation history
// let conversationHistory: Array<{ role: string; content: string }> = [
//     {
//         role: 'system',
//         content: `
//             You are a coding interviewer. Maintain a conversational tone.
//             Respond to user inputs and evaluate their approach and code. Provide follow-up questions when the code is done.`,
//     },
// ];
//
// // Function to generate Gemini's response
// const generateResponse = async (userSpeech: string, code?: string) => {
//     // Add user speech and optional code to the conversation history
//     conversationHistory.push({ role: 'user', content: `User said: ${userSpeech}` });
//     if (code) {
//         conversationHistory.push({ role: 'user', content: `User submitted code:\n${code}` });
//     }
//
//     try {
//         const result = await model.generateChat({ messages: conversationHistory });
//         const assistantResponse = result.response.text();
//         conversationHistory.push({ role: 'assistant', content: assistantResponse });
//         return assistantResponse;
//     } catch (error) {
//         console.error('Error generating response from Gemini:', error);
//         throw new Error('Failed to generate a response from Gemini.');
//     }
// };
//
// export async function POST(req: Request) {
//     try {
//         const { userSpeech, code } = await req.json();
//
//         if (!userSpeech) {
//             return NextResponse.json({ error: 'User speech is required.' }, { status: 400 });
//         }
//
//         const assistantResponse = await generateResponse(userSpeech, code);
//         return NextResponse.json({ response: assistantResponse });
//     } catch (error) {
//         console.error('Error processing conversational interface:', error);
//         return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
//     }
// }


import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Persistent conversation history
let conversationHistory: string[] = [
    `You are a professional coding interviewer. Start with introductions and provide coding questions. 
    Respond conversationally to user inputs, guide them if they are on the wrong track, and evaluate their code. 
    After the user indicates their code is complete, ask follow-up questions.`,
];

// Function to handle conversational flow
const generateResponse = async (userSpeech: string, code?: string) => {
    // Append the user's input and optional code to the conversation history
    conversationHistory.push(`User: ${userSpeech}`);
    if (code) {
        conversationHistory.push(`User's Code: ${code}`);
    }

    // Create the prompt from the conversation history
    const prompt = conversationHistory.join('\n');

    try {
        const result = await model.generateContent(prompt);
        const assistantResponse = result.response.text();

        // Add the assistant's response to the conversation history
        conversationHistory.push(`Assistant: ${assistantResponse}`);
        return assistantResponse;
    } catch (error) {
        console.error('Error generating response from Gemini:', error);
        throw new Error('Failed to generate a response from Gemini.');
    }
};

export async function POST(req: Request) {
    try {
        const { userSpeech, code } = await req.json();

        if (!userSpeech) {
            return NextResponse.json({ error: 'User speech is required.' }, { status: 400 });
        }

        const assistantResponse = await generateResponse(userSpeech, code);
        return NextResponse.json({ response: assistantResponse });
    } catch (error) {
        console.error('Error processing conversational interface:', error);
        return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
    }
}

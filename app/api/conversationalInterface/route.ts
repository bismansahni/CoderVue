import sessionStore from "@/lib/session-store";
import { AIInterviewer } from "@/lib/openai";
import { NextRequest, NextResponse } from "next/server";


// Export the POST handler for Next.js API route with streaming support
export async function POST(req: NextRequest): Promise<Response> {
    try {
        // Extract sessionId from the query parameters
        const sessionId = req.nextUrl.searchParams.get("sessionId");
        const personality = req.nextUrl.searchParams.get("personality") || "friendly";

        if (!sessionId) {
            return NextResponse.json(
                { error: "Missing sessionId in the query parameters." },
                { status: 400 }
            );
        }

        const data = await req.json();
        const { message, codingQuestion, code, stream = false } = data;

        // Initialize AI Interviewer with selected personality
        const interviewer = new AIInterviewer(personality as keyof typeof import("@/lib/openai").INTERVIEWER_PERSONALITIES);

        // Get the current session history or initialize it
        const history = sessionStore.get(sessionId);

        // If codingQuestion is provided and it's the first interaction, set up the system prompt
        if (codingQuestion && history.length === 0) {
            const systemPrompt = await interviewer.generateSystemPrompt(codingQuestion);
            history.push({ role: "system", content: systemPrompt });
        }

        // Append user message to the session history
        if (message) {
            history.push({ role: "user", content: message });
        }

        // Append user code to the session history if provided
        if (code) {
            // Analyze the code and provide context to the AI
            const codeContext = `User's current code:\n\`\`\`\n${code}\n\`\`\``;
            history.push({ role: "user", content: codeContext });
        }

        // If streaming is requested, return a streaming response
        if (stream) {
            const encoder = new TextEncoder();
            const streamResponse = new ReadableStream({
                async start(controller) {
                    try {
                        const streamResult = await interviewer.streamResponse(history);
                        let fullResponse = '';

                        for await (const chunk of streamResult) {
                            const text = chunk.choices[0]?.delta?.content || '';
                            if (text) {
                                fullResponse += text;
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                            }
                        }

                        // Save the complete response to history
                        history.push({ role: "assistant", content: fullResponse });
                        sessionStore.set(sessionId, history);

                        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                        controller.close();
                    } catch (error) {
                        controller.error(error);
                    }
                },
            });

            return new Response(streamResponse, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        } else {
            // Non-streaming response (backward compatibility)
            const response = await interviewer.generateResponse(history);
            
            // Append assistant's response to history
            history.push({ role: "assistant", content: response });
            sessionStore.set(sessionId, history);

            return NextResponse.json({ response });
        }
    } catch (error) {
        console.error("Error in POST /conversationalInterface:", error);
        return NextResponse.json(
            { error: "An error occurred while generating the response." },
            { status: 500 }
        );
    }
}
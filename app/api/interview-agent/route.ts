import { NextRequest, NextResponse } from "next/server";
import { AIInterviewer } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { 
      agentType, 
      stage, 
 
      personality = 'friendly',
      userMessage,
      code,
      question,
      history = [],
      approachSummary
    } = await req.json();

    console.log('Agent API called:', { 
      agentType, 
      stage, 
      personality, 
      userMessage,
      historyLength: history.length,
      historyPreview: history.slice(-2) // Last 2 messages
    });

    // Initialize AI Interviewer
    const interviewer = new AIInterviewer(personality as any);
    
    let response = "";
    let nextStage = null;

    // Route to different agent behaviors based on type
    switch(agentType) {
      case 'greeting':
        // Generate natural, casual greeting like a real interviewer
        const greetingPrompt = `You're a ${personality} tech interviewer starting an interview.

Real interviewers greet like:
- "Hey, how's it going?"
- "Hi there, ready to start?"
- "Hey, good to meet you"

Be casual and natural. Max 7 words.`;

        response = await interviewer.generateResponse([
          { role: 'system', content: greetingPrompt }
        ]);
        break;
        
      case 'greeting_response':
        // Use AI to handle greeting response naturally
        if (userMessage) {
          // Count user messages in history (including current one)
          const conversationCount = history.filter((h: any) => h.role === 'user').length;
          console.log('Greeting response - user message:', userMessage);
          console.log('History length:', history.length, 'User messages:', conversationCount);
          
          // Build full conversation context
          const conversationContext = history.map((msg: any) => 
            `${msg.role === 'user' ? 'Candidate' : 'You'}: ${msg.content}`
          ).join('\n');
          
          const prompt = `You're a ${personality} tech interviewer.

Conversation:
${conversationContext}

Candidate: "${userMessage}"

Real interviewers respond with:
- "Good to hear, ready?"
- "Great, let's get started" 
- "Cool, here's the problem"
- "Alright, let's dive in"

Keep it casual. Max 6 words. If 2nd exchange, transition to problem.`;

          const aiResponse = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
          
          response = aiResponse;
          
          // Simple transition: if user mentions coding/problem/start, move immediately
          const lowerMsg = userMessage.toLowerCase();
          const wantsToStart = 
            lowerMsg.includes('cod') ||  // code, coding
            lowerMsg.includes('problem') ||
            lowerMsg.includes('start') ||
            lowerMsg.includes('begin') ||
            lowerMsg.includes('ready') ||
            lowerMsg.includes("let's") ||
            lowerMsg.includes('skip');
            
          // Transition if user wants to start, or after 2 exchanges
          if (wantsToStart) {
            console.log('User wants to start - transitioning to problem');
            console.log('Setting nextStage to problem_discussion');
            nextStage = 'problem_discussion';
            console.log('Will return nextStage:', nextStage);
          } else if (conversationCount >= 2) {
            console.log('2+ exchanges - transitioning to problem');
            // Let the AI's natural response play, THEN transition
            // The response should already include transition language from the prompt
            nextStage = 'problem_discussion';
            console.log('Will return nextStage:', nextStage);
          }
        } else {
          // Generate response even without user message
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. The greeting phase needs to transition. Give a brief transition to starting the interview (max 10 words).` }
          ]);
          nextStage = 'problem_discussion';
        }
        break;
        
      case 'problem_discussion':
        // Single agent to handle problem presentation, clarifications, and approach discussion
        if (!userMessage && question) {
          // Initial problem presentation - ask for thoughts
          const prompt = `You're a ${personality} interviewer. The candidate just saw this problem:

"${question}"

Real interviewers ask:
- "What do you think?"
- "Initial thoughts?"
- "How would you approach this?"
- "What comes to mind?"

Pick one. Be neutral, not overly encouraging. Max 6 words.`;
          
          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        } else if (userMessage && question) {
          // Handle ongoing discussion
          const exchangeCount = history.filter((h: any) => h.role === 'user').length;
          
          // Analyze what the user is talking about
          const userLower = userMessage.toLowerCase();
          const hasApproach = userLower.includes('sliding window') ||
                             userLower.includes('two pointer') ||
                             userLower.includes('hash') ||
                             userLower.includes('set') ||
                             userLower.includes('array') ||
                             userLower.includes('loop') ||
                             userLower.includes('iterate') ||
                             userLower.includes('binary') ||
                             userLower.includes('dynamic') ||
                             userLower.includes('recursion') ||
                             userLower.includes('approach') ||
                             userLower.includes('solve');
          
          const askingClarification = userMessage.includes('?');
          const readyToCoding = userLower.includes('ready') || 
                               userLower.includes('code') || 
                               userLower.includes('implement') ||
                               userLower.includes('start') ||
                               userLower.includes("let's go");
          
          // Build context for AI
          const recentExchanges = history.slice(-4).map((msg: any) => 
            `${msg.role === 'user' ? 'Candidate' : 'You'}: ${msg.content}`
          ).join('\n');
          
          const prompt = `You're a ${personality} interviewer in a real coding interview.

Problem: "${question}"

Recent conversation:
${recentExchanges}

Candidate just said: "${userMessage}"

Context:
- Exchanges so far: ${exchangeCount}
- Has approach: ${hasApproach}
- Asking question: ${askingClarification}
- Wants to code: ${readyToCoding}

REAL interviewer behavior:
- Answer clarification questions briefly (yes/no when possible)
- If no approach yet: "What's your approach?" or "How would you solve this?"
- If they have approach and 2+ exchanges: "Let's code" or "Show me" or "Go ahead"
- Don't over-explain or teach
- Be neutral, not overly friendly
- Don't say "great idea" or "excellent approach"

Max 10 words. Professional but distant.`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
          
          // Let AI decide when to transition based on the conversation
          const lowerResponse = response.toLowerCase();
          
          // Check if the AI is suggesting to move to coding
          const shouldTransition = 
            lowerResponse.includes('code') ||
            lowerResponse.includes('implement') ||
            lowerResponse.includes("let's see") ||
            lowerResponse.includes('go ahead') ||
            lowerResponse.includes('show me') ||
            readyToCoding ||
            (hasApproach && exchangeCount >= 2) || // If approach mentioned and 2+ exchanges
            exchangeCount >= 4; // Max 4 exchanges in problem discussion
            
          if (shouldTransition) {
            console.log('Transitioning to coding stage');
            nextStage = 'coding';
          }
        } else {
          // Fallback - no question provided
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. Ask what they think about the problem approach (max 10 words).` }
          ]);
        }
        break;
        
      case 'approach_summary':
        // Summarize the approach discussed so far
        if (history && history.length > 0) {
          const userMessages = history.filter((h: any) => h.role === 'user')
            .map((h: any) => h.content)
            .join(' ');
          
          const prompt = `Based on the candidate's discussion: "${userMessages}"

Summarize their approach in 1-2 sentences. Focus on the algorithm/data structure they plan to use.`;
          
          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
          console.log('Approach summary generated:', response);
        } else {
          const prompt = `The candidate hasn't discussed a clear approach yet. Generate a brief note about this.`;
          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        }
        break;
        
      case 'coding_start':
        // Generate transition to coding message
        response = await interviewer.generateResponse([
          { role: 'system', content: `You're a ${personality} interviewer. Time to code.

Real interviewers say:
- "Go ahead"
- "Let's see the code"
- "Show me"
- "You can start"

Pick one. Max 4 words. Neutral tone.` }
        ]);
        nextStage = 'coding';
        break;
        
      case 'coding_help':
        // Provide intelligent help during coding
        console.log('Coding help agent - stage should be coding:', stage);
        console.log('User message:', userMessage);
        console.log('Has code:', !!code);
        console.log('Has question:', !!question);
        console.log('Has approach summary:', !!approachSummary);
        
        if (userMessage) {
          // Analyze code for context
          
          // Analyze if code looks complete
          const codeComplete = code && 
                              code.includes('return') && 
                              (code.includes('function') || code.includes('def')) &&
                              code.split('\n').length > 5;
          
          const userSaysDone = userMessage.toLowerCase().includes('done') || 
                              userMessage.toLowerCase().includes('finished') ||
                              userMessage.toLowerCase().includes('complete');
          
          const prompt = `You're a ${personality} interviewer in the CODING stage. The candidate is implementing their solution.

Their code:
\`\`\`
${code || '// No code yet'}
\`\`\`

Candidate says: "${userMessage}"
${approachSummary ? `\nNote: They already discussed their approach: "${approachSummary}"` : ''}
Code appears complete: ${codeComplete}
User says they're done: ${userSaysDone}

CRITICAL: You're in CODING stage, NOT problem discussion. They already have an approach.

REAL interviewer responses:
- "Can you see my code?" → "Yes" or "Yep" 
- "Is this correct?" → "Walk me through it" or "Test it"
- If explaining → "Mhm" or "Go on"
- If stuck → "What's the issue?"
- If they say "I'm done" OR code looks complete → "Let's test it" or "Run it with some examples"
- NEVER ask about approach again - they're already coding!

1-5 words MAX. Let them code.`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
          
          // Check if we should transition to testing
          const lowerResponse = response.toLowerCase();
          if ((codeComplete && userSaysDone) || 
              lowerResponse.includes('test') || 
              lowerResponse.includes('run')) {
            console.log('Code complete - transitioning to testing');
            nextStage = 'run_tests'; // Special stage to show run button
          }
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. Check on the candidate's coding progress naturally (max 10 words).` }
          ]);
        }
        // Stay in coding stage unless transitioning to tests
        break;
        
      case 'coding_intervention':
        // AI-initiated intervention during coding
        console.log('Coding intervention triggered');
        console.log('Intervention type:', userMessage); // userMessage is actually the intervention type
        console.log('Current code length:', code?.length || 0);
        
        
        // Generate appropriate message based on intervention type
        const interventionType = userMessage; // The "userMessage" is actually the type
        
        const prompt = `You're a ${personality} interviewer. Time for a periodic check.

Intervention type: ${interventionType}

REAL interviewers check-ins:
- stuck: "How's it going?" or "All good?"
- no_progress: "Everything okay?" or stay silent
- function_complete: "What's the complexity?" or "Edge cases?"
- periodic_checkin: Stay silent or "How's it going?"

Max 4 words. Often interviewers say nothing. Be distant.`;
        
        response = await interviewer.generateResponse([
          { role: 'system', content: prompt }
        ]);
        nextStage = null; // Stay in coding
        break;
        
      case 'testing_feedback':
        // Provide intelligent feedback based on test results
        if (userMessage) {
          try {
            const testData = JSON.parse(userMessage);
            const { passed, total, failedExample } = testData;
            
            if (failedExample) {
              // Analyze the failure and provide a hint
              const prompt = `You're a ${personality} interviewer. The candidate's code failed some tests.

Test failure details:
- ${passed}/${total} tests passed
- Failed test: "${failedExample.description}"
- Input: ${JSON.stringify(failedExample.input)}
- Expected: ${JSON.stringify(failedExample.expected)}
- Got: ${JSON.stringify(failedExample.actual)}

Provide a HINT about what might be wrong WITHOUT giving the solution. Focus on:
- What type of issue it might be (logic, edge case, off-by-one, etc.)
- Which part of their approach to reconsider
- DON'T give the exact fix

Examples of good hints:
- "Check your loop boundaries"
- "Consider empty input handling"
- "Review your indexing logic"
- "Think about the edge case when..."

Max 15 words. Be helpful but don't solve it for them.`;

              response = await interviewer.generateResponse([
                { role: 'system', content: prompt }
              ]);
            } else {
              // Generic feedback if no specific failure data
              response = `${passed} of ${total} passed. Check your logic.`;
            }
          } catch {
            // Fallback if parsing fails
            response = "Some tests failed. Review your approach.";
          }
        }
        nextStage = null; // Stay in testing
        break;
        
      case 'testing':
        // Generate testing phase response
        if (userMessage && userMessage.includes('Running tests')) {
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. The candidate is running tests.

Say ONE of:
- "Let's see what happens"
- "Running your solution"
- "Testing now"

Max 4 words.` }
          ]);
        } else if (userMessage && userMessage.includes('tests passed')) {
          // Handle test results
          const passedMatch = userMessage.match(/(\d+)\/(\d+) tests passed/);
          if (passedMatch) {
            const passed = parseInt(passedMatch[1]);
            const total = parseInt(passedMatch[2]);
            
            if (passed === 0) {
              response = await interviewer.generateResponse([
                { role: 'system', content: `Tests failed. Say ONE of:
- "Check your logic"
- "Debug the issue"
- "Review your code"

Max 4 words.` }
              ]);
            } else if (passed < total) {
              response = await interviewer.generateResponse([
                { role: 'system', content: `Some tests failed. Say ONE of:
- "Almost there"
- "Fix the failing cases"
- "Check edge cases"

Max 4 words.` }
              ]);
            }
            // Note: If all passed, the frontend handles it and ends the interview
          }
        } else {
          // Don't suggest random test values - we have actual test cases
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. Testing phase.

The candidate is reviewing test results. Say ONE of:
- "Review your approach"
- "Check the logic"
- "Debug it"

Max 4 words. Don't suggest random test values.` }
          ]);
        }
        nextStage = null; // Stay in testing
        break;
        
      default:
        // Generate contextual response based on current stage
        response = await interviewer.generateResponse([
          { role: 'system', content: `You're a ${personality} interviewer.

Neutral acknowledgments:
- "Okay"
- "Continue"
- "Go on"
- "Mhm"

Pick one. Max 2 words.` }
        ]);
    }

    console.log('About to return response with:', {
      hasMessage: !!response,
      nextStage: nextStage || 'none',
      agentType,
      currentStage: stage
    });
    
    return NextResponse.json({
      message: response,
      nextStage,
      agentType,
      stage  // This is the current stage that was passed in
    });

  } catch (error) {
    console.error("Error in interview-agent:", error);
    
    // Return a simple error response
    return NextResponse.json(
      { 
        message: "Let's continue. What were you saying?",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
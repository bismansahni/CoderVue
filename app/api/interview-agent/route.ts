import { NextRequest, NextResponse } from "next/server";
import { AIInterviewer } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const { 
      agentType, 
      stage, 
      sessionId, 
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
          const codeLines = code ? code.split('\n').length : 0;
          const hasFunction = code ? code.includes('function') : false;
          const hasReturn = code ? code.includes('return') : false;
          const codeProgress = hasFunction && hasReturn ? 'making progress' : 'just starting';
          
          const prompt = `You're a ${personality} interviewer watching someone code.

Their code:
\`\`\`
${code || '// No code yet'}
\`\`\`

Candidate says: "${userMessage}"

REAL interviewer behavior:
- "Can you see my code?" → "Yes" or "Yep" or "I see it"
- If explaining their logic → "Okay" or "Mhm" or "Go on"
- If stuck → "What are you thinking?" or "Where are you stuck?"
- If asking for help → "What have you tried?"
- Don't point out errors unless asked
- Don't teach or explain concepts
- Be mostly silent, let them work

1-8 words MAX. Neutral, professional.`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. Check on the candidate's coding progress naturally (max 10 words).` }
          ]);
        }
        // Stay in coding stage - no transition needed
        nextStage = null;
        break;
        
      case 'coding_intervention':
        // AI-initiated intervention during coding
        console.log('Coding intervention triggered');
        console.log('Intervention type:', userMessage); // userMessage is actually the intervention type
        console.log('Current code length:', code?.length || 0);
        
        // Analyze code for intelligent feedback
        let codeAnalysis = '';
        if (code) {
          const lines = code.split('\n');
          const nonEmptyLines = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length;
          const hasLoop = code.includes('for') || code.includes('while');
          const hasCondition = code.includes('if');
          const functionCount = (code.match(/function/g) || []).length;
          
          if (nonEmptyLines < 5) {
            codeAnalysis = 'The candidate has just started coding.';
          } else if (functionCount > 0 && hasLoop) {
            codeAnalysis = 'The candidate has made good progress with function structure and loops.';
          } else if (functionCount > 0) {
            codeAnalysis = 'The candidate has defined a function and is working on the logic.';
          } else {
            codeAnalysis = 'The candidate is exploring the problem.';
          }
        }
        
        // Generate appropriate message based on intervention type
        const interventionType = userMessage; // The "userMessage" is actually the type
        let interventionPrompt = '';
        
        switch(interventionType) {
          case 'stuck':
            interventionPrompt = `EXACTLY ONE OF: "What's the issue?" or "Where are you stuck?"`;
            break;
          case 'no_progress':
            interventionPrompt = `EXACTLY ONE OF: "How's it going?" or "Need help?"`;
            break;
          case 'function_complete':
            interventionPrompt = `EXACTLY ONE OF: "What's the runtime?" or "Edge cases?"`;
            break;
          case 'periodic_checkin':
            interventionPrompt = `EXACTLY ONE OF: "How's it going?" or "All good?"`;
            break;
          default:
            interventionPrompt = `EXACTLY: "How's it going?"`;
        }
        
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
        
      case 'testing':
        // Generate testing phase response
        response = await interviewer.generateResponse([
          { role: 'system', content: `You're a ${personality} interviewer. Testing phase.

Real interviewers ask:
- "Test it with [1,2,3]"
- "What about empty input?"
- "Edge cases?"
- "Walk me through an example"

Pick one. Max 6 words. Direct, no fluff.` }
        ]);
        nextStage = 'testing';
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
    
    // Generate a natural error recovery message
    try {
      const interviewer = new AIInterviewer(personality as any);
      const fallbackMessage = await interviewer.generateResponse([
        { role: 'system', content: `You're an interviewer and encountered a technical issue. Give a brief, natural recovery message (max 10 words).` }
      ]);
      
      return NextResponse.json(
        { 
          message: fallbackMessage,
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      );
    } catch (fallbackError) {
      // If even the fallback fails, use a simple message
      return NextResponse.json(
        { 
          message: "Let's continue. What were you saying?",
          error: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      );
    }
  }
}
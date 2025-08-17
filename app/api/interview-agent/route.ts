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
      history = []
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
        const greetingPrompt = `You're a ${personality} tech interviewer. Be casual and natural.

STYLE GUIDE:
- friendly: "Hey, how's it going?"
- google: "Hey there, how are you doing today?"
- amazon: "Morning! How are you?"
- startup: "Hey! How's it going?"

Just greet them casually. ONE short sentence. No excitement, no "welcome to", no formality.
Talk like you would to a colleague, not a student.

Your casual greeting:`;

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
          
          const prompt = `You're a ${personality} tech interviewer. Keep it natural and conversational.

Previous conversation:
${conversationContext}

Candidate said: "${userMessage}"
Exchanges so far: ${conversationCount}

RULES:
1. If they said they're good/fine/well, respond AND transition: "Good to hear. Let's jump into the problem."
2. If they ask how you are: "Doing well, thanks. Let's get started."
3. If they mention code/start/ready: "Alright, here's the problem."
4. After 1 exchange, MUST transition: "Cool, let's dive in." or "Alright, let me show you the problem."
5. Keep it SHORT - max 1-2 brief sentences.
6. Talk naturally - no excitement, no "great!", no "excellent!"
7. DRIVE THE CONVERSATION - always push forward to the problem

Your casual response:`;

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
            
          // ALWAYS transition if user wants to, or after 1 exchange
          if (wantsToStart) {
            console.log('User wants to start - transitioning to problem');
            console.log('Setting nextStage to problem_introduction');
            nextStage = 'problem_introduction';
            // Override response to acknowledge transition
            response = "Alright, here's today's problem.";
            console.log('Will return nextStage:', nextStage);
          } else if (conversationCount >= 1) {
            console.log('1+ exchanges - transitioning to problem');
            // Let the AI's natural response play, THEN transition
            // The response should already include transition language from the prompt
            nextStage = 'problem_introduction';
            console.log('Will return nextStage:', nextStage);
          }
        } else {
          // Generate response even without user message
          response = await interviewer.generateResponse([
            { role: 'system', content: `As a ${personality} interviewer, acknowledge and transition to showing the problem. Keep it brief and natural.` }
          ]);
          nextStage = 'problem_introduction';
        }
        break;
        
      case 'problem_thoughts':
        // Ask for thoughts like a real interviewer
        const thoughtsPrompt = `You're a ${personality} interviewer. The candidate is looking at the problem.

Be brief and natural. Examples:
- "Take a sec to read through it."
- "Let me know when you're ready."
- "What do you think?"
- "Initial thoughts?"

ONE short sentence. Casual, not formal.

Your brief comment:`;

        response = await interviewer.generateResponse([
          { role: 'system', content: thoughtsPrompt }
        ]);
        break;
        
      case 'problem_ready':
        // Use AI to respond naturally after they've seen the problem
        if (userMessage) {
          const prompt = `You are a ${personality} technical interviewer. The candidate just saw the problem.

Problem shown: ${question}
Candidate said: "${userMessage}"

BE NATURAL:
1. Acknowledge briefly: "Okay" or "Alright" or "Mhm"
2. Push for approach: "What's your thinking?" or "How would you tackle this?"
3. ONE sentence. Brief. Natural.

Examples:
- "Alright, what's your approach?"
- "Okay, how would you solve this?"
- "Hmm, what are you thinking?"
- "So what's the plan?"

Your response:`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `As a ${personality} interviewer, ask about their approach. Examples: "What's your approach?" or "How would you tackle this?" - ONE sentence.` }
          ]);
        }
        nextStage = 'clarification';
        break;
        
      case 'clarification':
        // Use AI to handle clarification/discussion intelligently
        if (userMessage && question) {
          const conversationInStage = history.filter((h: any) => 
            h.role === 'user' && history.indexOf(h) > history.findIndex((m: any) => 
              m.content?.includes('problem') || m.content?.includes('Problem')
            )
          ).length;
          
          // Build conversation context for better responses
          const recentHistory = history.slice(-6).map((msg: any) => 
            `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
          ).join('\n');
          
          const prompt = `You're a ${personality} interviewer discussing the approach.

Problem: ${question}

Candidate said: "${userMessage}"
Exchanges: ${conversationInStage}

BE NATURAL AND DIRECTIVE:
1. Answer clarifications briefly: "Yeah, exactly" or "No duplicates, correct"
2. IMMEDIATELY push for approach: "So what's your approach?" or "How would you solve this?"
3. After 1 exchange, PUSH TO CODE: "Let's see the code" or "Show me what you got"
4. If they want to code: "Go ahead"
5. ONE sentence responses. Brief.
6. DRIVE FORWARD - don't let them linger

Examples:
- "Yep, that's right"
- "What's the time complexity?"
- "Let's code it up"
- "Show me what you're thinking"

Your brief response:`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
          
          // Check if AI or user wants to move to coding
          const lowerMessage = userMessage.toLowerCase();
          const lowerResponse = response.toLowerCase();
          
          // More flexible matching for coding requests
          const wantsToCoding = 
            lowerMessage.includes('ready to code') || 
            lowerMessage.includes('start coding') ||
            lowerMessage.includes("let's code") || 
            lowerMessage.includes('begin coding') ||
            lowerMessage.includes("start implementing") ||
            (lowerMessage.includes("move to") && lowerMessage.includes("cod")) ||
            (lowerMessage.includes("let's") && lowerMessage.includes("cod")) ||
            (lowerMessage.includes("open") && lowerMessage.includes("editor")) ||
            lowerMessage.includes("want to code") ||
            lowerMessage.includes("i'm ready");
            
          if (wantsToCoding || 
              lowerResponse.includes("move to the code editor") ||
              lowerResponse.includes("let's move to the editor")) {
            console.log('User wants to code - transitioning to coding stage');
            nextStage = 'coding';
          }
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `As a ${personality} interviewer in the clarification phase, ask the candidate about their approach to the problem. Be natural and encouraging.` }
          ]);
        }
        break;
        
      case 'coding_start':
        // Generate transition to coding message
        response = await interviewer.generateResponse([
          { role: 'system', content: `As a ${personality} interviewer, the candidate is ready to code.

EXAMPLES:
- "Alright, go ahead"
- "Let's see what you got"
- "Take your time"
- "Go for it"

ONE brief sentence. No encouragement, no "I'm here to help", just acknowledge they're coding.` }
        ]);
        nextStage = 'coding';
        break;
        
      case 'coding_help':
        // Provide intelligent help during coding
        console.log('Coding help agent - stage should be coding:', stage);
        console.log('User message:', userMessage);
        console.log('Has code:', !!code);
        console.log('Has question:', !!question);
        
        if (userMessage) {
          // Analyze code for context
          const codeLines = code ? code.split('\n').length : 0;
          const hasFunction = code ? code.includes('function') : false;
          const hasReturn = code ? code.includes('return') : false;
          const codeProgress = hasFunction && hasReturn ? 'making progress' : 'just starting';
          
          const prompt = `You are a ${personality} technical interviewer. The candidate is coding.

${question ? `Problem: ${question}` : 'The candidate is working on a coding problem.'}

${code ? `Current code (${codeLines} lines, ${codeProgress}):\n\`\`\`javascript\n${code}\n\`\`\`` : 'No code written yet.'}

Candidate says: "${userMessage}"

BE REALISTIC:
1. If stuck: "What's the issue?" or "Where are you getting stuck?"
2. If explaining: "Mhm" or "Right" or "I see"
3. If asking for help: Give ONE small hint, not the solution
4. Test cases: "What about empty input?" or "Think about edge cases"
5. Keep it SHORT - 1-2 sentences max
6. Don't be overly helpful or supportive

Examples:
- "What's your approach?"
- "Try thinking about the base case"
- "What happens if the array is empty?"
- "Walk me through this logic"

Your brief response:`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `As a ${personality} interviewer, briefly check on progress. Examples: "How's it going?" or "Talk me through your approach" - ONE sentence.` }
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
            interventionPrompt = `Give a subtle hint. Examples: "Hmm, what if we used a different data structure?" or "Have you considered the sorted property?" or "What's happening in this loop?"`;
            break;
          case 'no_progress':
            interventionPrompt = `Natural check-in: "So what's your approach?" or "Walk me through your thinking" or "What are you considering?"`;
            break;
          case 'function_complete':
            interventionPrompt = `Quick follow-up: "What's the runtime?" or "Any edge cases?" or "How would you test this?"`;
            break;
          case 'periodic_checkin':
            interventionPrompt = `Brief check: "How's it going?" or "What's your plan?" or "Where are we at?"`;
            break;
          default:
            interventionPrompt = `Natural comment: "What are you thinking?" or "Talk me through this"`;
        }
        
        const prompt = `You are a ${personality} technical interviewer. You need to proactively check in on the candidate during coding.

${question ? `Problem: ${question}` : ''}
${codeAnalysis}
${code ? `Lines of code written: ${code.split('\n').length}` : 'No code yet'}

${interventionPrompt}

Keep your response brief (1-2 sentences), natural, and supportive.
Don't be pushy - this is just a gentle check-in.
Vary your language to avoid sounding repetitive.

Your check-in:`;
        
        response = await interviewer.generateResponse([
          { role: 'system', content: prompt }
        ]);
        nextStage = null; // Stay in coding
        break;
        
      case 'testing':
        // Generate testing phase response
        response = await interviewer.generateResponse([
          { role: 'system', content: `As a ${personality} interviewer, time to test the code.

Examples:
- "Let's test this with an example"
- "Walk me through a test case"
- "What if the input is empty?"
- "Try it with [1,2,3]"

ONE sentence. Direct. No fluff.` }
        ]);
        nextStage = 'testing';
        break;
        
      default:
        // Generate contextual response based on current stage
        response = await interviewer.generateResponse([
          { role: 'system', content: `As a ${personality} interviewer at stage: ${stage}. Be brief and natural. ONE sentence max. Examples: "Go on", "What else?", "Okay", "Continue"` }
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
    
    // Even errors should be handled naturally
    const fallbackMessage = "I need a moment to gather my thoughts. Let's continue - what were you saying?";
    
    return NextResponse.json(
      { 
        message: fallbackMessage,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
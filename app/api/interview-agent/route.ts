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
        // Generate initial greeting using AI based on personality
        const greetingPrompt = `You are a ${personality} technical interviewer starting a coding interview session.

Your personality style:
- friendly: warm, supportive, encouraging
- google: professional, algorithmic-focused, analytical
- amazon: leadership-focused, principle-driven, thorough
- startup: casual, practical, fast-paced

Generate a natural greeting that:
1. Welcomes the candidate
2. Sets the tone for the interview
3. Asks how they're doing or feeling
4. Keep it to 1-2 sentences
5. Be authentic to your personality style

Generate greeting:`;

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
          
          const prompt = `You are a ${personality} technical interviewer in a coding interview.

Previous conversation:
${conversationContext}

Candidate just said: "${userMessage}"
Number of exchanges so far: ${conversationCount}

Your task:
1. If they mention "code/coding/start/begin/ready/problem/let's go", respond: "Absolutely! Let me show you today's problem."
2. Otherwise, respond naturally and contextually to what they said
3. Remember what was said before - don't repeat yourself
4. If this is the 3rd or 4th exchange, transition: "Great! Let me share today's coding problem with you."
5. Keep response under 2 sentences

Respond naturally and contextually:`;

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
            
          // ALWAYS transition if user wants to, or after 3 exchanges
          if (wantsToStart) {
            console.log('User wants to start - transitioning to problem');
            console.log('Setting nextStage to problem_introduction');
            nextStage = 'problem_introduction';
            // Override response to acknowledge transition
            response = "Absolutely! Let me show you today's problem. Take a moment to read through it.";
            console.log('Will return nextStage:', nextStage);
          } else if (conversationCount >= 3) {
            console.log('3+ exchanges - transitioning to problem');
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
        // Proactively ask for initial thoughts when problem is first shown
        const thoughtsPrompt = `You are a ${personality} technical interviewer. The candidate just saw this problem:

${question}

Generate a natural response that:
1. Gives them a moment to read it
2. Asks for their initial thoughts and approach
3. Encourages them to think out loud
4. Keep it to 2-3 sentences
5. Be encouraging and supportive

Example responses:
- "Take a moment to read through that. What are your initial thoughts on how you might approach this?"
- "Alright, there's the problem. What's your first instinct about how to solve this?"
- "Take your time reading it. When you're ready, I'd love to hear your initial approach."

Generate a natural response:`;

        response = await interviewer.generateResponse([
          { role: 'system', content: thoughtsPrompt }
        ]);
        // Stay in problem_introduction stage, don't auto-transition
        break;
        
      case 'problem_ready':
        // Use AI to respond naturally after they've seen the problem
        if (userMessage) {
          const prompt = `You are a ${personality} technical interviewer. The candidate just saw the problem and responded.

Problem shown: ${question}
Candidate said: "${userMessage}"

Your task:
1. Acknowledge their response naturally
2. Ask about their initial thoughts and approach
3. Encourage them to think out loud
4. Keep response under 3 sentences
5. Be encouraging but also probe their understanding

Respond naturally:`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `As a ${personality} interviewer, the candidate just saw the problem. Ask about their initial thoughts and approach. Be encouraging and natural.` }
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
          
          const prompt = `You are a ${personality} technical interviewer in the clarification/approach discussion phase.

Problem: ${question}

Recent conversation:
${recentHistory}

Candidate just said: "${userMessage}"
Exchanges in this stage: ${conversationInStage}

Your task:
1. If they ask a clarifying question, answer helpfully without giving away the solution
2. If they describe their approach, provide feedback and ask follow-up questions
3. After 3-4 good exchanges about approach, suggest: "Your approach sounds solid! When you're ready, just say 'I'm ready to code' and we'll move to the editor."
4. If they explicitly say they want to code/start/implement, respond with: "Excellent! Let's move to the code editor. Feel free to think out loud as you implement your solution."
5. Keep responses under 3 sentences
6. Remember the context of what was discussed - don't repeat questions

Respond naturally and contextually:`;

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
          { role: 'system', content: `As a ${personality} interviewer, the candidate is ready to start coding. Welcome them to the coding phase, encourage them to think out loud, and let them know you're there to help. Keep it brief and encouraging.` }
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
          
          const prompt = `You are a ${personality} technical interviewer helping during the coding phase.

${question ? `Problem: ${question}` : 'The candidate is working on a coding problem.'}

${code ? `Current code (${codeLines} lines, ${codeProgress}):\n\`\`\`javascript\n${code}\n\`\`\`` : 'No code written yet.'}

Candidate says: "${userMessage}"

Your task:
1. If they say they're stuck or can't do it, provide gentle hints without giving the solution
2. If they explain their code, acknowledge and encourage
3. If they seem stuck, ask guiding questions like "What have you tried so far?" or "What part is challenging?"
4. If they ask about test cases, help them think through edge cases
5. Be supportive and encouraging, especially if they're struggling
6. Keep response under 3 sentences
7. Reference their actual code when relevant

Respond naturally and helpfully:`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `As a ${personality} interviewer during the coding phase, check in with the candidate about their progress. Be supportive and encourage them to think out loud.` }
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
            interventionPrompt = `Generate a gentle check-in. The candidate seems stuck (no code or voice activity). Ask if they need help or want to talk through their approach. Be encouraging.`;
            break;
          case 'no_progress':
            interventionPrompt = `The candidate hasn't written code for a while. Check in to see what they're thinking about. Maybe they're planning their approach.`;
            break;
          case 'function_complete':
            interventionPrompt = `The candidate just completed a function. Acknowledge their progress and ask about their approach or edge cases.`;
            break;
          case 'periodic_checkin':
            interventionPrompt = `Do a friendly periodic check-in. Ask how their solution is coming along.`;
            break;
          default:
            interventionPrompt = `Check in on the candidate's progress. Be supportive and encouraging.`;
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
          { role: 'system', content: `As a ${personality} interviewer, guide the candidate through testing their solution. Ask them to walk through test cases and edge cases. Be thorough but supportive.` }
        ]);
        nextStage = 'testing';
        break;
        
      default:
        // Generate contextual response based on current stage
        response = await interviewer.generateResponse([
          { role: 'system', content: `As a ${personality} interviewer, respond appropriately to the candidate. Current stage: ${stage}. Be natural and helpful.` }
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
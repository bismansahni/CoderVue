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
            nextStage = 'problem_introduction';
            // Override response to acknowledge transition
            response = "Absolutely! Let me show you today's problem. Take a moment to read through it.";
          } else if (conversationCount >= 3) {
            console.log('3+ exchanges - transitioning to problem');
            nextStage = 'problem_introduction';
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
          
          if (lowerMessage.includes('ready to code') || 
              lowerMessage.includes('start coding') ||
              lowerMessage.includes("let's code") || 
              lowerMessage.includes('begin coding') ||
              lowerMessage.includes("start implementing") ||
              lowerResponse.includes("move to the code editor") ||
              lowerResponse.includes("let's move to the editor")) {
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
        if (userMessage && code) {
          const prompt = `You are a ${personality} interviewer helping during the coding phase.

Problem: ${question}

Current code:
\`\`\`javascript
${code}
\`\`\`

Candidate says: "${userMessage}"

Your task:
1. If they ask for help, provide hints without giving the solution
2. If they explain their code, acknowledge and encourage
3. If they seem stuck, ask guiding questions
4. If they ask about test cases, help them think through edge cases
5. Be supportive and encouraging
6. Keep response under 3 sentences

Respond naturally:`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `As a ${personality} interviewer during the coding phase, check in with the candidate about their progress. Be supportive and encourage them to think out loud.` }
          ]);
        }
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

    return NextResponse.json({
      message: response,
      nextStage,
      agentType,
      stage
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
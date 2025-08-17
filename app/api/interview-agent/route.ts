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
        const greetingPrompt = `You're a ${personality} tech interviewer starting an interview. Give a brief, casual greeting (max 5 words). Be natural and friendly.`;

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
          
          const prompt = `You're a ${personality} tech interviewer. The candidate just responded to your greeting.

Previous conversation:
${conversationContext}

Candidate said: "${userMessage}"

Respond naturally and briefly (max 5 words). If this is the 2nd exchange, transition to showing the problem.`;

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
            console.log('Setting nextStage to problem_introduction');
            nextStage = 'problem_introduction';
            console.log('Will return nextStage:', nextStage);
          } else if (conversationCount >= 2) {
            console.log('2+ exchanges - transitioning to problem');
            // Let the AI's natural response play, THEN transition
            // The response should already include transition language from the prompt
            nextStage = 'problem_introduction';
            console.log('Will return nextStage:', nextStage);
          }
        } else {
          // Generate response even without user message
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. The greeting phase needs to transition. Give a brief transition to starting the interview (max 10 words).` }
          ]);
          nextStage = 'problem_introduction';
        }
        break;
        
      case 'problem_thoughts':
        // Ask for thoughts like a real interviewer
        const thoughtsPrompt = `You're a ${personality} interviewer. The candidate just saw the problem. Ask for their initial thoughts in 5 words or less. Be natural.`;

        response = await interviewer.generateResponse([
          { role: 'system', content: thoughtsPrompt }
        ]);
        break;
        
      case 'problem_ready':
        // Use AI to respond naturally after they've seen the problem
        if (userMessage) {
          // Count how many times they've discussed in this stage
          const discussionCount = history.filter((h: any) => h.role === 'user').length;
          
          const prompt = `You're a ${personality} interviewer. The candidate is looking at the problem.

Problem: ${question}
Candidate said: "${userMessage}"
Discussion count: ${discussionCount}

${discussionCount === 0 ? 'Ask about their initial thoughts' : 'Ask about their approach'}. Keep it under 10 words. Be natural, not robotic.`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
          
          // Transition quickly after 1-2 exchanges
          if (discussionCount >= 1 || 
              userMessage.toLowerCase().includes('approach') ||
              userMessage.toLowerCase().includes('solve') ||
              userMessage.toLowerCase().includes('implement') ||
              response.toLowerCase().includes('approach')) {
            nextStage = 'clarification';
          }
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. Ask about their initial thoughts on the problem. Keep it under 10 words and natural.` }
          ]);
        }
        break;
        
      case 'clarification':
        // Use AI to handle clarification/discussion intelligently
        if (userMessage && question) {
          const conversationInStage = history.filter((h: any) => 
            h.role === 'user' && history.indexOf(h) > history.findIndex((m: any) => 
              m.content?.includes('problem') || m.content?.includes('Problem')
            )
          ).length;
          
          // Check if user mentioned an approach
          const mentionedApproach = userMessage.toLowerCase().includes('sliding window') ||
                                   userMessage.toLowerCase().includes('two pointer') ||
                                   userMessage.toLowerCase().includes('hash') ||
                                   userMessage.toLowerCase().includes('binary') ||
                                   userMessage.toLowerCase().includes('dynamic') ||
                                   userMessage.toLowerCase().includes('recursion') ||
                                   userMessage.toLowerCase().includes('approach') ||
                                   userMessage.toLowerCase().includes('solve');
          
          const prompt = `You're a ${personality} interviewer discussing the problem approach.

Problem: ${question}
Candidate said: "${userMessage}"
Exchanges in this stage: ${conversationInStage}
Mentioned approach: ${mentionedApproach}

${!mentionedApproach ? 
  'They haven\'t mentioned an approach yet. Ask about it.' :
  conversationInStage === 0 ? 
  'They mentioned an approach. Briefly ask about complexity or confirm understanding.' :
  'Time to move to coding. Tell them to start coding.'}

Keep response under 10 words. Be natural and conversational.`;

          response = await interviewer.generateResponse([
            { role: 'system', content: prompt }
          ]);
          
          // Check if AI or user wants to move to coding
          const lowerMessage = userMessage.toLowerCase();
          const lowerResponse = response.toLowerCase();
          
          // SIMPLIFIED: Move to coding quickly
          // If they mentioned an approach and had 1-2 exchanges, that's enough
          const readyForCoding = mentionedApproach && conversationInStage >= 1;
          
          // Check if user wants to code
          const wantsToCoding = 
            lowerMessage.includes('ready to code') || 
            lowerMessage.includes('start coding') ||
            lowerMessage.includes("let's code") || 
            lowerMessage.includes('begin coding') ||
            lowerMessage.includes("want to code") ||
            lowerMessage.includes("i'm ready");
            
          // Move to coding quickly:
          // 1. They want to code OR
          // 2. They have an approach and 1+ exchange OR
          // 3. AI suggests coding OR
          // 4. Max 3 exchanges regardless
          if (wantsToCoding || 
              readyForCoding ||
              conversationInStage >= 3 || // Max 3 exchanges
              lowerResponse.includes("code") || 
              lowerResponse.includes("implement") ||
              lowerResponse.includes("let's see")) {
            console.log('Moving to coding (keeping it brief)');
            
            // Summarize the approach before moving to coding
            if (mentionedApproach && userMessage) {
              // Extract key approach elements from the conversation
              const approachElements = [];
              if (userMessage.toLowerCase().includes('sliding window')) approachElements.push('sliding window');
              if (userMessage.toLowerCase().includes('two pointer')) approachElements.push('two pointers');
              if (userMessage.toLowerCase().includes('hash')) approachElements.push('hash map');
              if (userMessage.toLowerCase().includes('array')) approachElements.push('array traversal');
              if (userMessage.toLowerCase().includes('loop')) approachElements.push('iteration');
              
              // Build approach summary from recent messages
              const recentMessages = history.slice(-4)
                .filter((h: any) => h.role === 'user')
                .map((h: any) => h.content)
                .join(' ');
              
              // Store approach summary
              console.log('Approach discussed:', recentMessages);
            }
            
            nextStage = 'coding';
          }
        } else {
          response = await interviewer.generateResponse([
            { role: 'system', content: `You're a ${personality} interviewer. The candidate needs to discuss the problem. Ask for their thoughts naturally (max 10 words).` }
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
          { role: 'system', content: `You're a ${personality} interviewer. Tell the candidate to start coding in 5 words or less. Be encouraging.` }
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
          
          const prompt = `You're a ${personality} interviewer. The candidate is coding.

Problem: ${question}
${approachSummary ? `Their approach: ${approachSummary}` : ''}
Code so far: ${codeLines} lines

Candidate says: "${userMessage}"

Respond naturally as an interviewer would. If they're stuck, offer a small hint. If they're explaining, acknowledge. Keep it under 15 words. Be supportive but not overly helpful.`;

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
        
        const prompt = `You're a ${personality} interviewer checking on the candidate's progress.

${codeAnalysis}
Intervention type: ${interventionType}

Give a brief, natural check-in (max 10 words). Don't be pushy. Examples based on type:
- stuck: Ask if they need help
- no_progress: Check how it's going
- function_complete: Ask about edge cases or complexity
- periodic_checkin: Simple check-in

Be natural and supportive.`;
        
        response = await interviewer.generateResponse([
          { role: 'system', content: prompt }
        ]);
        nextStage = null; // Stay in coding
        break;
        
      case 'testing':
        // Generate testing phase response
        response = await interviewer.generateResponse([
          { role: 'system', content: `You're a ${personality} interviewer. Time to test the code. Ask about test cases or edge cases in 10 words or less. Be specific.` }
        ]);
        nextStage = 'testing';
        break;
        
      default:
        // Generate contextual response based on current stage
        response = await interviewer.generateResponse([
          { role: 'system', content: `You're a ${personality} interviewer. Give a brief acknowledgment or encouragement (max 5 words). Be natural.` }
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
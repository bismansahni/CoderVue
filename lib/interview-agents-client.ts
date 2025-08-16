// Client-safe interview orchestration
// All AI calls go through API routes for security

export enum InterviewStage {
  GREETING = 'greeting',
  PROBLEM_INTRODUCTION = 'problem_introduction', 
  CLARIFICATION = 'clarification',
  SOLUTION_DISCUSSION = 'solution_discussion',
  CODING = 'coding',
  CODE_REVIEW = 'code_review',
  TESTING = 'testing',
  OPTIMIZATION = 'optimization',
  BEHAVIORAL = 'behavioral',
  CLOSING = 'closing'
}

export interface InterviewContext {
  stage: InterviewStage;
  question: string;
  currentCode: string;
  timeElapsed: number;
  personality: 'google' | 'amazon' | 'startup' | 'friendly';
}

export interface AgentResponse {
  message: string;
  suggestedNextStage?: InterviewStage;
  hints?: string[];
  shouldShowCode?: boolean;
  emotionalTone?: 'encouraging' | 'neutral' | 'challenging';
  actionButtons?: ActionButton[];
}

interface ActionButton {
  label: string;
  action: string;
  style: 'primary' | 'secondary' | 'subtle';
}

// Client-side orchestrator that calls API routes
export class InterviewOrchestrator {
  private context: InterviewContext;
  private sessionId: string;
  
  constructor(question: string, personality: InterviewContext['personality'], sessionId: string) {
    this.context = {
      stage: InterviewStage.GREETING,
      question,
      currentCode: '',
      timeElapsed: 0,
      personality,
    };
    this.sessionId = sessionId;
  }

  async processMessage(message: string, code?: string): Promise<AgentResponse> {
    if (code) {
      this.context.currentCode = code;
    }
    
    try {
      // Call API route for AI response
      const response = await fetch(
        `/api/conversationalInterface?sessionId=${this.sessionId}&personality=${this.context.personality}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            code,
            stage: this.context.stage,
            codingQuestion: this.context.question
          }),
        }
      );
      
      const data = await response.json();
      
      // Create agent response based on stage
      const agentResponse = this.createStageResponse(data.response);
      
      // Update stage if needed
      if (agentResponse.suggestedNextStage) {
        this.context.stage = agentResponse.suggestedNextStage;
      }
      
      return agentResponse;
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        message: "I'm having trouble processing that. Let's continue.",
        emotionalTone: 'neutral'
      };
    }
  }

  async handleAction(action: string): Promise<AgentResponse> {
    // Handle button actions based on current stage
    switch (action) {
      case 'start':
        this.context.stage = InterviewStage.GREETING;
        return this.getGreeting();
        
      case 'continue':
        // Move to problem introduction after greeting
        if (this.context.stage === InterviewStage.GREETING) {
          this.context.stage = InterviewStage.PROBLEM_INTRODUCTION;
          return {
            message: "Great! Let me share today's problem with you. Take your time to read through it and feel free to ask any clarifying questions.",
            emotionalTone: 'encouraging',
            suggestedNextStage: InterviewStage.CLARIFICATION,
            actionButtons: [
              { label: "I have a question", action: 'ask_clarification', style: 'secondary' },
              { label: "Problem is clear", action: 'discuss_solution', style: 'primary' }
            ]
          };
        }
        return this.getGreeting();
        
      case 'comfort':
        return {
          message: "That's completely normal! Take a deep breath. We'll go at your pace, and I'm here to help you show your best work.",
          emotionalTone: 'encouraging',
          actionButtons: [
            { label: "Thanks, let's start", action: 'continue', style: 'primary' }
          ]
        };
        
      case 'ask_clarification':
        this.context.stage = InterviewStage.CLARIFICATION;
        return {
          message: "Sure! What would you like to clarify about the problem?",
          emotionalTone: 'encouraging',
          actionButtons: []
        };
        
      case 'ask_more':
        // Stay in clarification stage
        return {
          message: "What else would you like to know about the problem?",
          emotionalTone: 'neutral',
          actionButtons: [
            { label: "Nothing else, let's discuss approach", action: 'discuss_solution', style: 'primary' }
          ]
        };
        
      case 'discuss_solution':
        this.context.stage = InterviewStage.SOLUTION_DISCUSSION;
        return {
          message: "Great! Walk me through your approach. How would you solve this?",
          emotionalTone: 'encouraging',
          shouldShowCode: false,
          actionButtons: [
            { label: "Ready to code", action: 'start_coding', style: 'primary' }
          ]
        };
        
      case 'start_coding':
        this.context.stage = InterviewStage.CODING;
        return {
          message: "Excellent! Go ahead and implement your solution. Take your time.",
          emotionalTone: 'encouraging',
          shouldShowCode: true,
          actionButtons: [
            { label: "Run tests", action: 'run_tests', style: 'primary' }
          ]
        };
        
      case 'run_tests':
        this.context.stage = InterviewStage.TESTING;
        return {
          message: "Let's run some test cases to see how your solution performs.",
          emotionalTone: 'neutral'
        };
        
      case 'optimize':
        this.context.stage = InterviewStage.OPTIMIZATION;
        return {
          message: "Good solution! What's the time and space complexity? Can we optimize it further?",
          emotionalTone: 'neutral'
        };
        
      case 'hint':
        return this.provideHint();
        
      default:
        return {
          message: "Let's continue with the problem.",
          emotionalTone: 'neutral'
        };
    }
  }

  private async getGreeting(): Promise<AgentResponse> {
    const greetings = {
      friendly: "Hi there! I'm excited to work through this problem with you today. Ready when you are!",
      google: "Hello! Let's dive into an interesting algorithmic challenge. I'll be evaluating your problem-solving approach.",
      amazon: "Welcome! Today we'll focus on both your solution and how you demonstrate our leadership principles.",
      startup: "Hey! Let's solve a real-world problem together. Speed and practicality matter here."
    };
    
    return {
      message: greetings[this.context.personality],
      suggestedNextStage: InterviewStage.PROBLEM_INTRODUCTION,
      emotionalTone: 'encouraging',
      actionButtons: [
        { label: "I'm ready!", action: 'continue', style: 'primary' },
        { label: "A bit nervous", action: 'comfort', style: 'secondary' }
      ]
    };
  }

  private createStageResponse(aiMessage: string): AgentResponse {
    // Add appropriate buttons based on stage
    const baseResponse: AgentResponse = {
      message: aiMessage,
      emotionalTone: 'neutral'
    };
    
    switch (this.context.stage) {
      case InterviewStage.GREETING:
        baseResponse.actionButtons = [
          { label: "Let's start", action: 'continue', style: 'primary' }
        ];
        break;
        
      case InterviewStage.CLARIFICATION:
        baseResponse.actionButtons = [
          { label: "Ask another question", action: 'ask_more', style: 'secondary' },
          { label: "Start discussing approach", action: 'discuss_solution', style: 'primary' }
        ];
        break;
        
      case InterviewStage.SOLUTION_DISCUSSION:
        baseResponse.actionButtons = [
          { label: "Let me think more", action: 'think_more', style: 'secondary' },
          { label: "Ready to code", action: 'start_coding', style: 'primary' }
        ];
        baseResponse.shouldShowCode = false;
        break;
        
      case InterviewStage.CODING:
        baseResponse.actionButtons = [
          { label: "Run tests", action: 'run_tests', style: 'primary' },
          { label: "Need a hint", action: 'hint', style: 'secondary' }
        ];
        baseResponse.shouldShowCode = true;
        break;
        
      case InterviewStage.TESTING:
        baseResponse.actionButtons = [
          { label: "Debug", action: 'debug', style: 'primary' },
          { label: "Optimize", action: 'optimize', style: 'secondary' }
        ];
        break;
    }
    
    return baseResponse;
  }

  private async provideHint(): Promise<AgentResponse> {
    const hints = [
      "Think about what data structure would help you track elements efficiently.",
      "Consider using a sliding window approach.",
      "What if you used two pointers?",
      "Try breaking down the problem into smaller subproblems."
    ];
    
    // Random hint for now
    const hint = hints[Math.floor(Math.random() * hints.length)];
    
    return {
      message: hint,
      emotionalTone: 'encouraging',
      actionButtons: [
        { label: "Got it, let me try", action: 'continue', style: 'primary' }
      ]
    };
  }
  
  getStage(): InterviewStage {
    return this.context.stage;
  }
  
  updateTime(seconds: number) {
    this.context.timeElapsed = seconds;
  }
}
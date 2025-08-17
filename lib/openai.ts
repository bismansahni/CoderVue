import OpenAI from 'openai';
import { Stream } from 'openai/streaming';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface InterviewerPersonality {
  name: string;
  style: string;
  company: string;
  difficulty: 'easy' | 'medium' | 'hard';
  focusAreas: string[];
}

export const INTERVIEWER_PERSONALITIES: Record<string, InterviewerPersonality> = {
  google: {
    name: 'Google',
    style: 'Friendly and collaborative, focuses on problem-solving and algorithms',
    company: 'Google',
    difficulty: 'hard',
    focusAreas: ['algorithms', 'data structures', 'system design', 'optimization'],
  },
  amazon: {
    name: 'Amazon',
    style: 'Direct and leadership-focused, emphasizes ownership and dive deep',
    company: 'Amazon',
    difficulty: 'medium',
    focusAreas: ['leadership principles', 'scalability', 'customer obsession', 'ownership'],
  },
  startup: {
    name: 'Startup',
    style: 'Practical and fast-paced, values real-world problem solving',
    company: 'Fast-growing startup',
    difficulty: 'medium',
    focusAreas: ['practical solutions', 'speed', 'adaptability', 'full-stack thinking'],
  },
  friendly: {
    name: 'Friendly Mentor',
    style: 'Encouraging and supportive, provides hints and guidance',
    company: 'Tech company',
    difficulty: 'easy',
    focusAreas: ['learning', 'understanding', 'growth', 'fundamentals'],
  },
};

export class AIInterviewer {
  private personality: InterviewerPersonality;
  private sessionContext: string[] = [];

  constructor(personality: keyof typeof INTERVIEWER_PERSONALITIES = 'friendly') {
    this.personality = INTERVIEWER_PERSONALITIES[personality];
  }

  async generateSystemPrompt(codingQuestion: string): Promise<string> {
    return `You are an experienced ${this.personality.company} technical interviewer conducting a coding interview.

PERSONALITY: ${this.personality.style}
DIFFICULTY LEVEL: ${this.personality.difficulty}
FOCUS AREAS: ${this.personality.focusAreas.join(', ')}

THE CODING QUESTION: ${codingQuestion}

INTERVIEW GUIDELINES:
1. Start with a brief, friendly introduction (1-2 sentences max)
2. Present the question clearly and ask if they understand
3. Encourage them to think aloud and explain their approach
4. Guide them with hints if they're stuck, but don't give away the answer
5. Ask about time/space complexity when they finish
6. Suggest optimizations if applicable

RESPONSE STYLE:
- Keep responses concise (2-3 sentences max)
- Use natural speech patterns
- Be encouraging when they make progress
- Point out issues subtly without being harsh
- Include occasional phrases like "That's interesting", "Good approach", "What about edge cases?"

ADAPTIVE BEHAVIOR:
- If they're struggling: Provide subtle hints or break down the problem
- If they're doing well: Ask follow-up questions or add constraints
- If they seem nervous: Be more encouraging and patient
- If they're confident: Challenge their assumptions constructively

Remember: You're evaluating not just the solution, but also their problem-solving process, communication, and ability to handle feedback.`;
  }

  async streamResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    return await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 300, // Keep responses concise
    });
  }

  async generateResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0]?.message?.content || 'I need a moment to think about that...';
  }

  async analyzeCode(code: string, question: string): Promise<string> {
    const prompt = `Analyze this code solution for the problem: "${question}"

Code:
${code}

Provide a brief analysis focusing on:
1. Correctness
2. Time/Space complexity
3. Code quality
4. Potential improvements

Keep response under 100 words.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async generateHint(
    question: string,
    currentCode: string,
    hintLevel: number
  ): Promise<string> {
    const hintPrompts = [
      'Give a very subtle hint without revealing the approach',
      'Provide a slightly more specific hint about the algorithm to use',
      'Give a clear hint about the data structure or technique needed',
      'Provide pseudocode for the first part of the solution',
    ];

    const prompt = `Question: ${question}
Current attempt: ${currentCode}
${hintPrompts[Math.min(hintLevel, hintPrompts.length - 1)]}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || '';
  }

  async evaluateInterview(
    transcription: string,
    question: string,
    finalCode: string
  ): Promise<{ feedback: string; score: number; strengths: string[]; improvements: string[] }> {
    const prompt = `Evaluate this coding interview performance:

Question: ${question}

Transcription: ${transcription}

Final Code: ${finalCode}

Provide a JSON response with:
1. feedback: Constructive feedback (2-3 sentences)
2. score: Performance score (0-100)
3. strengths: List of 2-3 things done well
4. improvements: List of 2-3 areas to improve

Response must be valid JSON.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    try {
      const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
      return {
        feedback: result.feedback || 'Good effort on the problem.',
        score: result.score || 70,
        strengths: result.strengths || [],
        improvements: result.improvements || [],
      };
    } catch {
      return {
        feedback: 'You completed the interview. Keep practicing!',
        score: 70,
        strengths: ['Completed the problem'],
        improvements: ['Practice more problems'],
      };
    }
  }

  async generateQuestion(
    difficulty: 'easy' | 'medium' | 'hard',
    topics: string[],
    avoidQuestions: string[]
  ): Promise<string> {
    const prompt = `Generate a ${difficulty} coding interview question. Topic: ${topics.join(', ')}.

IMPORTANT: Format it EXACTLY like a real interviewer would present it verbally. Keep it simple and conversational.

Examples of good format:
"Given an array of integers, find two numbers that add up to a target sum."
"Write a function to find the longest substring without repeating characters."
"I want you to reverse a linked list."

Rules:
- ONE or TWO sentences max
- No markdown, no formatting, no examples
- Just the core problem statement
- Natural spoken language
- Should take 20-30 minutes to solve

Avoid these: ${avoidQuestions.slice(-3).join('; ')}

Your question:`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content || '';
  }
}

export default openai;
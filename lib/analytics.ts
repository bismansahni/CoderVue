import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
  });
}

export interface InterviewMetrics {
  // Performance metrics
  timeToFirstCode: number;
  totalSolvingTime: number;
  wordsPerMinute: number;
  linesOfCode: number;
  
  // Quality metrics
  codeQuality: number; // 0-100
  bugCount: number;
  compilationAttempts: number;
  testCasesPassed: number;
  testCasesTotal: number;
  optimizationScore: number;
  
  // Communication metrics
  clarityScore: number;
  questionsAsked: number;
  explanationQuality: number;
  technicalAccuracy: number;
  
  // Progress metrics
  difficultyLevel: 'easy' | 'medium' | 'hard';
  completionStatus: 'completed' | 'partial' | 'failed';
  improvementRate: number;
  weakAreas: string[];
  strongAreas: string[];
  
  // Session info
  sessionId: string;
  userId: string;
  timestamp: Date;
  duration: number;
  interviewerPersonality: string;
  question: string;
}

export class AnalyticsTracker {
  private metrics: Partial<InterviewMetrics> = {};
  private events: Array<{ name: string; timestamp: Date; data?: any }> = [];
  private startTime: Date;
  private codeHistory: Array<{ code: string; timestamp: Date }> = [];

  constructor(sessionId: string, userId: string) {
    this.startTime = new Date();
    this.metrics = {
      sessionId,
      userId,
      timestamp: this.startTime,
      compilationAttempts: 0,
      questionsAsked: 0,
      bugCount: 0,
    };
  }

  // Track when user starts typing code
  trackFirstCode() {
    if (!this.metrics.timeToFirstCode) {
      this.metrics.timeToFirstCode = Date.now() - this.startTime.getTime();
      this.track('first_code_written', { time: this.metrics.timeToFirstCode });
    }
  }

  // Track code changes
  trackCodeChange(code: string) {
    this.codeHistory.push({ code, timestamp: new Date() });
    this.metrics.linesOfCode = code.split('\n').length;
    
    // Calculate WPM based on typing
    if (this.codeHistory.length > 1) {
      const timeDiff = (Date.now() - this.codeHistory[this.codeHistory.length - 2].timestamp.getTime()) / 1000 / 60;
      const charDiff = code.length - this.codeHistory[this.codeHistory.length - 2].code.length;
      const wordsTyped = Math.abs(charDiff) / 5; // Average word length
      this.metrics.wordsPerMinute = Math.round(wordsTyped / timeDiff);
    }
  }

  // Track compilation/run attempts
  trackCompilation(success: boolean, errors?: string[]) {
    this.metrics.compilationAttempts = (this.metrics.compilationAttempts || 0) + 1;
    if (!success && errors) {
      this.metrics.bugCount = (this.metrics.bugCount || 0) + errors.length;
    }
    this.track('code_compilation', { success, errors });
  }

  // Track test results
  trackTestResults(passed: number, total: number) {
    this.metrics.testCasesPassed = passed;
    this.metrics.testCasesTotal = total;
    this.track('test_results', { passed, total, percentage: (passed / total) * 100 });
  }

  // Track user questions
  trackQuestion(question: string) {
    this.metrics.questionsAsked = (this.metrics.questionsAsked || 0) + 1;
    this.track('user_question', { question });
  }

  // Track hint usage
  trackHintUsed(hintLevel: number) {
    this.track('hint_used', { level: hintLevel });
  }

  // Calculate final metrics
  finalize(evaluation: { score: number; strengths: string[]; improvements: string[] }) {
    const endTime = new Date();
    this.metrics.duration = endTime.getTime() - this.startTime.getTime();
    this.metrics.totalSolvingTime = this.metrics.duration;
    this.metrics.codeQuality = evaluation.score;
    this.metrics.strongAreas = evaluation.strengths;
    this.metrics.weakAreas = evaluation.improvements;
    
    // Determine completion status
    if (this.metrics.testCasesPassed === this.metrics.testCasesTotal) {
      this.metrics.completionStatus = 'completed';
    } else if ((this.metrics.testCasesPassed || 0) > 0) {
      this.metrics.completionStatus = 'partial';
    } else {
      this.metrics.completionStatus = 'failed';
    }

    return this.metrics;
  }

  // Send event to Mixpanel
  private track(eventName: string, properties?: any) {
    this.events.push({ name: eventName, timestamp: new Date(), data: properties });
    
    if (typeof window !== 'undefined' && mixpanel) {
      mixpanel.track(eventName, {
        ...properties,
        sessionId: this.metrics.sessionId,
        userId: this.metrics.userId,
      });
    }
  }

  // Get code evolution for replay
  getCodeHistory() {
    return this.codeHistory;
  }

  // Get all events for session replay
  getEvents() {
    return this.events;
  }

  // Get current metrics
  getMetrics(): Partial<InterviewMetrics> {
    return this.metrics;
  }
}

// Helper functions for dashboard analytics
export const calculateAverageScore = (interviews: InterviewMetrics[]): number => {
  if (interviews.length === 0) return 0;
  const sum = interviews.reduce((acc, i) => acc + (i.codeQuality || 0), 0);
  return Math.round(sum / interviews.length);
};

export const calculateImprovementRate = (interviews: InterviewMetrics[]): number => {
  if (interviews.length < 2) return 0;
  const recent = interviews.slice(-5);
  const older = interviews.slice(-10, -5);
  const recentAvg = calculateAverageScore(recent);
  const olderAvg = calculateAverageScore(older);
  return Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
};

export const identifyWeakAreas = (interviews: InterviewMetrics[]): string[] => {
  const areaScores: Record<string, number[]> = {};
  
  interviews.forEach(interview => {
    interview.weakAreas?.forEach(area => {
      if (!areaScores[area]) areaScores[area] = [];
      areaScores[area].push(interview.codeQuality || 0);
    });
  });

  return Object.entries(areaScores)
    .map(([area, scores]) => ({
      area,
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    }))
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3)
    .map(item => item.area);
};

export const getSkillRadarData = (interviews: InterviewMetrics[]) => {
  const skills = {
    'Problem Solving': 0,
    'Code Quality': 0,
    'Communication': 0,
    'Speed': 0,
    'Testing': 0,
    'Optimization': 0,
  };

  interviews.forEach(interview => {
    skills['Code Quality'] += interview.codeQuality || 0;
    skills['Communication'] += interview.clarityScore || 0;
    skills['Speed'] += interview.wordsPerMinute ? Math.min(100, interview.wordsPerMinute / 40 * 100) : 0;
    skills['Testing'] += interview.testCasesPassed && interview.testCasesTotal
      ? (interview.testCasesPassed / interview.testCasesTotal) * 100
      : 0;
    skills['Optimization'] += interview.optimizationScore || 0;
    skills['Problem Solving'] += interview.completionStatus === 'completed' ? 100 : 50;
  });

  const count = interviews.length || 1;
  return Object.entries(skills).map(([skill, value]) => ({
    skill,
    value: Math.round(value / count),
  }));
};

export default AnalyticsTracker;
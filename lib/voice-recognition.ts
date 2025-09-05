// Natural Voice Recognition Service
// Provides continuous, hands-free voice interaction

export interface VoiceConfig {
  continuous: boolean;
  interimResults: boolean;
  silenceThreshold: number; // milliseconds
  noiseThreshold: number; // audio level 0-1
  language: string;
}

export interface VoiceCallbacks {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: any) => void;
  onNoiseDetected?: () => void;
}

export class NaturalVoiceRecognition {
  private recognition: any;
  private isListening: boolean = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private lastSpeechTime: number = Date.now();
  private config: VoiceConfig;
  private callbacks: VoiceCallbacks;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyser: AnalyserNode | null = null;
  private isSpeaking: boolean = false;
  private interimTranscript: string = '';
  private finalTranscript: string = '';
  private stopRequested: boolean = false;
  private restartAttempts: number = 0;
  
  constructor(config: Partial<VoiceConfig> = {}, callbacks: VoiceCallbacks = {}) {
    this.config = {
      continuous: true,
      interimResults: true,
      silenceThreshold: 1500, // 1.5 seconds default
      noiseThreshold: 0.01,
      language: 'en-US',
      ...config
    };
    
    this.callbacks = callbacks;
    this.initializeRecognition();
    this.initializeAudioAnalysis();
  }
  
  private initializeRecognition() {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }
    
    this.recognition = new (window as any).webkitSpeechRecognition();
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = this.config.interimResults;
    this.recognition.lang = this.config.language;
    
    // Handle recognition events
    this.recognition.onstart = () => {
      this.isListening = true;
      console.log('Voice recognition started');
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('Recognition ended, continuous mode:', this.config.continuous);
      // Auto-restart if it was supposed to be continuous
      if (this.config.continuous && !this.stopRequested) {
        console.log('Auto-restarting recognition...');
        setTimeout(() => this.start(), 500);
      }
    };
    
    this.recognition.onresult = (event: any) => {
      this.handleSpeechResult(event);
    };
    
    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error, event);
      
      // Handle different error types
      switch(event.error) {
        case 'no-speech':
          // This is normal - user just isn't speaking
          console.log('No speech detected, continuing to listen...');
          if (!this.stopRequested) {
            setTimeout(() => this.start(), 500);
          }
          break;
          
        case 'aborted':
          // Recognition was aborted, restart it
          console.log('Recognition aborted, restarting...');
          this.restartAttempts++;
          if (this.restartAttempts < 3 && !this.stopRequested) {
            setTimeout(() => this.start(), 1000);
          } else if (this.restartAttempts >= 3) {
            this.callbacks.onError?.('Voice recognition failed after 3 attempts. Please refresh or use text input.');
            this.restartAttempts = 0;
          }
          break;
          
        case 'audio-capture':
          console.log('Audio capture failed, retrying...');
          this.callbacks.onError?.('Microphone error. Please check your microphone.');
          setTimeout(() => this.start(), 2000);
          break;
          
        case 'not-allowed':
          this.callbacks.onError?.('Microphone access denied. Please allow microphone access and refresh.');
          break;
          
        default:
          this.callbacks.onError?.(event.error);
          // Try to restart for unknown errors
          if (!this.stopRequested) {
            setTimeout(() => this.start(), 2000);
          }
      }
    };
    
    this.recognition.onspeechstart = () => {
      this.onSpeechDetected();
    };
    
    this.recognition.onspeechend = () => {
      this.onSilenceDetected();
    };
  }
  
  private async initializeAudioAnalysis() {
    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      
      // Create audio analysis chain
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      // Start monitoring audio levels
      this.monitorAudioLevels();
    } catch (error) {
      console.error('Failed to initialize audio analysis:', error);
    }
  }
  
  private monitorAudioLevels() {
    if (!this.analyser) return;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const checkAudioLevel = () => {
      if (!this.isListening) {
        requestAnimationFrame(checkAudioLevel);
        return;
      }
      
      this.analyser!.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedVolume = average / 255;
      
      // Detect speech based on volume threshold
      if (normalizedVolume > this.config.noiseThreshold) {
        if (!this.isSpeaking) {
          this.onSpeechDetected();
        }
        this.lastSpeechTime = Date.now();
      } else {
        // Check for silence
        const silenceDuration = Date.now() - this.lastSpeechTime;
        if (this.isSpeaking && silenceDuration > this.config.silenceThreshold) {
          this.onSilenceDetected();
        }
      }
      
      requestAnimationFrame(checkAudioLevel);
    };
    
    checkAudioLevel();
  }
  
  private handleSpeechResult(event: any) {
    const last = event.results.length - 1;
    const result = event.results[last];
    
    this.interimTranscript = '';
    this.finalTranscript = '';
    
    // Process all results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        this.finalTranscript += transcript + ' ';
      } else {
        this.interimTranscript = transcript;
      }
    }
    
    // Send the transcript to callback
    if (result.isFinal) {
      this.callbacks.onResult?.(this.finalTranscript.trim(), true);
      this.resetSilenceTimer();
    } else {
      this.callbacks.onResult?.(this.interimTranscript, false);
    }
  }
  
  private onSpeechDetected() {
    if (!this.isSpeaking) {
      this.isSpeaking = true;
      this.callbacks.onSpeechStart?.();
      this.clearSilenceTimer();
    }
  }
  
  private onSilenceDetected() {
    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.callbacks.onSpeechEnd?.();
      
      // Start silence timer
      this.resetSilenceTimer();
    }
  }
  
  private resetSilenceTimer() {
    this.clearSilenceTimer();
    
    // Set timer for end of turn detection
    this.silenceTimer = setTimeout(() => {
      // User has stopped talking for threshold duration
      // This is where we'd trigger AI response
      if (this.finalTranscript.trim()) {
        // Final transcript is ready
        this.finalTranscript = '';
        this.interimTranscript = '';
      }
    }, this.config.silenceThreshold);
  }
  
  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
  
  // Public methods
  
  start() {
    this.stopRequested = false;
    this.restartAttempts = 0;
    
    if (!this.recognition) {
      console.error('Recognition not initialized');
      return;
    }
    
    if (this.isListening) {
      console.log('Already listening, skipping start');
      return;
    }
    
    try {
      this.recognition.start();
      console.log('Voice recognition start() called');
    } catch (error: any) {
      console.error('Failed to start recognition:', error);
      
      if (error.message?.includes('already started')) {
        console.log('Recognition already started, stopping and restarting...');
        try {
          this.recognition.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
        setTimeout(() => {
          try {
            this.recognition.start();
            console.log('Restarted recognition after conflict');
          } catch (e) {
            console.error('Failed to restart:', e);
          }
        }, 500);
      }
    }
  }
  
  stop() {
    this.stopRequested = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
        console.log('Voice recognition stopped');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
      this.clearSilenceTimer();
    }
  }
  
  pause() {
    this.isListening = false;
  }
  
  resume() {
    this.isListening = true;
  }
  
  setSilenceThreshold(ms: number) {
    this.config.silenceThreshold = ms;
  }
  
  destroy() {
    this.stop();
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
  
  // Get current audio level (for visualization)
  getAudioLevel(): number {
    if (!this.analyser) return 0;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    return average / 255; // Normalized 0-1
  }
}

// Dynamic stage-specific silence thresholds with variation
export const getStageThreshold = (stage: string): number => {
  const baseThresholds: Record<string, { min: number; max: number }> = {
    greeting: { min: 1200, max: 1800 },
    clarification: { min: 1300, max: 2000 },
    discussion: { min: 1800, max: 2500 },
    coding: { min: 4000, max: 6000 },
    testing: { min: 1800, max: 2500 },
    optimization: { min: 2500, max: 3500 },
  };
  
  const threshold = baseThresholds[stage] || { min: 1500, max: 2500 };
  return Math.floor(Math.random() * (threshold.max - threshold.min + 1)) + threshold.min;
};

// Legacy export for backward compatibility
export const STAGE_SILENCE_THRESHOLDS = {
  greeting: 1500,
  clarification: 1500,
  discussion: 2000,
  coding: 5000,
  testing: 2000,
  optimization: 3000,
};

// Helper to detect if user is actively typing
export function isUserTyping(lastKeyPressTime: number, threshold: number = 1000): boolean {
  return Date.now() - lastKeyPressTime < threshold;
}
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build & Production
npm run build        # Build for production
npm run start        # Run production build

# Installation
npm install          # Install dependencies
```

## Required Environment Variables

The following environment variables must be set in `.env.local`:
- `OPENAI_API_KEY` - OpenAI API key for AI interviewer and TTS
- `OPENAI_MODEL` - Model to use (default: gpt-4o-mini)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk authentication
- `CLERK_SECRET_KEY` - Clerk backend authentication
- Firebase admin credentials for Firestore database

## Architecture Overview

CoderVue is a voice-driven AI coding interview platform using Next.js App Router with serverless architecture.

### Core Interview System

The interview system operates through a multi-agent architecture where different AI agents handle specific interview stages:

1. **Voice-First Interface** (`app/dashboard/coding-room/[sessionId]/page.tsx`)
   - Uses WebKit Speech Recognition API for voice input
   - OpenAI TTS for AI voice responses
   - Speech accumulation with 1.5s silence detection for complete sentences
   - Automatic voice restart after AI speaks

2. **Multi-Agent System** (`app/api/interview-agent/route.ts`)
   - `greeting` - Initial welcome
   - `greeting_response` - Handles greeting interactions, transitions to problem
   - `problem_thoughts` - Asks for initial thoughts when problem shown
   - `problem_ready` - Handles responses after viewing problem
   - `clarification` - Manages approach discussion
   - `coding_start` - Transitions to coding phase
   - `coding_help` - Provides hints during coding

3. **Stage Management**
   - Uses both React state and refs to handle async updates
   - `stageRef.current` for immediate access in callbacks
   - Automatic stage transitions based on keywords
   - Stage persistence to prevent regression

## Interview Flow & Stage Transitions

```
greeting → problem_introduction → clarification → coding → testing
```

### Stage Transition Triggers

- **To Problem**: User says "let's code", "start", "begin", "ready"
- **To Clarification**: Automatic after problem thoughts
- **To Coding**: "ready to code", "let's code", "start coding", "move to coding"

### State Synchronization

The system maintains state consistency through:
- `conversationHistoryRef` - Avoids stale closures in setTimeout callbacks
- `stageRef` - Immediate stage updates for speech processing
- `hasAskedForThoughtsRef` - Prevents duplicate API calls
- `hasGreetedRef` - Prevents duplicate greetings in React StrictMode

## Key API Routes

- `/api/interview-agent` - Main agent orchestration endpoint
- `/api/getQuestion` - Generates unique coding problems via OpenAI
- `/api/text-to-speech` - OpenAI TTS conversion
- `/api/conversationalInterface` - Legacy conversation handling
- `/api/analyze-code` - Real-time code analysis (currently unused)

## Voice Recognition System

### Speech Processing Pipeline

1. **Accumulation**: Collects speech segments until 1.5s silence
2. **Processing**: Routes to appropriate agent based on current stage
3. **Response**: AI speaks via OpenAI TTS
4. **Auto-restart**: Voice recognition resumes after AI finishes

### Known Voice Issues & Solutions

- **Double speaking**: Prevented via `lastSpokenTextRef` and request IDs
- **Speech truncation**: Fixed with accumulation buffer
- **Recognition errors**: Auto-restart on 'no-speech' or 'aborted'

## Component Structure

### Interview Room Components
- **Greeting Screen**: Initial welcome with voice indicator
- **Problem Screen**: Displays problem with AI assistant
- **Coding Screen**: Split view with collapsible problem, editor, and AI panel

### Screen State Mapping
```javascript
greeting stage → greeting screen
problem_introduction/clarification → problem screen  
coding/testing → coding screen
```

## Common Development Tasks

### Adding New Interview Personalities

Edit `lib/openai.ts` INTERVIEWER_PERSONALITIES object to add new interviewer styles.

### Modifying Stage Transitions

1. Update keyword detection in `processUserSpeech()` 
2. Add transition logic in agent route handlers
3. Update screen mapping in stage change useEffect

### Debugging Voice Issues

Check console for:
- "=== PROCESSING USER SPEECH ===" logs
- "Stage transition:" logs
- "Agent response:" logs
- History tracking logs

### Fixing Duplicate API Calls

Use refs instead of state for flags:
- `initializingRef.current`
- `hasGreetedRef.current`
- `hasAskedForThoughtsRef.current`

## Authentication & Middleware

Clerk authentication protects all routes except:
- `/` (landing page)
- `/sign-in/*`
- `/sign-up/*`

Protected routes automatically redirect to sign-in.

## Database Structure

Firebase Firestore stores:
- Interview sessions
- User progress
- Question history
- Performance metrics

## Testing Interview Flow

1. Start dev server
2. Navigate to dashboard
3. Select difficulty and interviewer personality
4. Click "Start Practice Session"
5. Use voice or type responses
6. Say "ready to code" to transition stages

## Recent Architectural Decisions

- Moved from message-based to voice-first UI
- Replaced browser TTS with OpenAI TTS for consistency
- Implemented stage-based agent system replacing hardcoded responses
- Added conversation history tracking for context maintenance
- Used refs to solve React StrictMode and async state issues
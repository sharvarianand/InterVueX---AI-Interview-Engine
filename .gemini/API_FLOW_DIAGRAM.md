# InterVueX API Flow Diagram

## 🎯 Complete Interview Flow with API Calls

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER JOURNEY                                   │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   LANDING    │  User visits homepage
│     PAGE     │  
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   SIGN IN    │  Clerk Authentication
│  (Clerk UI)  │  
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        STUDENT DASHBOARD                                 │
│  - Recent reports (GET /report/user/{user_id})                          │
│  - Quick start interview button                                         │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ Click "Start Interview"
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      INTERVIEW SETUP PAGE                                │
│                                                                          │
│  1. Select Mode: [Interview | Viva | Hackathon]                        │
│  2. Select Persona: [Startup CTO | Professor | Judge | HR]             │
│  3. [Optional] Upload CV                                                │
│     ├─ User selects file                                                │
│     ├─ POST /interview/upload-cv                                        │
│     │  └─ FormData with file                                            │
│     └─ Response: { cv_id, parsed_data }                                 │
│                                                                          │
│  4. Click "Start Interview"                                             │
│     └─ POST /interview/start                                            │
│        ├─ Body: { user_id, mode, persona, cv_id }                       │
│        └─ Response: { session_id, first_question }                      │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      INTERVIEW ROOM                                      │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  CAMERA FEED (Proctoring)                                          │ │
│  │  - Recording indicator                                             │ │
│  │  - Background: POST /interview/{id}/video-signals (every 5s)       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  QUESTION PANEL                                                    │ │
│  │                                                                    │ │
│  │  Question 1/5 • Architecture • Medium                             │ │
│  │  🔊 AI is reading question... (TTS speaking)                       │ │
│  │  ⏱️ 2:30 (Timer starts after TTS finishes)                        │ │
│  │                                                                    │ │
│  │  "Tell me about your technical background. What technologies      │ │
│  │   have you worked with recently?"                                 │ │
│  │                                                                    │ │
│  │  [Voice 🎤] [Text ⌨️] ← Input mode toggle                         │ │
│  │                                                                    │ │
│  │  ┌──────────────────────────────────────────────────────────────┐ │ │
│  │  │ 🎤 Listening... Speak now                                     │ │ │
│  │  │ [Mic Button - Active/Pulsing]                                 │ │ │
│  │  │                                                               │ │ │
│  │  │ Your answer: "I have 5 years of experience with Python..."   │ │ │
│  │  └──────────────────────────────────────────────────────────────┘ │ │
│  │                                                                    │ │
│  │  [Submit Answer] [End Interview]                                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  SIDEBAR:                                                                │
│  ├─ Timer: 03:45 (total elapsed)                                        │
│  ├─ Progress: 1/5 questions                                             │
│  ├─ Proctoring: ✓ Camera Active, ✓ No Issues, ⏱️ Answer Time: 2:15    │
│  └─ Tips: Look at camera, Be specific, etc.                             │
│                                                                          │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ User clicks "Submit Answer"
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    ANSWER SUBMISSION FLOW                                │
│                                                                          │
│  Frontend:                                                               │
│  ├─ Collect answer (voice transcript or text input)                     │
│  ├─ Stop listening if voice mode                                        │
│  ├─ Stop TTS if speaking                                                │
│  └─ POST /interview/{session_id}/answer                                 │
│     └─ Body: { answer: "I have 5 years..." }                            │
│                                                                          │
│  Backend:                                                                │
│  ├─ Retrieve orchestrator from memory                                   │
│  ├─ Record answer in memory engine                                      │
│  ├─ Evaluate answer using interview agent                               │
│  │  ├─ Score: 0-10                                                      │
│  │  └─ Feedback: "Strong understanding..."                              │
│  ├─ Update Supabase conversations table                                 │
│  │  └─ Add answer_text, evaluation_score, evaluation_feedback           │
│  ├─ Adjust pressure level based on score                                │
│  ├─ Generate next adaptive question                                     │
│  │  ├─ Consider: previous answers, CV, project, pressure                │
│  │  └─ Use specialized agent (Technical/Behavioral/ProjectViva)         │
│  ├─ Record new question in Supabase                                     │
│  └─ Return: { question, focus, difficulty, follow_up, intent }          │
│                                                                          │
│  Frontend receives response:                                            │
│  ├─ Update currentQuestion state                                        │
│  ├─ Clear answer input                                                  │
│  ├─ Reset transcript                                                    │
│  ├─ Increment question number                                           │
│  ├─ Reset answer timer to 2:30                                          │
│  ├─ Mark question as not spoken                                         │
│  └─ TTS will speak new question                                         │
│                                                                          │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       │ Repeat 5 times OR user clicks "End Interview"
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    END INTERVIEW FLOW                                    │
│                                                                          │
│  Frontend:                                                               │
│  ├─ Stop camera                                                          │
│  ├─ Stop listening                                                       │
│  └─ POST /interview/{session_id}/end                                    │
│                                                                          │
│  Backend:                                                                │
│  ├─ Generate comprehensive report                                       │
│  │  ├─ Overall score (0-100)                                            │
│  │  ├─ Verdict: Ready/Borderline/Needs Improvement                      │
│  │  ├─ Skill scores: [{ skill, score, feedback }]                       │
│  │  ├─ Project understanding score                                      │
│  │  ├─ Reasoning depth index                                            │
│  │  ├─ Confidence index                                                 │
│  │  ├─ Behavioral consistency                                           │
│  │  ├─ Improvement roadmap: ["Focus on...", "Practice..."]              │
│  │  ├─ Strengths: ["Clear communication", ...]                          │
│  │  └─ Weaknesses: ["Needs more practice in..."]                        │
│  ├─ Store report in Supabase reports table                              │
│  ├─ Update session status to "completed"                                │
│  ├─ Delete orchestrator from memory                                     │
│  └─ Return: { session_id, report_id, message }                          │
│                                                                          │
│  Frontend:                                                               │
│  └─ Navigate to /report/{report_id}                                     │
│                                                                          │
└──────┬───────────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      REPORT PAGE                                         │
│                                                                          │
│  On mount:                                                               │
│  └─ GET /report/{report_id}                                             │
│     └─ Fetch complete report from Supabase                              │
│                                                                          │
│  Display:                                                                │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  📊 Interview Report                                               │ │
│  │                                                                    │ │
│  │  Overall Score: 75.5/100                                           │ │
│  │  Verdict: ✅ Ready                                                 │ │
│  │                                                                    │ │
│  │  Skill Breakdown:                                                  │ │
│  │  ├─ Python: 8.5/10 - "Strong understanding..."                    │ │
│  │  ├─ System Design: 7.0/10 - "Good grasp of..."                    │ │
│  │  └─ Communication: 8.0/10 - "Clear and concise"                   │ │
│  │                                                                    │ │
│  │  Metrics:                                                          │ │
│  │  ├─ Project Understanding: 7.5/10                                 │ │
│  │  ├─ Reasoning Depth: 8.0/10                                       │ │
│  │  ├─ Confidence: 7.5/10                                            │ │
│  │  └─ Behavioral Consistency: 8.5/10                                │ │
│  │                                                                    │ │
│  │  💪 Strengths:                                                     │ │
│  │  • Clear communication                                            │ │
│  │  • Deep technical knowledge                                       │ │
│  │                                                                    │ │
│  │  ⚠️ Areas for Improvement:                                        │ │
│  │  • Practice system design patterns                                │ │
│  │  • Work on scalability concepts                                   │ │
│  │                                                                    │ │
│  │  🎯 Improvement Roadmap:                                          │ │
│  │  1. Focus on distributed systems                                  │ │
│  │  2. Practice more behavioral questions                            │ │
│  │  3. Review database optimization                                  │ │
│  │                                                                    │ │
│  │  [Download PDF] [Share] [Back to Dashboard]                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Background Processes

### Video Signal Transmission (Every 5 seconds during interview)

```
┌─────────────────────────────────────────────────────────────┐
│  BACKGROUND LOOP (useEffect with 5s interval)               │
│                                                             │
│  Frontend:                                                  │
│  ├─ Collect current state:                                 │
│  │  ├─ eye_gaze_stability: 0.9 (constant, no tracking)    │
│  │  ├─ facial_confidence: 1.0                              │
│  │  ├─ attention_score: 0.95 (0.6 if recent suspicious)   │
│  │  └─ timestamp: current time                             │
│  │                                                         │
│  └─ POST /interview/{session_id}/video-signals             │
│     └─ Body: { signals: [{ ... }] }                        │
│                                                             │
│  Backend:                                                   │
│  ├─ Store signals in orchestrator.video_signals            │
│  ├─ Check for suspicious patterns:                         │
│  │  ├─ Prolonged low attention (>50% of last 20 signals)  │
│  │  └─ Sudden attention drops                              │
│  ├─ If suspicious: trigger pressure increase               │
│  └─ Return: { status, suspicious_detected, attention }     │
│                                                             │
│  Note: Eye tracking removed - signals are constant values  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Operations

### Tables and Their Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  PROFILES (User Accounts)                                   │
│  ├─ Created: During Clerk signup                            │
│  ├─ Synced: AuthContext on login                            │
│  └─ Used: All authenticated operations                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CVS (Parsed Resumes)                                       │
│  ├─ Created: POST /interview/upload-cv                      │
│  ├─ Read: POST /interview/start (if cv_id provided)         │
│  └─ Contains: skills, experience, summary, AI analysis      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  INTERVIEW_SESSIONS (Session Metadata)                      │
│  ├─ Created: POST /interview/start                          │
│  │  └─ Fields: user_id, mode, persona, github_url, etc.    │
│  ├─ Updated: POST /interview/{id}/end                       │
│  │  └─ Status: active → completed                           │
│  └─ Linked to: conversations, reports (foreign keys)        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CONVERSATIONS (Q&A Pairs)                                  │
│  ├─ Created: POST /interview/start (first question)         │
│  │  └─ Fields: session_id, sequence_number, question_text  │
│  ├─ Updated: POST /interview/{id}/answer                    │
│  │  └─ Add: answer_text, evaluation_score, feedback        │
│  ├─ Created: POST /interview/{id}/answer (next question)    │
│  └─ Sequence: 1, 2, 3, 4, 5 (typically)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  REPORTS (Final Evaluations)                                │
│  ├─ Created: POST /interview/{id}/end                       │
│  │  └─ Contains: All scores, feedback, roadmap             │
│  ├─ Read: GET /report/{id} (single report)                 │
│  ├─ Read: GET /report/user/{id} (all user reports)         │
│  └─ Linked to: interview_sessions (session_id FK, UNIQUE)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key State Management

### Frontend State (StudentInterview.jsx)

```javascript
// Session State
const [sessionId, setSessionId] = useState(null);
const [step, setStep] = useState('setup'); // 'setup' | 'interview'

// Question State
const [currentQuestion, setCurrentQuestion] = useState(null);
const [questionNumber, setQuestionNumber] = useState(1);
const [questionSpoken, setQuestionSpoken] = useState(false);

// Answer State
const [answer, setAnswer] = useState('');
const [inputMode, setInputMode] = useState('voice'); // 'voice' | 'text'
const [transcript, setTranscript] = useState('');

// Timer State
const [timer, setTimer] = useState(0); // Total elapsed
const [answerTimer, setAnswerTimer] = useState(150); // 2.5 min countdown
const [isAnswerPhase, setIsAnswerPhase] = useState(false);

// Camera/Proctoring State
const [cameraReady, setCameraReady] = useState(false);
const [suspiciousEvents, setSuspiciousEvents] = useState([]);
```

### Backend State (Orchestrator)

```python
class InterviewOrchestrator:
    # Session Info
    session_id: str
    user_id: str
    mode: InterviewMode
    persona: PersonaType
    
    # AI Components
    interview_agent: BaseInterviewAgent
    cv_data: dict
    project_context: dict
    
    # Current State
    current_question: QuestionResponse
    sequence_number: int
    
    # Memory & Tracking
    memory: dict  # qa_history, weak_areas, strong_areas
    video_signals: List[VideoSignal]
    suspicious_events: List[dict]
    
    # AI Engines
    persona_engine: PersonaEngine
    question_generator: QuestionGenerator
    memory_engine: MemoryEngine
    evaluation_engine: EvaluationEngine
    pressure_engine: PressureEngine
```

---

## 🔐 Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│  AUTHENTICATION (Clerk)                                     │
│  ├─ User signs in via Clerk UI                              │
│  ├─ Clerk provides user object                              │
│  ├─ AuthContext syncs with Supabase profiles table          │
│  └─ user.id used in all API calls                           │
│                                                             │
│  ⚠️ Current: No backend auth validation                    │
│  ✅ Production: Add JWT middleware                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ROW LEVEL SECURITY (Supabase RLS)                          │
│  ├─ Profiles: Users can view/update own profile             │
│  ├─ CVs: Users can view/insert own CVs                      │
│  ├─ Sessions: Users can view/create own sessions            │
│  ├─ Reports: Users can view own reports                     │
│  └─ Conversations: Users can view via session ownership     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Performance Optimization Points

```
┌─────────────────────────────────────────────────────────────┐
│  SLOW OPERATIONS (AI-based)                                 │
│  ├─ CV Parsing: 2-5s (Gemini API call)                     │
│  ├─ Question Generation: 2-4s (Gemini API call)            │
│  ├─ Answer Evaluation: 1-3s (Gemini API call)              │
│  └─ Report Generation: 5-10s (Multiple Gemini calls)       │
│                                                             │
│  OPTIMIZATION IDEAS:                                        │
│  ├─ Cache CV parsing results                                │
│  ├─ Pre-generate question pools                             │
│  ├─ Async report generation (background job)                │
│  └─ Use streaming responses for real-time feedback          │
└─────────────────────────────────────────────────────────────┘
```

---

**This diagram shows the complete flow from user landing to report viewing!**

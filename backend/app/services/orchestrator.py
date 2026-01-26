"""
InterVueX Orchestrator - The Heart of the Backend

This is the decision engine that:
- Creates interview sessions
- Loads evaluator persona
- Maintains shared context
- Executes AI blocks in sequence
- Handles adaptive branching
- Ends session & triggers report
"""

import uuid
from typing import Optional, List
from app.models.schemas import (
    InterviewMode,
    PersonaType,
    InterviewStartResponse,
    QuestionResponse,
    InterviewEndResponse,
    VideoSignal,
    ReportResponse,
    SkillScore,
)
from app.services.project_analyzer import ProjectAnalyzer
from app.services.persona_engine import PersonaEngine
from app.services.question_generator import QuestionGenerator
from app.services.memory_engine import MemoryEngine
from app.services.evaluation_engine import EvaluationEngine
from app.services.pressure_engine import PressureEngine
from app.services.supabase_service import SupabaseService


class InterviewOrchestrator:
    """
    The central orchestrator that composes all AI blocks together.
    Each interview session creates one orchestrator instance.
    """

    def __init__(self):
        self.session_id: Optional[str] = None
        self.mode: Optional[InterviewMode] = None
        self.persona: Optional[PersonaType] = None
        self.project_context: Optional[dict] = None
        self.current_question: Optional[QuestionResponse] = None
        self.video_signals: List[VideoSignal] = []
        self.user_id: Optional[str] = None
        self.sequence_number: int = 0
        
        # New: Interview agent and CV data
        self.interview_agent = None  # Will be set by API
        self.cv_data: Optional[dict] = None  # Parsed CV data
        self.start_time: Optional[float] = None  # Session start time
        self.memory: dict = {"qa_history": [], "weak_areas": [], "strong_areas": []}
        self.suspicious_events: List[dict] = []
        
        # Composable AI Blocks
        self.project_analyzer = ProjectAnalyzer()
        self.persona_engine = PersonaEngine()
        self.question_generator = QuestionGenerator()
        self.memory_engine = MemoryEngine()
        self.evaluation_engine = EvaluationEngine()
        self.pressure_engine = PressureEngine()

    async def start_session(
        self,
        mode: InterviewMode,
        persona: PersonaType,
        user_id: str,
        github_url: Optional[str] = None,
        deployment_url: Optional[str] = None,
    ) -> InterviewStartResponse:
        """Initialize a new interview session."""
        import time
        self.mode = mode
        self.persona = persona
        self.user_id = user_id
        self.start_time = time.time()

        # Initialize persona behavior
        self.persona_engine.load_persona(persona)

        # Build context for the agent
        context = {
            "mode": mode,
            "persona": self.persona_engine.get_behavior(),
            "cv": self.cv_data,
            "skills": self.cv_data.get("skills", {}) if self.cv_data else {},
            "resume_text": self.cv_data.get("raw_text", "") if self.cv_data else ""
        }

        # Project Mode: Analyze GitHub + Deployment (Legacy/Secondary)
        project_summary = None
        if github_url or deployment_url:
            self.project_context = await self.project_analyzer.analyze(
                github_url=github_url,
                deployment_url=deployment_url,
            )
            project_summary = self.project_context.get("summary", "")
            context["project"] = self.project_context

        # Generate first question
        if self.interview_agent:
            # Use specialized agent
            question_data = await self.interview_agent.generate_question(
                context=context,
                previous_qa=[],
                pressure_level=self.pressure_engine.get_level()
            )
            first_question = QuestionResponse(
                question=question_data["question"],
                focus=question_data.get("focus_area", "overview"),
                difficulty=question_data.get("difficulty", "medium"),
                follow_up=question_data.get("follow_up_ready", False),
                intent=question_data.get("verification_intent")
            )
        else:
            # Fallback to general question generator
            first_question = await self.question_generator.generate(
                mode=mode,
                persona=self.persona_engine.get_behavior(),
                project_context=self.project_context,
                memory=self.memory_engine.get_state(),
                pressure_level=self.pressure_engine.get_level(),
            )

        # Create session in Supabase
        supabase_session = await SupabaseService.create_session(
            user_id=self.user_id,
            mode=mode.value,
            persona=persona.value,
            github_url=github_url,
            deployment_url=deployment_url,
            project_summary=project_summary or (self.cv_data.get("summary") if self.cv_data else None),
            cv_metadata=self.cv_data
        )

        # Establish session ID (Fallback to UUID if Supabase fails)
        self.session_id = supabase_session.get("id") or str(uuid.uuid4())

        self.current_question = first_question
        self.memory_engine.record_question(first_question)
        self.sequence_number += 1
        
        # Record first question in Supabase
        await SupabaseService.record_conversation(
            session_id=self.session_id,
            sequence_number=self.sequence_number,
            question_text=first_question.question,
            question_intent=first_question.intent or first_question.focus
        )
        
        return InterviewStartResponse(
            session_id=self.session_id,
            mode=self.mode,
            persona=self.persona,
            project_summary=project_summary or (self.cv_data.get("summary") if self.cv_data else None),
            first_question=first_question.question
        )

    async def process_answer(self, answer: str) -> QuestionResponse:
        """Process candidate answer and generate next adaptive question."""
        # Record the answer
        self.memory_engine.record_answer(answer)

        # Evaluate the answer
        if self.interview_agent:
            # Use specialized agent for evaluation
            context = {
                "cv": self.cv_data,
                "project": self.project_context,
                "skills": self.cv_data.get("skills", {}) if self.cv_data else {}
            }
            evaluation_data = await self.interview_agent.evaluate_answer(
                question=self.current_question.question,
                answer=answer,
                context=context
            )
            # Map agent evaluation to unified format
            evaluation = type('obj', (object,), {
                'score': evaluation_data.get("score", 0.5),
                'feedback': evaluation_data.get("feedback", ""),
                'focus': self.current_question.focus,
                'confidence': evaluation_data.get("self_awareness", evaluation_data.get("communication", 0.5))
            })
        else:
            # Fallback to general evaluation engine
            evaluation = await self.evaluation_engine.evaluate_answer(
                question=self.current_question,
                answer=answer,
                project_context=self.project_context,
            )
            
        self.memory_engine.record_evaluation({
            "score": evaluation.score,
            "feedback": evaluation.feedback,
            "focus": evaluation.focus,
            "confidence": getattr(evaluation, 'confidence', 0.5)
        })

        # Update Supabase with answer and evaluation
        await SupabaseService.update_last_conversation_answer(
            session_id=self.session_id,
            answer_text=answer,
            evaluation_score=evaluation.score,
            evaluation_feedback=evaluation.feedback
        )

        # Adjust pressure based on performance
        self.pressure_engine.adjust(evaluation)

        # Build context for next question
        context = {
            "mode": self.mode,
            "persona": self.persona_engine.get_behavior(),
            "cv": self.cv_data,
            "skills": self.cv_data.get("skills", {}) if self.cv_data else {},
            "resume_text": self.cv_data.get("raw_text", "") if self.cv_data else "",
            "project": self.project_context
        }

        # Generate next question (adaptive)
        if self.interview_agent:
            # Use specialized agent
            qa_history = self.memory_engine.get_full_transcript()
            # Map transcript to agent format
            formatted_history = []
            for item in qa_history:
                formatted_history.append({
                    "question": item["question"]["question"],
                    "answer": item.get("answer", ""),
                    "score": item.get("evaluation", {}).get("score", 0.5)
                })
                
            question_data = await self.interview_agent.generate_question(
                context=context,
                previous_qa=formatted_history,
                pressure_level=self.pressure_engine.get_level()
            )
            next_question = QuestionResponse(
                question=question_data["question"],
                focus=question_data.get("focus_area", question_data.get("aspect", question_data.get("competency", "general"))),
                difficulty=question_data.get("difficulty", "medium"),
                follow_up=question_data.get("follow_up_ready", False),
                intent=question_data.get("verification_intent")
            )
        else:
            # Fallback
            next_question = await self.question_generator.generate(
                mode=self.mode,
                persona=self.persona_engine.get_behavior(),
                project_context=self.project_context,
                memory=self.memory_engine.get_state(),
                pressure_level=self.pressure_engine.get_level(),
                video_signals=self.video_signals[-10:] if self.video_signals else None,
            )
            
        self.current_question = next_question
        self.memory_engine.record_question(next_question)
        self.sequence_number += 1

        # Record next question in Supabase
        await SupabaseService.record_conversation(
            session_id=self.session_id,
            sequence_number=self.sequence_number,
            question_text=next_question.question,
            question_intent=next_question.intent or next_question.focus
        )

        return next_question


    async def update_video_signals(self, signals: List[VideoSignal]):
        """Receive and store video behavior signals."""
        self.video_signals.extend(signals)

    def get_current_question(self) -> QuestionResponse:
        """Get the current question."""
        return self.current_question

    async def end_session(self) -> InterviewEndResponse:
        """End the session and generate final report."""
        report = await self.evaluation_engine.generate_report(
            session_id=self.session_id,
            memory=self.memory_engine.get_state(),
            project_context=self.project_context,
            video_signals=self.video_signals,
        )
        
        # Store the report in Supabase
        await SupabaseService.store_report(self.session_id, self.user_id, report)
        
        # Update session status
        await SupabaseService.update_session_status(self.session_id, "completed")

        return InterviewEndResponse(
            session_id=self.session_id,
            report_id=self.session_id,
            message="Interview completed. Report generated and saved.",
        )

    def check_suspicious_behavior(self) -> bool:
        """Check for suspicious patterns in video signals."""
        if not self.video_signals:
            return False
        
        recent_signals = self.video_signals[-20:]  # Last 20 signals
        
        # Check for prolonged looking away
        away_count = sum(1 for s in recent_signals if s.attention_score < 0.3)
        if away_count > 10:  # More than 50% looking away
            self.suspicious_events.append({
                "type": "prolonged_distraction",
                "timestamp": str(self.sequence_number),
                "severity": "high"
            })
            self.pressure_engine.trigger_suspicion(severity="high")
            return True
        
        # Check for sudden attention drops
        if len(recent_signals) >= 5:
            recent_avg = sum(s.attention_score for s in recent_signals[-5:]) / 5
            if recent_avg < 0.4:
                self.suspicious_events.append({
                    "type": "attention_drop",
                    "timestamp": str(self.sequence_number),
                    "severity": "medium"
                })
                self.pressure_engine.trigger_suspicion(severity="medium")
                return True

        
        return False
    
    def get_attention_level(self) -> float:
        """Get current attention level from video signals."""
        if not self.video_signals:
            return 1.0
        
        recent = self.video_signals[-10:]
        return sum(s.attention_score for s in recent) / len(recent)
    
    def get_elapsed_time(self) -> int:
        """Get elapsed time in seconds since session start."""
        import time
        if self.start_time:
            return int(time.time() - self.start_time)
        return 0

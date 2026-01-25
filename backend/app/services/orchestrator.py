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
        self.mode = mode
        self.persona = persona
        self.user_id = user_id

        # Initialize persona behavior
        self.persona_engine.load_persona(persona)

        # Project Mode: Analyze GitHub + Deployment
        project_summary = None
        if github_url or deployment_url:
            self.project_context = await self.project_analyzer.analyze(
                github_url=github_url,
                deployment_url=deployment_url,
            )
            project_summary = self.project_context.get("summary", "")

        # Generate first question
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
            project_summary=project_summary
        )
        self.session_id = supabase_session.get("id")

        self.current_question = first_question
        self.memory_engine.record_question(first_question)
        self.sequence_number += 1
        
        # Record first question in Supabase
        await SupabaseService.record_conversation(
            session_id=self.session_id,
            sequence_number=self.sequence_number,
            question_text=first_question.question,
            question_intent=first_question.intent
        )

    async def process_answer(self, answer: str) -> QuestionResponse:
        """Process candidate answer and generate next adaptive question."""
        # Record the answer
        self.memory_engine.record_answer(answer)

        evaluation = await self.evaluation_engine.evaluate_answer(
            question=self.current_question,
            answer=answer,
            project_context=self.project_context,
        )
        self.memory_engine.record_evaluation(evaluation)

        # Update Supabase with answer and evaluation
        await SupabaseService.update_last_conversation_answer(
            session_id=self.session_id,
            answer_text=answer,
            evaluation_score=evaluation.score,
            evaluation_feedback=evaluation.feedback
        )

        # Adjust pressure based on performance
        self.pressure_engine.adjust(evaluation)

        # Generate next question (adaptive)
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
            question_intent=next_question.intent
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

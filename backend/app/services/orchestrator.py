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
from app.api.endpoints.report import store_report


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
        github_url: Optional[str] = None,
        deployment_url: Optional[str] = None,
    ) -> InterviewStartResponse:
        """Initialize a new interview session."""
        self.session_id = str(uuid.uuid4())
        self.mode = mode
        self.persona = persona

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
        self.current_question = first_question
        self.memory_engine.record_question(first_question)

        return InterviewStartResponse(
            session_id=self.session_id,
            mode=mode,
            persona=persona,
            project_summary=project_summary,
            first_question=first_question.question,
        )

    async def process_answer(self, answer: str) -> QuestionResponse:
        """Process candidate answer and generate next adaptive question."""
        # Record the answer
        self.memory_engine.record_answer(answer)

        # Evaluate the answer
        evaluation = await self.evaluation_engine.evaluate_answer(
            question=self.current_question,
            answer=answer,
            project_context=self.project_context,
        )
        self.memory_engine.record_evaluation(evaluation)

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
        
        # Store the report
        store_report(self.session_id, report)

        return InterviewEndResponse(
            session_id=self.session_id,
            report_id=self.session_id,
            message="Interview completed. Report generated.",
        )

"""
Persona Engine - Defines Interviewer Behavior

Each persona affects:
- Question style
- Follow-up aggressiveness
- Scoring strictness
- Feedback tone
"""

from app.models.schemas import PersonaType


class PersonaBehavior:
    """Represents the behavior traits of an evaluator persona."""

    def __init__(
        self,
        name: str,
        question_style: str,
        follow_up_intensity: float,  # 0.0 - 1.0
        scoring_strictness: float,  # 0.0 - 1.0
        feedback_tone: str,
        pressure_multiplier: float,
    ):
        self.name = name
        self.question_style = question_style
        self.follow_up_intensity = follow_up_intensity
        self.scoring_strictness = scoring_strictness
        self.feedback_tone = feedback_tone
        self.pressure_multiplier = pressure_multiplier


PERSONA_CONFIGS = {
    PersonaType.STRICT_PROFESSOR: PersonaBehavior(
        name="Strict Professor",
        question_style="Academic, theory-focused, expects precise definitions and justifications",
        follow_up_intensity=0.9,
        scoring_strictness=0.85,
        feedback_tone="Direct, critical, points out gaps clearly",
        pressure_multiplier=1.2,
    ),
    PersonaType.SKEPTICAL_JUDGE: PersonaBehavior(
        name="Skeptical Hackathon Judge",
        question_style="Challenges feasibility, questions innovation claims, probes scalability",
        follow_up_intensity=0.8,
        scoring_strictness=0.75,
        feedback_tone="Challenging, pushes for proof and real-world relevance",
        pressure_multiplier=1.1,
    ),
    PersonaType.STARTUP_CTO: PersonaBehavior(
        name="Startup CTO",
        question_style="Pragmatic, focused on trade-offs, architecture decisions, speed vs quality",
        follow_up_intensity=0.7,
        scoring_strictness=0.7,
        feedback_tone="Conversational, interested in reasoning behind choices",
        pressure_multiplier=1.0,
    ),
    PersonaType.FRIENDLY_HR: PersonaBehavior(
        name="Friendly HR Interviewer",
        question_style="Behavioral, communication-focused, assesses cultural fit",
        follow_up_intensity=0.5,
        scoring_strictness=0.6,
        feedback_tone="Warm, encouraging, focuses on strengths",
        pressure_multiplier=0.8,
    ),
}


class PersonaEngine:
    """Manages evaluator personalities and their behaviors."""

    def __init__(self):
        self.current_persona: PersonaBehavior = None

    def load_persona(self, persona_type: PersonaType):
        """Load a persona configuration."""
        self.current_persona = PERSONA_CONFIGS.get(
            persona_type, PERSONA_CONFIGS[PersonaType.STARTUP_CTO]
        )

    def get_behavior(self) -> dict:
        """Get the current persona's behavior as a dictionary."""
        if not self.current_persona:
            return {}
        return {
            "name": self.current_persona.name,
            "question_style": self.current_persona.question_style,
            "follow_up_intensity": self.current_persona.follow_up_intensity,
            "scoring_strictness": self.current_persona.scoring_strictness,
            "feedback_tone": self.current_persona.feedback_tone,
            "pressure_multiplier": self.current_persona.pressure_multiplier,
        }

    def get_llm_prompt_modifier(self) -> str:
        """Get prompt instructions for LLM based on persona."""
        if not self.current_persona:
            return ""
        return f"""
You are acting as a {self.current_persona.name}.
Your questioning style: {self.current_persona.question_style}
Your feedback tone: {self.current_persona.feedback_tone}
Follow-up intensity level: {self.current_persona.follow_up_intensity} (0-1 scale, higher means more aggressive follow-ups)
"""

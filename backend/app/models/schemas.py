from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class InterviewMode(str, Enum):
    VIVA = "viva"
    HACKATHON = "hackathon"
    INTERVIEW = "interview"


class PersonaType(str, Enum):
    STRICT_PROFESSOR = "strict_professor"
    SKEPTICAL_JUDGE = "skeptical_judge"
    STARTUP_CTO = "startup_cto"
    FRIENDLY_HR = "friendly_hr"


class InterviewStartRequest(BaseModel):
    user_id: str
    mode: InterviewMode
    persona: PersonaType
    github_url: Optional[str] = None
    deployment_url: Optional[str] = None


class InterviewStartResponse(BaseModel):
    session_id: str
    mode: InterviewMode
    persona: PersonaType
    project_summary: Optional[str] = None
    first_question: str


class AnswerRequest(BaseModel):
    answer: str


class QuestionResponse(BaseModel):
    question: str
    focus: str
    difficulty: str
    follow_up: bool = False


class VideoSignal(BaseModel):
    eye_gaze_stability: float  # 0.0 - 1.0
    facial_confidence: float   # 0.0 - 1.0
    attention_score: float     # 0.0 - 1.0
    timestamp: float


class VideoSignalsRequest(BaseModel):
    signals: List[VideoSignal]


class InterviewEndResponse(BaseModel):
    session_id: str
    report_id: str
    message: str


class SkillScore(BaseModel):
    skill: str
    score: float
    feedback: str


class ReportResponse(BaseModel):
    session_id: str
    overall_score: float
    verdict: str  # Ready / Borderline / Needs Work
    skill_scores: List[SkillScore]
    project_understanding_score: Optional[float] = None
    reasoning_depth_index: float
    confidence_index: float
    behavioral_consistency: Optional[float] = None
    improvement_roadmap: List[str]
    strengths: List[str]
    weaknesses: List[str]

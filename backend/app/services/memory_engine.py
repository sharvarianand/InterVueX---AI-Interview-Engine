"""
Memory & Reasoning Tracker

Tracks:
- Weak areas
- Strength trends
- Confidence trajectory
- Explanation consistency

Used to:
- Adapt next questions
- Generate personalized feedback
- Show improvement over sessions
"""

from typing import Optional, List
from app.models.schemas import QuestionResponse


class MemoryEngine:
    """Tracks interview progress and candidate performance patterns."""

    def __init__(self):
        self.questions: List[dict] = []
        self.answers: List[str] = []
        self.evaluations: List[dict] = []
        self.weak_areas: List[str] = []
        self.strong_areas: List[str] = []
        self.confidence_history: List[float] = []

    def record_question(self, question: QuestionResponse):
        """Record a question that was asked."""
        self.questions.append({
            "question": question.question,
            "focus": question.focus,
            "difficulty": question.difficulty,
        })

    def record_answer(self, answer: str):
        """Record a candidate's answer."""
        self.answers.append(answer)

    def record_evaluation(self, evaluation: dict):
        """Record the evaluation of an answer."""
        self.evaluations.append(evaluation)

        # Update weak/strong areas based on evaluation
        score = evaluation.get("score", 0.5)
        focus = evaluation.get("focus", "general")

        if score < 0.4 and focus not in self.weak_areas:
            self.weak_areas.append(focus)
        elif score > 0.7 and focus not in self.strong_areas:
            self.strong_areas.append(focus)

        # Track confidence
        self.confidence_history.append(evaluation.get("confidence", 0.5))

    def get_state(self) -> dict:
        """Get the current memory state for question generation."""
        return {
            "question_count": len(self.questions),
            "answer_count": len(self.answers),
            "weak_areas": self.weak_areas,
            "strong_areas": self.strong_areas,
            "last_answer_quality": self._get_last_answer_quality(),
            "confidence_trend": self._get_confidence_trend(),
            "coverage": self._get_topic_coverage(),
        }

    def _get_last_answer_quality(self) -> str:
        """Get the quality of the last answer."""
        if not self.evaluations:
            return "no_data"
        last_score = self.evaluations[-1].get("score", 0.5)
        if last_score >= 0.7:
            return "strong"
        elif last_score >= 0.4:
            return "adequate"
        else:
            return "weak"

    def _get_confidence_trend(self) -> str:
        """Analyze confidence trend over the interview."""
        if len(self.confidence_history) < 2:
            return "stable"
        
        recent = self.confidence_history[-3:]
        if len(recent) < 2:
            return "stable"
        
        avg_recent = sum(recent) / len(recent)
        avg_earlier = sum(self.confidence_history[:-3]) / max(len(self.confidence_history) - 3, 1)

        if avg_recent > avg_earlier + 0.1:
            return "improving"
        elif avg_recent < avg_earlier - 0.1:
            return "declining"
        else:
            return "stable"

    def _get_topic_coverage(self) -> List[str]:
        """Get list of topics already covered."""
        return list(set(q.get("focus", "") for q in self.questions))

    def get_full_transcript(self) -> List[dict]:
        """Get the full Q&A transcript."""
        transcript = []
        for i, q in enumerate(self.questions):
            entry = {"question": q}
            if i < len(self.answers):
                entry["answer"] = self.answers[i]
            if i < len(self.evaluations):
                entry["evaluation"] = self.evaluations[i]
            transcript.append(entry)
        return transcript

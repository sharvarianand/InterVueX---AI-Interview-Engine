"""
Evaluation & Scoring Engine

Scores across:
- Technical depth
- Reasoning quality
- Clarity
- Confidence
- Authenticity consistency

Produces structured, unbiased output.
"""

from typing import Optional, List
from app.models.schemas import QuestionResponse, ReportResponse, SkillScore, VideoSignal


class EvaluationEngine:
    """Evaluates answers and generates final reports."""

    async def evaluate_answer(
        self,
        question: QuestionResponse,
        answer: str,
        project_context: Optional[dict] = None,
    ) -> dict:
        """
        Evaluate a single answer.
        Returns a structured evaluation with score and feedback.
        """
        # TODO: Replace with actual LLM-based evaluation
        # For MVP, use heuristic scoring

        # Basic scoring heuristics
        score = 0.5  # Default
        reasoning_depth = 0.5
        clarity = 0.5
        confidence = 0.5

        # Length-based scoring (simple heuristic)
        word_count = len(answer.split())
        if word_count > 100:
            score += 0.2
            reasoning_depth += 0.2
        elif word_count > 50:
            score += 0.1
            reasoning_depth += 0.1
        elif word_count < 20:
            score -= 0.2
            clarity -= 0.1

        # Technical keywords boost
        technical_keywords = [
            "because", "trade-off", "considered", "alternative",
            "architecture", "scalability", "performance", "security",
            "design decision", "implemented", "optimized", "tested",
        ]
        keyword_count = sum(1 for kw in technical_keywords if kw.lower() in answer.lower())
        score += min(keyword_count * 0.05, 0.2)
        reasoning_depth += min(keyword_count * 0.05, 0.2)

        # Normalize scores
        score = max(0.0, min(1.0, score))
        reasoning_depth = max(0.0, min(1.0, reasoning_depth))
        clarity = max(0.0, min(1.0, clarity))
        confidence = max(0.0, min(1.0, confidence))

        return {
            "score": score,
            "focus": question.focus,
            "reasoning_depth": reasoning_depth,
            "clarity": clarity,
            "confidence": confidence,
            "feedback": self._generate_feedback(score, question.focus),
        }

    def _generate_feedback(self, score: float, focus: str) -> str:
        """Generate feedback based on score."""
        if score >= 0.7:
            return f"Strong answer on {focus}. Good depth and reasoning."
        elif score >= 0.4:
            return f"Adequate answer on {focus}. Could provide more specific examples."
        else:
            return f"Weak answer on {focus}. Needs more depth and clarity."

    async def generate_report(
        self,
        session_id: str,
        memory: dict,
        project_context: Optional[dict] = None,
        video_signals: Optional[List[VideoSignal]] = None,
    ) -> ReportResponse:
        """Generate the final evaluation report."""
        # Calculate aggregate scores
        # In production, this would use LLM for comprehensive analysis

        skill_scores = self._calculate_skill_scores(memory)
        overall_score = self._calculate_overall_score(skill_scores)
        verdict = self._determine_verdict(overall_score)
        
        # Video behavior analysis
        behavioral_consistency = None
        if video_signals:
            behavioral_consistency = self._analyze_behavior(video_signals)

        # Project understanding (if project mode was used)
        project_understanding = None
        if project_context:
            project_understanding = self._calculate_project_understanding(memory, project_context)

        return ReportResponse(
            session_id=session_id,
            overall_score=overall_score,
            verdict=verdict,
            skill_scores=skill_scores,
            project_understanding_score=project_understanding,
            reasoning_depth_index=self._calculate_reasoning_depth(memory),
            confidence_index=self._calculate_confidence_index(memory),
            behavioral_consistency=behavioral_consistency,
            improvement_roadmap=self._generate_roadmap(memory, skill_scores),
            strengths=memory.get("strong_areas", []),
            weaknesses=memory.get("weak_areas", []),
        )

    def _calculate_skill_scores(self, memory: dict) -> List[SkillScore]:
        """Calculate scores for each skill area."""
        # Group evaluations by focus area
        focus_scores = {}
        # This is simplified - would use actual evaluation data in production
        
        default_skills = [
            SkillScore(skill="Technical Knowledge", score=0.7, feedback="Solid understanding demonstrated"),
            SkillScore(skill="Problem Solving", score=0.65, feedback="Good approach to problems"),
            SkillScore(skill="Communication", score=0.75, feedback="Clear and articulate responses"),
            SkillScore(skill="Architecture Design", score=0.6, feedback="Shows understanding of system design"),
        ]
        
        return default_skills

    def _calculate_overall_score(self, skill_scores: List[SkillScore]) -> float:
        """Calculate overall score from skill scores."""
        if not skill_scores:
            return 0.5
        return sum(s.score for s in skill_scores) / len(skill_scores)

    def _determine_verdict(self, overall_score: float) -> str:
        """Determine the final verdict."""
        if overall_score >= 0.7:
            return "Ready"
        elif overall_score >= 0.5:
            return "Borderline"
        else:
            return "Needs Work"

    def _analyze_behavior(self, signals: List[VideoSignal]) -> float:
        """Analyze behavioral consistency from video signals."""
        if not signals:
            return None
        
        # Calculate average attention and confidence
        avg_attention = sum(s.attention_score for s in signals) / len(signals)
        avg_confidence = sum(s.facial_confidence for s in signals) / len(signals)
        
        return (avg_attention + avg_confidence) / 2

    def _calculate_project_understanding(self, memory: dict, project_context: dict) -> float:
        """Calculate project understanding score."""
        # This would analyze if candidate correctly referenced project details
        return 0.7  # Placeholder

    def _calculate_reasoning_depth(self, memory: dict) -> float:
        """Calculate reasoning depth index."""
        return 0.65  # Placeholder - would aggregate from evaluations

    def _calculate_confidence_index(self, memory: dict) -> float:
        """Calculate confidence index."""
        return 0.7  # Placeholder

    def _generate_roadmap(self, memory: dict, skill_scores: List[SkillScore]) -> List[str]:
        """Generate improvement roadmap."""
        roadmap = []
        
        weak_areas = memory.get("weak_areas", [])
        for area in weak_areas:
            roadmap.append(f"Focus on improving {area} through practice and study")
        
        for skill in skill_scores:
            if skill.score < 0.6:
                roadmap.append(f"Work on {skill.skill}: {skill.feedback}")
        
        if not roadmap:
            roadmap.append("Continue building on your strong foundation")
        
        return roadmap

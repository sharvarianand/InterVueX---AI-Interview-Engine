"""
Question Generator - Generates Adaptive Questions using LLM

This block:
- Takes context from project analysis
- Considers persona behavior
- Uses memory of past Q&A
- Adjusts based on pressure level
- Generates deep, project-specific questions
"""

import os
from typing import Optional, List
from app.models.schemas import InterviewMode, QuestionResponse, VideoSignal


class QuestionGenerator:
    """Generates adaptive interview questions using LLM."""

    def __init__(self):
        self.question_count = 0

    async def generate(
        self,
        mode: InterviewMode,
        persona: dict,
        project_context: Optional[dict] = None,
        memory: Optional[dict] = None,
        pressure_level: float = 0.5,
        video_signals: Optional[List[VideoSignal]] = None,
    ) -> QuestionResponse:
        """Generate the next adaptive question."""
        self.question_count += 1

        # Build the prompt for LLM
        prompt = self._build_prompt(
            mode=mode,
            persona=persona,
            project_context=project_context,
            memory=memory,
            pressure_level=pressure_level,
            video_signals=video_signals,
        )

        # For MVP: Use a mock response or call actual LLM
        # In production, this would call Gemini/GPT API
        question_data = await self._call_llm(prompt)

        return QuestionResponse(
            question=question_data["question"],
            focus=question_data.get("focus", "general"),
            difficulty=question_data.get("difficulty", "medium"),
            follow_up=question_data.get("follow_up", False),
        )

    def _build_prompt(
        self,
        mode: InterviewMode,
        persona: dict,
        project_context: Optional[dict],
        memory: Optional[dict],
        pressure_level: float,
        video_signals: Optional[List[VideoSignal]],
    ) -> str:
        """Build the LLM prompt for question generation."""
        prompt_parts = []

        # Mode context
        mode_instructions = {
            InterviewMode.VIVA: "This is an academic viva examination. Focus on theory, justification, and deep understanding.",
            InterviewMode.HACKATHON: "This is a hackathon jury evaluation. Focus on innovation, feasibility, and impact.",
            InterviewMode.INTERVIEW: "This is a technical interview. Focus on problem-solving, trade-offs, and system design.",
        }
        prompt_parts.append(mode_instructions.get(mode, ""))

        # Persona
        if persona:
            prompt_parts.append(f"You are acting as: {persona.get('name', 'an interviewer')}")
            prompt_parts.append(f"Questioning style: {persona.get('question_style', '')}")

        # Project context
        if project_context:
            prompt_parts.append(f"\n--- PROJECT CONTEXT ---")
            prompt_parts.append(f"Summary: {project_context.get('summary', 'No summary')}")
            prompt_parts.append(f"Tech Stack: {', '.join(project_context.get('tech_stack', []))}")
            prompt_parts.append(f"Architecture: {project_context.get('architecture', 'Unknown')}")
            if project_context.get("readme"):
                prompt_parts.append(f"README excerpt: {project_context['readme'][:500]}")

        # Memory (past Q&A)
        if memory:
            prompt_parts.append(f"\n--- INTERVIEW PROGRESS ---")
            prompt_parts.append(f"Questions asked: {memory.get('question_count', 0)}")
            if memory.get("weak_areas"):
                prompt_parts.append(f"Identified weak areas: {', '.join(memory['weak_areas'])}")
            if memory.get("strong_areas"):
                prompt_parts.append(f"Strong areas: {', '.join(memory['strong_areas'])}")
            if memory.get("last_answer_quality"):
                prompt_parts.append(f"Last answer quality: {memory['last_answer_quality']}")

        # Pressure level
        if pressure_level > 0.7:
            prompt_parts.append("\nIncrease difficulty. Ask follow-up or multi-part questions.")
        elif pressure_level < 0.3:
            prompt_parts.append("\nKeep difficulty moderate. Build candidate confidence.")

        # Video signals (if showing attention drift)
        if video_signals:
            avg_attention = sum(s.attention_score for s in video_signals) / len(video_signals)
            if avg_attention < 0.5:
                prompt_parts.append("\nCandidate may be distracted. Ask a conceptual 'explain in your own words' question.")

        prompt_parts.append("\n--- GENERATE NEXT QUESTION ---")
        prompt_parts.append("Generate a single, focused question. Respond in JSON format:")
        prompt_parts.append('{"question": "...", "focus": "...", "difficulty": "low|medium|high", "follow_up": true|false}')

        return "\n".join(prompt_parts)

    async def _call_llm(self, prompt: str) -> dict:
        """
        Call Gemini LLM to generate a question.
        Falls back to mock data if API fails.
        """
        import json
        from app.core.config import settings
        
        # Try to use Gemini API if available
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                
                genai.configure(api_key=settings.GEMINI_API_KEY)
                model = genai.GenerativeModel("gemini-2.0-flash")
                
                response = model.generate_content(
                    prompt,
                    generation_config=genai.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=500,
                    )
                )
                
                # Parse the JSON response
                response_text = response.text.strip()
                
                # Handle markdown code blocks
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.startswith("```"):
                    response_text = response_text[3:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                
                question_data = json.loads(response_text.strip())
                return question_data
                
            except Exception as e:
                print(f"Gemini API error: {e}")
                # Fall through to mock data
        
        # Fallback: Mock responses based on question count
        mock_questions = [
            {
                "question": "Tell me about this project. What problem does it solve and who is the target user?",
                "focus": "overview",
                "difficulty": "low",
                "follow_up": False,
            },
            {
                "question": "Walk me through the architecture. How do the different components communicate with each other?",
                "focus": "architecture",
                "difficulty": "medium",
                "follow_up": False,
            },
            {
                "question": "Why did you choose this particular tech stack? What trade-offs did you consider?",
                "focus": "technical_decisions",
                "difficulty": "medium",
                "follow_up": True,
            },
            {
                "question": "How would this system behave under 10x the current load? What would break first?",
                "focus": "scalability",
                "difficulty": "high",
                "follow_up": True,
            },
            {
                "question": "What are the security vulnerabilities in this system? How would you address them?",
                "focus": "security",
                "difficulty": "high",
                "follow_up": True,
            },
            {
                "question": "If you had to rebuild this from scratch, what would you do differently?",
                "focus": "reflection",
                "difficulty": "medium",
                "follow_up": False,
            },
        ]

        index = (self.question_count - 1) % len(mock_questions)
        return mock_questions[index]


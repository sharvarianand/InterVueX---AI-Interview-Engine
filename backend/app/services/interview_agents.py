"""
Specialized Interview Agents
Each agent handles a specific type of interview with personalized question generation
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
import json
from app.core.config import settings


class BaseInterviewAgent(ABC):
    """Base class for all interview agents."""
    
    def __init__(self):
        self.agent_type = "base"
        self.question_history = []
        self.candidate_profile = {}
        self.weak_areas = []
        self.strong_areas = []
        
    @abstractmethod
    async def generate_question(
        self,
        context: Dict[str, Any],
        previous_qa: List[Dict[str, str]],
        pressure_level: float = 0.5
    ) -> Dict[str, Any]:
        """Generate a personalized question based on context."""
        pass
    
    @abstractmethod
    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate the candidate's answer."""
        pass
    
    def extract_resume_skills(self, resume_text: str) -> Dict[str, List[str]]:
        """Extract skills from resume text."""
        skills = {
            "programming_languages": [],
            "frameworks": [],
            "databases": [],
            "cloud": [],
            "tools": [],
            "soft_skills": []
        }
        
        # Programming languages detection
        languages = ["python", "javascript", "java", "c++", "c#", "go", "rust", "typescript", "ruby", "php", "swift", "kotlin"]
        for lang in languages:
            if lang.lower() in resume_text.lower():
                skills["programming_languages"].append(lang.capitalize())
        
        # Frameworks
        frameworks = ["react", "angular", "vue", "django", "flask", "fastapi", "spring", "express", "nextjs", "node"]
        for fw in frameworks:
            if fw.lower() in resume_text.lower():
                skills["frameworks"].append(fw)
        
        # Databases
        databases = ["mysql", "postgresql", "mongodb", "redis", "elasticsearch", "dynamodb", "firebase"]
        for db in databases:
            if db.lower() in resume_text.lower():
                skills["databases"].append(db)
        
        # Cloud
        cloud = ["aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform"]
        for c in cloud:
            if c.lower() in resume_text.lower():
                skills["cloud"].append(c.upper() if len(c) <= 3 else c.capitalize())
        
        return skills

    async def _call_gemini(self, prompt: str, temperature: float = 0.7) -> str:
        """Call Gemini API with the given prompt."""
        if not settings.GEMINI_API_KEY:
            return None
            
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")
            
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=800,
                )
            )
            
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API error: {e}")
            return None


class TechnicalInterviewAgent(BaseInterviewAgent):
    """
    Technical Interview Agent
    Focuses on: Data structures, algorithms, system design, coding concepts
    """
    
    def __init__(self):
        super().__init__()
        self.agent_type = "technical"
        self.difficulty_progression = ["easy", "medium", "hard"]
        self.current_difficulty = 0
        self.topics_covered = []
        
    async def generate_question(
        self,
        context: Dict[str, Any],
        previous_qa: List[Dict[str, str]],
        pressure_level: float = 0.5
    ) -> Dict[str, Any]:
        """Generate technical interview questions based on CV and previous answers."""
        
        resume_skills = context.get("skills", {})
        question_count = len(previous_qa)
        
        # Build context for personalization
        skills_str = ", ".join([
            *resume_skills.get("programming_languages", []),
            *resume_skills.get("frameworks", []),
            *resume_skills.get("databases", [])
        ])
        
        # Previous Q&A for follow-ups
        prev_qa_str = ""
        if previous_qa:
            last_qa = previous_qa[-1]
            prev_qa_str = f"""
Last Question: {last_qa.get('question', '')}
Candidate's Answer: {last_qa.get('answer', '')}
Score: {last_qa.get('score', 'N/A')}
"""
        
        # Determine difficulty based on performance
        difficulty = self.difficulty_progression[min(self.current_difficulty, 2)]
        if pressure_level > 0.7:
            difficulty = "hard"
        elif pressure_level < 0.3:
            difficulty = "easy"
        
        prompt = f"""You are a senior technical interviewer conducting a focused technical interview.

CANDIDATE PROFILE:
- Skills: {skills_str or 'General software engineering'}
- Interview Mode: Technical Deep Dive
- Question Number: {question_count + 1}
- Current Difficulty: {difficulty}

{f"PREVIOUS INTERACTION:{prev_qa_str}" if prev_qa_str else "This is the FIRST question. Start with a foundational technical question."}

GUIDELINES:
1. If this is a follow-up, probe deeper into the same topic based on their answer
2. Ask about their claimed skills but verify depth of knowledge
3. Include scenario-based questions ("What would happen if...")
4. For coding skills, ask about edge cases and optimization
5. Gradually increase complexity if they answer well
6. Catch inconsistencies between claimed skills and actual knowledge

ANTI-PATTERN DETECTION:
- Avoid questions with easily Google-able answers
- Ask "Why" and "How" questions, not just "What"
- Request specific examples from their experience
- Ask them to compare/contrast technologies they know

Generate ONE targeted technical question. Respond in JSON:
{{
    "question": "The specific technical question",
    "focus_area": "e.g., data_structures, system_design, coding_concepts",
    "difficulty": "{difficulty}",
    "expected_depth": "What a good answer should cover",
    "follow_up_ready": true/false,
    "skill_being_tested": "The specific skill from their resume being tested"
}}"""

        response = await self._call_gemini(prompt, temperature=0.7)
        
        if response:
            try:
                # Clean JSON response
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                question_data = json.loads(response.strip())
                self.topics_covered.append(question_data.get("focus_area", "general"))
                return question_data
            except:
                pass
        
        # Fallback questions
        fallback_questions = [
            {
                "question": f"I see you have experience with {skills_str.split(',')[0] if skills_str else 'software development'}. Can you explain how you would design a scalable API for a high-traffic application?",
                "focus_area": "system_design",
                "difficulty": "medium",
                "expected_depth": "Discussion of REST/GraphQL, caching, load balancing",
                "follow_up_ready": True,
                "skill_being_tested": "System Design"
            },
            {
                "question": "Walk me through how you would debug a memory leak in a production application. What tools and techniques would you use?",
                "focus_area": "debugging",
                "difficulty": "medium",
                "expected_depth": "Profiling tools, heap analysis, monitoring",
                "follow_up_ready": True,
                "skill_being_tested": "Debugging Skills"
            },
            {
                "question": "Explain the difference between SQL and NoSQL databases. When would you choose one over the other for a new project?",
                "focus_area": "databases",
                "difficulty": "medium",
                "expected_depth": "ACID vs BASE, scalability, use cases",
                "follow_up_ready": True,
                "skill_being_tested": "Database Knowledge"
            }
        ]
        
        return fallback_questions[question_count % len(fallback_questions)]

    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate technical answer with detailed scoring."""
        
        if len(answer.strip()) < 20:
            return {
                "score": 0.2,
                "technical_accuracy": 0.2,
                "depth": 0.2,
                "communication": 0.3,
                "feedback": "Answer is too brief. Please provide more detailed explanation.",
                "follow_up_needed": True,
                "detected_weakness": "Incomplete response"
            }
        
        prompt = f"""Evaluate this technical interview answer:

QUESTION: {question}

CANDIDATE'S ANSWER: {answer}

Rate the answer on these dimensions (0.0 to 1.0):
1. technical_accuracy: Is the information correct?
2. depth: How deep is the understanding shown?
3. practical_knowledge: Does it show real-world experience?
4. communication: Is the explanation clear?

Also identify:
- Any technical inaccuracies
- Missing important concepts
- Whether a follow-up question is needed

Respond in JSON:
{{
    "score": 0.0-1.0,
    "technical_accuracy": 0.0-1.0,
    "depth": 0.0-1.0,
    "practical_knowledge": 0.0-1.0,
    "communication": 0.0-1.0,
    "feedback": "Constructive feedback (1-2 sentences)",
    "inaccuracies": ["list of any technical errors"],
    "missing_concepts": ["important concepts not covered"],
    "follow_up_needed": true/false,
    "detected_strength": "What they did well",
    "detected_weakness": "What needs improvement"
}}"""

        response = await self._call_gemini(prompt, temperature=0.3)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                eval_data = json.loads(response.strip())
                
                # Update difficulty based on score
                if eval_data.get("score", 0.5) > 0.7:
                    self.current_difficulty = min(2, self.current_difficulty + 1)
                elif eval_data.get("score", 0.5) < 0.4:
                    self.current_difficulty = max(0, self.current_difficulty - 1)
                
                return eval_data
            except:
                pass
        
        # Fallback evaluation
        word_count = len(answer.split())
        base_score = min(0.7, 0.3 + (word_count / 200))
        
        return {
            "score": base_score,
            "technical_accuracy": base_score,
            "depth": base_score - 0.1,
            "practical_knowledge": base_score,
            "communication": base_score + 0.1,
            "feedback": "Good attempt. Consider providing more specific examples.",
            "follow_up_needed": True,
            "detected_strength": "Clear communication",
            "detected_weakness": "Could use more depth"
        }


class BehavioralInterviewAgent(BaseInterviewAgent):
    """
    Behavioral Interview Agent
    Focuses on: STAR method, soft skills, teamwork, leadership, conflict resolution
    """
    
    def __init__(self):
        super().__init__()
        self.agent_type = "behavioral"
        self.competencies_tested = []
        
    async def generate_question(
        self,
        context: Dict[str, Any],
        previous_qa: List[Dict[str, str]],
        pressure_level: float = 0.5
    ) -> Dict[str, Any]:
        """Generate behavioral questions using STAR method."""
        
        resume_text = context.get("resume_text", "")
        question_count = len(previous_qa)
        
        # Behavioral competencies to test
        competencies = [
            "leadership", "teamwork", "conflict_resolution", 
            "problem_solving", "adaptability", "communication",
            "time_management", "initiative", "learning_agility"
        ]
        
        # Don't repeat tested competencies
        available = [c for c in competencies if c not in self.competencies_tested]
        if not available:
            available = competencies
        
        prev_qa_str = ""
        if previous_qa:
            last_qa = previous_qa[-1]
            prev_qa_str = f"Last answer was about: {last_qa.get('question', '')[:100]}"
        
        prompt = f"""You are an experienced HR interviewer focused on behavioral assessment.

INTERVIEW CONTEXT:
- Question Number: {question_count + 1}
- Already tested: {', '.join(self.competencies_tested) or 'None yet'}
- Available competencies: {', '.join(available[:3])}
{prev_qa_str}

Create a STAR-method behavioral question that:
1. Asks about a SPECIFIC past situation
2. Cannot be answered with hypotheticals
3. Requires self-reflection and honesty
4. Reveals true character and work style
5. Is difficult to fake or rehearse

ANTI-CHEAT PATTERNS:
- Ask for specific details (dates, names, outcomes)
- Request the candidate to describe their ROLE vs team's role
- Ask about failures or challenges, not just successes
- Probe for lessons learned

Generate ONE behavioral question. Respond in JSON:
{{
    "question": "The behavioral question",
    "competency": "Which soft skill is being tested",
    "follow_up_probes": ["2-3 follow-up questions to get more details"],
    "red_flags": ["What would indicate a fabricated answer"],
    "green_flags": ["What would indicate an authentic, strong answer"]
}}"""

        response = await self._call_gemini(prompt)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                question_data = json.loads(response.strip())
                self.competencies_tested.append(question_data.get("competency", "general"))
                return question_data
            except:
                pass
        
        # Fallback
        return {
            "question": "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation and what was the outcome?",
            "competency": "conflict_resolution",
            "follow_up_probes": [
                "What specifically made them difficult?",
                "How did your actions affect the team dynamic?",
                "What would you do differently now?"
            ],
            "red_flags": ["Vague details", "Blames others entirely", "No specific outcome"],
            "green_flags": ["Specific situation", "Takes responsibility", "Shows growth"]
        }

    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate behavioral answer using STAR criteria."""
        
        prompt = f"""Evaluate this behavioral interview answer using STAR method:

QUESTION: {question}

CANDIDATE'S ANSWER: {answer}

Evaluate for:
1. Situation: Did they describe a clear, specific situation?
2. Task: Was their role/responsibility clear?
3. Action: Did they explain their specific actions?
4. Result: Was there a measurable outcome?

Also assess:
- Authenticity: Does this sound like a real experience?
- Self-awareness: Do they show reflection?
- Growth mindset: Did they learn from the experience?

Respond in JSON:
{{
    "score": 0.0-1.0,
    "star_breakdown": {{
        "situation": 0.0-1.0,
        "task": 0.0-1.0,
        "action": 0.0-1.0,
        "result": 0.0-1.0
    }},
    "authenticity_score": 0.0-1.0,
    "self_awareness": 0.0-1.0,
    "feedback": "Constructive feedback",
    "red_flags_detected": ["any concerning patterns"],
    "competency_demonstrated": "The soft skill shown"
}}"""

        response = await self._call_gemini(prompt, temperature=0.3)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                return json.loads(response.strip())
            except:
                pass
        
        # Fallback
        return {
            "score": 0.6,
            "star_breakdown": {"situation": 0.6, "task": 0.6, "action": 0.6, "result": 0.6},
            "authenticity_score": 0.7,
            "self_awareness": 0.6,
            "feedback": "Good structure. Try to include more specific details and measurable outcomes.",
            "red_flags_detected": [],
            "competency_demonstrated": "General"
        }


class ProjectVivaAgent(BaseInterviewAgent):
    """
    Project Viva Agent
    Focuses on: Deep understanding of own projects, technical decisions, architecture
    """
    
    def __init__(self):
        super().__init__()
        self.agent_type = "project_viva"
        self.project_details = {}
        self.aspects_covered = []
        
    async def generate_question(
        self,
        context: Dict[str, Any],
        previous_qa: List[Dict[str, str]],
        pressure_level: float = 0.5
    ) -> Dict[str, Any]:
        """Generate questions about the candidate's own projects."""
        
        resume_text = context.get("resume_text", "")
        question_count = len(previous_qa)
        
        # Aspects to probe
        aspects = [
            "architecture", "tech_stack_choice", "challenges",
            "scalability", "security", "testing", "deployment",
            "team_collaboration", "future_improvements"
        ]
        
        available = [a for a in aspects if a not in self.aspects_covered]
        
        prev_qa_str = ""
        if previous_qa:
            last_qa = previous_qa[-1]
            prev_qa_str = f"""
Previous Q: {last_qa.get('question', '')}
Their Answer: {last_qa.get('answer', '')}"""
        
        prompt = f"""You are a professor conducting an academic viva on a student's project.

CONTEXT:
- This is question {question_count + 1}
- Aspects already covered: {self.aspects_covered}
- Available aspects: {available[:3]}
{prev_qa_str}

Your goal is to verify the candidate actually built and understands their project:
1. Ask about WHY decisions were made, not just WHAT
2. Probe for implementation details
3. Ask about challenges they faced
4. Test if they can explain to a non-technical person
5. Ask what they would improve

VERIFICATION TECHNIQUES:
- Ask about specific code/architecture decisions
- Request them to walk through a user flow
- Ask about bugs they fixed
- Question trade-offs they made

Generate ONE probing question. Respond in JSON:
{{
    "question": "The viva question",
    "aspect": "Which aspect of the project is being tested",
    "verification_intent": "What we're trying to verify",
    "expected_knowledge": "What a genuine builder would know",
    "fake_indicators": ["Signs they didn't actually build it"]
}}"""

        response = await self._call_gemini(prompt)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                    
                question_data = json.loads(response.strip())
                self.aspects_covered.append(question_data.get("aspect", "general"))
                return question_data
            except:
                pass
        
        # Fallback
        return {
            "question": "Walk me through the most challenging technical problem you faced in your project and how you solved it step by step.",
            "aspect": "challenges",
            "verification_intent": "Verify hands-on experience",
            "expected_knowledge": "Specific debugging steps, tools used, time taken",
            "fake_indicators": ["Vague answers", "No specific tools mentioned", "Perfect solution immediately"]
        }

    async def evaluate_answer(
        self,
        question: str,
        answer: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate project viva answer for authenticity and depth."""
        
        prompt = f"""Evaluate this project viva answer:

QUESTION: {question}

CANDIDATE'S ANSWER: {answer}

Assess:
1. ownership: Does it sound like they actually built this?
2. technical_depth: Do they understand the internals?
3. decision_reasoning: Can they explain WHY?
4. honest_about_limitations: Do they acknowledge what they don't know?

Respond in JSON:
{{
    "score": 0.0-1.0,
    "ownership_score": 0.0-1.0,
    "technical_depth": 0.0-1.0,
    "decision_reasoning": 0.0-1.0,
    "honesty": 0.0-1.0,
    "feedback": "Constructive feedback",
    "authenticity_verdict": "genuine/uncertain/suspicious",
    "follow_up_recommended": "A probing follow-up question if suspicious"
}}"""

        response = await self._call_gemini(prompt, temperature=0.3)
        
        if response:
            try:
                if "```json" in response:
                    response = response.split("```json")[1].split("```")[0]
                elif "```" in response:
                    response = response.split("```")[1].split("```")[0]
                return json.loads(response.strip())
            except:
                pass
        
        return {
            "score": 0.6,
            "ownership_score": 0.6,
            "technical_depth": 0.6,
            "decision_reasoning": 0.6,
            "honesty": 0.7,
            "feedback": "Provide more specific implementation details.",
            "authenticity_verdict": "uncertain",
            "follow_up_recommended": "Can you show me a specific piece of code you're proud of?"
        }


# Factory function to get the right agent
def get_interview_agent(interview_type: str) -> BaseInterviewAgent:
    """Factory function to get the appropriate interview agent."""
    agents = {
        "technical": TechnicalInterviewAgent,
        "behavioral": BehavioralInterviewAgent,
        "project_viva": ProjectVivaAgent,
        "viva": ProjectVivaAgent,
        "interview": TechnicalInterviewAgent,
        "hackathon": ProjectVivaAgent,
        "hr": BehavioralInterviewAgent,
    }

    
    agent_class = agents.get(interview_type.lower(), TechnicalInterviewAgent)
    return agent_class()

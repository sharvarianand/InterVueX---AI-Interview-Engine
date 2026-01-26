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
        """Call AI API (OpenRouter primary, Gemini fallback)."""
        print(f"[AI] Attempting API call with temperature={temperature}")
        
        # Try OpenRouter first (more reliable)
        if settings.OPENROUTER_API_KEY:
            try:
                from app.services.openrouter_client import openrouter_client
                result = await openrouter_client.generate_content(
                    prompt=prompt,
                    temperature=temperature,
                    max_tokens=1000
                )
                if result:
                    return result
                print("[AI] OpenRouter failed, trying Gemini...")
            except Exception as e:
                print(f"[AI] OpenRouter error: {e}, trying Gemini...")
        
        # Fallback to Gemini
        if not settings.GEMINI_API_KEY:
            print("[AI] ERROR: No API key configured!")
            return None
            
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")
            
            print(f"[GEMINI] Sending request to Gemini 2.0 Flash...")
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=temperature,
                    max_output_tokens=1000,
                )
            )
            
            result = response.text.strip()
            print(f"[GEMINI] SUCCESS - Got response of length: {len(result)}")
            return result
        except Exception as e:
            print(f"[GEMINI] ERROR: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
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
        cv_data = context.get("cv", {})
        question_count = len(previous_qa)
        
        # Build context for personalization from CV
        skills_str = ", ".join([
            *resume_skills.get("programming_languages", []),
            *resume_skills.get("frameworks", []),
            *resume_skills.get("databases", []),
            *resume_skills.get("cloud_platforms", []),
            *resume_skills.get("devops_tools", []),
            *resume_skills.get("ai_ml", [])
        ])
        
        # Extract projects from CV
        projects = cv_data.get("projects", []) if cv_data else []
        projects_str = ""
        if projects:
            projects_str = "\n".join([f"- {p.get('name', 'Project')}: {p.get('description', '')[:100]}" for p in projects[:3]])
        
        # Get AI analysis if available
        ai_analysis = cv_data.get("ai_analysis", {}) if cv_data else {}
        focus_areas = ai_analysis.get("interview_focus_areas", [])
        interesting_projects = ai_analysis.get("interesting_projects", [])
        weak_areas = ai_analysis.get("potential_weak_areas", [])
        
        # Build list of topics already covered (to avoid repetition)
        covered_topics = ", ".join(self.topics_covered) if self.topics_covered else "None yet"
        
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
        
        # Random aspect to focus on (ensures variety)
        import random
        focus_options = ["skills", "projects", "architecture", "debugging", "optimization", "trade-offs", "real-world-scenario"]
        random_focus = random.choice(focus_options)
        
        prompt = f"""You are a senior technical interviewer conducting a personalized technical interview based on the candidate's CV.

CANDIDATE PROFILE FROM CV:
- Technical Skills: {skills_str or 'General software engineering'}
- Experience Level: {ai_analysis.get('experience_level', 'mid')}
- Specialization: {ai_analysis.get('specialization', 'Software Development')}

CANDIDATE'S PROJECTS (from their CV):
{projects_str or "No specific projects listed"}

INTERESTING PROJECTS TO ASK ABOUT:
{', '.join(interesting_projects) if interesting_projects else 'Ask about their most challenging project'}

FOCUS AREAS FOR THIS CANDIDATE:
{', '.join(focus_areas) if focus_areas else 'General technical knowledge'}

POTENTIAL WEAK AREAS TO TEST:
{', '.join(weak_areas) if weak_areas else 'Verify depth in claimed skills'}

INTERVIEW STATE:
- Question Number: {question_count + 1} of 5
- Current Difficulty: {difficulty}
- Topics Already Covered: {covered_topics}
- Random Focus for this question: {random_focus}

{f"PREVIOUS INTERACTION:{prev_qa_str}" if prev_qa_str else "This is the FIRST question. Start with a question about their strongest skill or project from their CV."}

CRITICAL INSTRUCTIONS:
1. Generate a UNIQUE question different from previous interviews
2. Focus on the candidate's SPECIFIC skills and projects from their CV
3. Ask about THEIR projects, not generic theoretical questions
4. If they claim React/Python/AWS etc, test THAT specific technology
5. Include scenario-based questions ("In your project X, what would you do if...")
6. For Question {question_count + 1}, focus on: {random_focus}
7. DO NOT repeat topics already covered: {covered_topics}

QUESTION TYPES TO VARY BETWEEN:
- Deep dive into a project they built
- Scenario-based problem solving
- Architecture/design decisions they made
- Debugging approach for their tech stack
- Trade-offs in technologies they chose
- Scaling challenges in their domain

Generate ONE personalized technical question. This MUST be different from any previous question.

Respond in JSON:
{{
    "question": "A UNIQUE question based on THEIR specific CV skills/projects",
    "focus_area": "e.g., {random_focus}",
    "difficulty": "{difficulty}",
    "expected_depth": "What a good answer should cover",
    "follow_up_ready": true/false,
    "skill_being_tested": "The specific skill from their CV being tested"
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
                print(f"[AGENT] Generated question: {question_data['question'][:50]}...")
                return question_data
            except Exception as e:
                print(f"[AGENT] JSON parsing error: {e}")
                print(f"[AGENT] Raw response: {response[:200] if response else 'None'}")
        
        # Dynamic fallback questions based on CV skills
        print(f"[AGENT] Using fallback questions. Skills: {skills_str[:50] if skills_str else 'None'}")
        
        # Get random skill from CV or use generic
        skills_list = [s.strip() for s in skills_str.split(',')] if skills_str else ['programming', 'software development']
        import random
        random_skill = random.choice(skills_list) if skills_list else 'software development'
        
        # Large pool of diverse fallback questions
        all_fallback_questions = [
            # System Design
            {
                "question": f"You mentioned {random_skill} in your background. How would you design a system using {random_skill} that needs to handle millions of requests per day?",
                "focus_area": "system_design",
                "difficulty": difficulty,
                "skill_being_tested": random_skill
            },
            {
                "question": f"Describe the architecture of your most complex project. What were the key technical decisions you made?",
                "focus_area": "architecture",
                "difficulty": difficulty,
                "skill_being_tested": "Architecture"
            },
            {
                "question": f"If you had to build a real-time notification system, what technologies would you use and why?",
                "focus_area": "system_design",
                "difficulty": difficulty,
                "skill_being_tested": "System Design"
            },
            # Debugging
            {
                "question": f"Tell me about the most difficult bug you've ever had to fix. What was your debugging process?",
                "focus_area": "debugging",
                "difficulty": difficulty,
                "skill_being_tested": "Debugging"
            },
            {
                "question": f"How would you troubleshoot a production issue where the application is running slow but you don't know why?",
                "focus_area": "debugging",
                "difficulty": difficulty,
                "skill_being_tested": "Performance Debugging"
            },
            # Technical Skills
            {
                "question": f"What makes {random_skill} your preferred technology? Compare it to alternatives you've used.",
                "focus_area": "technical_knowledge",
                "difficulty": difficulty,
                "skill_being_tested": random_skill
            },
            {
                "question": f"Explain how you would implement authentication and authorization in a web application. What security considerations are important?",
                "focus_area": "security",
                "difficulty": difficulty,
                "skill_being_tested": "Security"
            },
            {
                "question": f"What testing strategies do you follow? How do you decide what to unit test vs integration test?",
                "focus_area": "testing",
                "difficulty": difficulty,
                "skill_being_tested": "Testing"
            },
            # Database
            {
                "question": f"How would you optimize a slow database query? Walk me through your approach.",
                "focus_area": "databases",
                "difficulty": difficulty,
                "skill_being_tested": "Database Optimization"
            },
            {
                "question": f"When would you choose a microservices architecture vs a monolithic one? What are the trade-offs?",
                "focus_area": "architecture",
                "difficulty": difficulty,
                "skill_being_tested": "Architecture Decisions"
            },
            # Project-specific
            {
                "question": f"Walk me through a project you're most proud of. What challenges did you overcome?",
                "focus_area": "projects",
                "difficulty": difficulty,
                "skill_being_tested": "Project Experience"
            },
            {
                "question": f"If you could redesign one of your past projects from scratch, what would you do differently and why?",
                "focus_area": "learning",
                "difficulty": difficulty,
                "skill_being_tested": "Self-Improvement"
            },
            # Coding Concepts
            {
                "question": f"Explain the concept of time complexity. How do you analyze the efficiency of your code?",
                "focus_area": "algorithms",
                "difficulty": difficulty,
                "skill_being_tested": "Algorithm Analysis"
            },
            {
                "question": f"What design patterns do you use frequently? Give me an example of when you applied one.",
                "focus_area": "design_patterns",
                "difficulty": difficulty,
                "skill_being_tested": "Design Patterns"
            },
            {
                "question": f"How do you handle errors and exceptions in your applications? What's your error handling strategy?",
                "focus_area": "error_handling",
                "difficulty": difficulty,
                "skill_being_tested": "Error Handling"
            },
            # DevOps
            {
                "question": f"Describe your experience with CI/CD. How do you set up a deployment pipeline?",
                "focus_area": "devops",
                "difficulty": difficulty,
                "skill_being_tested": "DevOps"
            },
            {
                "question": f"How do you monitor your applications in production? What metrics do you track?",
                "focus_area": "monitoring",
                "difficulty": difficulty,
                "skill_being_tested": "Monitoring"
            },
            # Concurrency
            {
                "question": f"Explain how you handle concurrency in your applications. What challenges have you faced?",
                "focus_area": "concurrency",
                "difficulty": difficulty,
                "skill_being_tested": "Concurrency"
            },
            {
                "question": f"What's the difference between synchronous and asynchronous programming? When would you use each?",
                "focus_area": "async_programming",
                "difficulty": difficulty,
                "skill_being_tested": "Async Programming"
            },
            # API Design
            {
                "question": f"How do you design a RESTful API? What makes an API well-designed?",
                "focus_area": "api_design",
                "difficulty": difficulty,
                "skill_being_tested": "API Design"
            },
        ]
        
        # Filter out topics already covered
        available_questions = [q for q in all_fallback_questions if q['focus_area'] not in self.topics_covered]
        if not available_questions:
            available_questions = all_fallback_questions  # Reset if all covered
        
        # Random selection
        selected = random.choice(available_questions)
        selected['expected_depth'] = 'Technical depth and practical examples'
        selected['follow_up_ready'] = True
        
        self.topics_covered.append(selected['focus_area'])
        print(f"[AGENT] Selected fallback: {selected['question'][:50]}...")
        return selected

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
                print(f"[BEHAVIORAL] Generated question: {question_data['question'][:50]}...")
                return question_data
            except Exception as e:
                print(f"[BEHAVIORAL] JSON parsing error: {e}")
        
        # Dynamic fallback behavioral questions
        import random
        
        all_behavioral_questions = [
            {
                "question": "Tell me about a time when you had to deal with a difficult team member. How did you handle the situation and what was the outcome?",
                "competency": "conflict_resolution",
            },
            {
                "question": "Describe a situation where you had to meet a tight deadline. What steps did you take to ensure you delivered on time?",
                "competency": "time_management",
            },
            {
                "question": "Give me an example of when you had to learn a new skill or technology quickly. How did you approach it?",
                "competency": "learning_agility",
            },
            {
                "question": "Tell me about a time when you failed at something. What did you learn from that experience?",
                "competency": "adaptability",
            },
            {
                "question": "Describe a situation where you had to convince others to adopt your idea or approach. How did you do it?",
                "competency": "leadership",
            },
            {
                "question": "Tell me about a time when you had to work with someone whose communication style was very different from yours.",
                "competency": "communication",
            },
            {
                "question": "Give me an example of when you took initiative on a project without being asked.",
                "competency": "initiative",
            },
            {
                "question": "Describe a situation where you had to prioritize multiple important tasks. How did you decide what to do first?",
                "competency": "problem_solving",
            },
            {
                "question": "Tell me about a time when you had to give difficult feedback to a colleague or teammate.",
                "competency": "communication",
            },
            {
                "question": "Describe a situation where you had to adapt to a significant change at work. How did you handle it?",
                "competency": "adaptability",
            },
            {
                "question": "Tell me about a time when you went above and beyond for a customer or user.",
                "competency": "initiative",
            },
            {
                "question": "Give me an example of when you had to make a decision with incomplete information.",
                "competency": "problem_solving",
            },
            {
                "question": "Tell me about a time when you disagreed with your manager. How did you handle it?",
                "competency": "conflict_resolution",
            },
            {
                "question": "Describe a situation where you had to motivate a team during a challenging period.",
                "competency": "leadership",
            },
            {
                "question": "Tell me about a time when you received constructive criticism. How did you respond?",
                "competency": "learning_agility",
            },
        ]
        
        # Filter out already tested competencies
        available_questions = [q for q in all_behavioral_questions if q['competency'] not in self.competencies_tested]
        if not available_questions:
            available_questions = all_behavioral_questions
        
        selected = random.choice(available_questions)
        selected['follow_up_probes'] = [
            "What specifically was your role in this situation?",
            "What was the measurable outcome?",
            "What would you do differently now?"
        ]
        selected['red_flags'] = ["Vague details", "Blames others entirely", "No specific outcome"]
        selected['green_flags'] = ["Specific situation", "Takes responsibility", "Shows growth"]
        
        self.competencies_tested.append(selected['competency'])
        print(f"[BEHAVIORAL] Selected fallback: {selected['question'][:50]}...")
        return selected

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
                print(f"[VIVA] Generated question: {question_data['question'][:50]}...")
                return question_data
            except Exception as e:
                print(f"[VIVA] JSON parsing error: {e}")
        
        # Dynamic fallback viva questions
        import random
        
        all_viva_questions = [
            {
                "question": "Walk me through the most challenging technical problem you faced in your project and how you solved it step by step.",
                "aspect": "challenges",
                "verification_intent": "Verify hands-on experience"
            },
            {
                "question": "Explain the architecture of your project. Why did you structure it this way?",
                "aspect": "architecture",
                "verification_intent": "Verify understanding of system design"
            },
            {
                "question": "What technologies did you choose for this project and why? What alternatives did you consider?",
                "aspect": "tech_stack_choice",
                "verification_intent": "Verify decision-making process"
            },
            {
                "question": "How would you scale your project to handle 10x more users? What would be the bottlenecks?",
                "aspect": "scalability",
                "verification_intent": "Verify understanding of scalability"
            },
            {
                "question": "What security measures did you implement? How would you protect against common attacks?",
                "aspect": "security",
                "verification_intent": "Verify security awareness"
            },
            {
                "question": "How did you test your project? What was your testing strategy?",
                "aspect": "testing",
                "verification_intent": "Verify quality practices"
            },
            {
                "question": "Walk me through your deployment process. How did you get this to production?",
                "aspect": "deployment",
                "verification_intent": "Verify DevOps knowledge"
            },
            {
                "question": "If you had to work on this project with a team, how would you divide the work?",
                "aspect": "team_collaboration",
                "verification_intent": "Verify collaboration skills"
            },
            {
                "question": "What would you improve in this project if you had more time?",
                "aspect": "future_improvements",
                "verification_intent": "Verify self-awareness and growth mindset"
            },
            {
                "question": "Explain a piece of code you're particularly proud of. Why is it well-written?",
                "aspect": "code_quality",
                "verification_intent": "Verify coding skills"
            },
            {
                "question": "How does data flow through your application? Walk me through a typical user interaction.",
                "aspect": "data_flow",
                "verification_intent": "Verify understanding of system"
            },
            {
                "question": "What was the most difficult bug you encountered? How did you debug it?",
                "aspect": "debugging",
                "verification_intent": "Verify debugging skills"
            },
            {
                "question": "How do you handle errors in your application? What happens when something fails?",
                "aspect": "error_handling",
                "verification_intent": "Verify robustness"
            },
            {
                "question": "What database did you use and how did you design the schema?",
                "aspect": "database_design",
                "verification_intent": "Verify database knowledge"
            },
            {
                "question": "If you were to rebuild this project from scratch, what would you do differently?",
                "aspect": "lessons_learned",
                "verification_intent": "Verify learning and reflection"
            },
        ]
        
        # Filter out already covered aspects
        available_questions = [q for q in all_viva_questions if q['aspect'] not in self.aspects_covered]
        if not available_questions:
            available_questions = all_viva_questions
        
        selected = random.choice(available_questions)
        selected['expected_knowledge'] = 'Specific implementation details, tools used, reasoning'
        selected['fake_indicators'] = ["Vague answers", "No specific tools mentioned", "Generic responses"]
        
        self.aspects_covered.append(selected['aspect'])
        print(f"[VIVA] Selected fallback: {selected['question'][:50]}...")
        return selected

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

"""
CV/Resume Parser Service
Extracts structured information from uploaded resumes
"""

import re
from typing import Dict, List, Any, Optional
from app.core.config import settings


class CVParser:
    """Parse and extract information from CV/Resume text."""
    
    def __init__(self):
        self.skill_patterns = {
            "programming_languages": [
                "python", "javascript", "typescript", "java", "c\\+\\+", "c#",
                "go", "rust", "ruby", "php", "swift", "kotlin", "scala",
                "r programming", "matlab", "perl", "bash", "shell"
            ],
            "frameworks": [
                "react", "angular", "vue", "svelte", "nextjs", "nuxt",
                "django", "flask", "fastapi", "express", "nestjs",
                "spring boot", "spring", "rails", "laravel", "asp\\.net",
                "flutter", "react native", "electron"
            ],
            "databases": [
                "mysql", "postgresql", "postgres", "mongodb", "redis",
                "elasticsearch", "dynamodb", "cassandra", "neo4j",
                "sqlite", "oracle", "sql server", "firestore", "firebase"
            ],
            "cloud_platforms": [
                "aws", "amazon web services", "azure", "gcp", "google cloud",
                "heroku", "vercel", "netlify", "digitalocean", "linode"
            ],
            "devops_tools": [
                "docker", "kubernetes", "k8s", "jenkins", "gitlab ci",
                "github actions", "terraform", "ansible", "prometheus",
                "grafana", "nginx", "apache", "linux"
            ],
            "ai_ml": [
                "tensorflow", "pytorch", "keras", "scikit-learn", "pandas",
                "numpy", "opencv", "nlp", "machine learning", "deep learning",
                "neural network", "computer vision", "langchain", "openai"
            ]
        }
        
        self.experience_patterns = [
            r"(\d+)\+?\s*years?\s*(?:of\s*)?experience",
            r"experience\s*(?:of\s*)?(\d+)\+?\s*years?",
            r"(\d+)\+?\s*yrs?\s*(?:of\s*)?exp"
        ]
        
        self.education_keywords = [
            "bachelor", "master", "phd", "b.tech", "m.tech", "b.e", "m.e",
            "b.sc", "m.sc", "mba", "bca", "mca", "computer science",
            "engineering", "university", "college", "institute"
        ]

    def parse(self, text: str) -> Dict[str, Any]:
        """Parse CV text and extract structured information."""
        text_lower = text.lower()
        
        return {
            "skills": self._extract_skills(text_lower),
            "experience_years": self._extract_experience(text_lower),
            "education": self._extract_education(text_lower),
            "projects": self._extract_projects(text),
            "certifications": self._extract_certifications(text_lower),
            "summary": self._generate_summary(text),
            "raw_text": text[:2000]  # Keep first 2000 chars for context
        }
    
    def _extract_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract technical skills from resume."""
        extracted = {}
        
        for category, patterns in self.skill_patterns.items():
            found_skills = []
            for pattern in patterns:
                if re.search(r'\b' + pattern + r'\b', text, re.IGNORECASE):
                    # Capitalize properly
                    skill = pattern.replace("\\+", "+").replace("\\.", ".")
                    if skill.upper() in ["AWS", "GCP", "SQL", "API", "REST", "NLP", "AI", "ML"]:
                        found_skills.append(skill.upper())
                    else:
                        found_skills.append(skill.title())
            
            if found_skills:
                extracted[category] = list(set(found_skills))
        
        return extracted
    
    def _extract_experience(self, text: str) -> Optional[int]:
        """Extract years of experience."""
        for pattern in self.experience_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return int(match.group(1))
                except:
                    pass
        return None
    
    def _extract_education(self, text: str) -> List[str]:
        """Extract education information."""
        education = []
        
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            for keyword in self.education_keywords:
                if keyword in line_lower:
                    education.append(line.strip())
                    break
        
        return education[:3]  # Return top 3 education entries
    
    def _extract_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract project information."""
        projects = []
        
        # Look for project sections
        project_markers = ["project", "portfolio", "built", "developed", "created"]
        lines = text.split('\n')
        
        in_project_section = False
        current_project = None
        
        for line in lines:
            line_lower = line.lower().strip()
            
            if any(marker in line_lower for marker in ["projects", "portfolio"]):
                in_project_section = True
                continue
            
            if in_project_section and line.strip():
                if line[0].isupper() and len(line) < 100:
                    if current_project:
                        projects.append(current_project)
                    current_project = {"name": line.strip(), "description": ""}
                elif current_project:
                    current_project["description"] += " " + line.strip()
            
            if len(projects) >= 3:
                break
        
        if current_project:
            projects.append(current_project)
        
        return projects[:3]
    
    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications."""
        certs = []
        cert_keywords = [
            "certified", "certification", "certificate",
            "aws certified", "google certified", "microsoft certified",
            "pmp", "scrum master", "comptia"
        ]
        
        lines = text.split('\n')
        for line in lines:
            line_lower = line.lower()
            if any(kw in line_lower for kw in cert_keywords):
                certs.append(line.strip())
        
        return certs[:5]
    
    def _generate_summary(self, text: str) -> str:
        """Generate a brief summary of the candidate."""
        skills = self._extract_skills(text.lower())
        exp = self._extract_experience(text.lower())
        
        summary_parts = []
        
        if exp:
            summary_parts.append(f"{exp}+ years of experience")
        
        if skills.get("programming_languages"):
            summary_parts.append(f"proficient in {', '.join(skills['programming_languages'][:3])}")
        
        if skills.get("frameworks"):
            summary_parts.append(f"experienced with {', '.join(skills['frameworks'][:2])}")
        
        if skills.get("cloud_platforms"):
            summary_parts.append(f"cloud experience: {', '.join(skills['cloud_platforms'][:2])}")
        
        return ". ".join(summary_parts) if summary_parts else "Software professional"

    async def parse_with_ai(self, text: str) -> Dict[str, Any]:
        """Use AI to parse CV for better extraction."""
        basic_parse = self.parse(text)
        
        if not settings.GEMINI_API_KEY:
            return basic_parse
        
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-2.0-flash")
            
            prompt = f"""Analyze this resume/CV and extract key information for a technical interview:

RESUME TEXT:
{text[:3000]}

Extract and respond in JSON:
{{
    "candidate_summary": "2-3 sentence professional summary",
    "top_skills": ["top 5 technical skills"],
    "experience_level": "junior/mid/senior",
    "specialization": "their main area of expertise",
    "interview_focus_areas": ["3-4 topics to focus on during technical interview"],
    "potential_weak_areas": ["areas where depth should be tested"],
    "interesting_projects": ["notable projects to ask about"]
}}"""

            response = model.generate_content(prompt)
            response_text = response.text.strip()
            
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]
            
            import json
            ai_parse = json.loads(response_text.strip())
            
            # Merge with basic parse
            basic_parse["ai_analysis"] = ai_parse
            return basic_parse
            
        except Exception as e:
            print(f"AI CV parsing error: {e}")
            return basic_parse

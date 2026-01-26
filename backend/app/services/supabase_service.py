from typing import List, Optional, Dict, Any
from uuid import UUID
from app.core.supabase import supabase
from app.models.schemas import (
    InterviewMode,
    PersonaType,
    QuestionResponse,
    ReportResponse,
    SkillScore,
)

class SupabaseService:
    """Service to handle all Supabase database interactions."""

    @staticmethod
    async def store_cv(parsed_data: Dict[str, Any], user_id: Optional[str] = None) -> str:
        """Store parsed CV in Supabase and return the ID."""
        data = {
            "parsed_data": parsed_data,
            "user_id": user_id
        }
        response = supabase.table("cvs").insert(data).execute()
        return response.data[0]["id"] if response.data else None

    @staticmethod
    async def get_cv(cv_id: str) -> Optional[Dict[str, Any]]:
        """Fetch a specific CV by ID."""
        response = supabase.table("cvs").select("parsed_data").eq("id", cv_id).single().execute()
        return response.data["parsed_data"] if response.data else None

    @staticmethod
    async def create_session(
        user_id: str,
        mode: str,
        persona: str,
        github_url: Optional[str] = None,
        deployment_url: Optional[str] = None,
        project_summary: Optional[str] = None,
        cv_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Create a new interview session in Supabase."""
        data = {
            "user_id": user_id,
            "mode": mode,
            "persona": persona,
            "project_summary": project_summary,
            "cv_metadata": cv_metadata,
            "status": "active"
        }
        
        # Only add these if they are provided to avoid potential schema mismatch errors
        if github_url:
            data["github_url"] = github_url
        if deployment_url:
            data["deployment_url"] = deployment_url

        try:
            response = supabase.table("interview_sessions").insert(data).execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            print(f"[SUPABASE] Error creating session: {e}")
            # If it fails with a column error, try again without those columns
            if "deployment_url" in str(e) or "github_url" in str(e):
                print("[SUPABASE] Retrying without deployment/github URLs due to schema mismatch")
                data.pop("deployment_url", None)
                data.pop("github_url", None)
                response = supabase.table("interview_sessions").insert(data).execute()
                return response.data[0] if response.data else {}
            raise e

    @staticmethod
    async def update_session_status(session_id: str, status: str):
        """Update the status of an existing session."""
        supabase.table("interview_sessions").update({"status": status}).eq("id", session_id).execute()

    @staticmethod
    async def record_conversation(
        session_id: str,
        sequence_number: int,
        question_text: str,
        question_intent: Optional[str] = None,
        answer_text: Optional[str] = None,
        evaluation_score: Optional[float] = None,
        evaluation_feedback: Optional[str] = None,
        behavior_flags: Optional[Dict[str, Any]] = None,
    ):
        """Record a question/answer pair in the database."""
        data = {
            "session_id": session_id,
            "sequence_number": sequence_number,
            "question_text": question_text,
            "question_intent": question_intent,
            "answer_text": answer_text,
            "evaluation_score": evaluation_score,
            "evaluation_feedback": evaluation_feedback,
            "behavior_flags": behavior_flags,
        }
        supabase.table("conversations").insert(data).execute()

    @staticmethod
    async def update_last_conversation_answer(
        session_id: str,
        answer_text: str,
        evaluation_score: Optional[float] = None,
        evaluation_feedback: Optional[str] = None,
    ):

        """Update the latest conversation entry with user's answer and AI evaluation."""
        # First get the latest sequence number
        response = supabase.table("conversations").select("id, sequence_number").eq("session_id", session_id).order("sequence_number", desc=True).limit(1).execute()
        if response.data:
            last_id = response.data[0]["id"]
            supabase.table("conversations").update({
                "answer_text": answer_text,
                "evaluation_score": evaluation_score,
                "evaluation_feedback": evaluation_feedback
            }).eq("id", last_id).execute()

    @staticmethod
    async def store_report(
        session_id: str,
        user_id: str,
        report: ReportResponse
    ):
        """Store the final interview report."""
        data = {
            "session_id": session_id,
            "user_id": user_id,
            "overall_score": report.overall_score,
            "verdict": report.verdict,
            "skill_scores": [s.model_dump() for s in report.skill_scores],
            "project_understanding_score": report.project_understanding_score,
            "reasoning_depth_index": report.reasoning_depth_index,
            "confidence_index": report.confidence_index,
            "behavioral_consistency": report.behavioral_consistency,
            "improvement_roadmap": report.improvement_roadmap,
            "strengths": report.strengths,
            "weaknesses": report.weaknesses,
        }
        supabase.table("reports").insert(data).execute()

    @staticmethod
    async def get_user_reports(user_id: str) -> List[Dict[str, Any]]:
        """Fetch all reports for a specific user."""
        response = supabase.table("reports").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return response.data if response.data else []

    @staticmethod
    async def get_report_by_id(report_id: str) -> Dict[str, Any]:
        """Fetch a specific report by ID."""
        response = supabase.table("reports").select("*, interview_sessions(*)").eq("id", report_id).single().execute()
        return response.data if response.data else {}

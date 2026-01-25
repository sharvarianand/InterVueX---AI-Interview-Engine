from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.orchestrator import InterviewOrchestrator
from app.models.schemas import (
    InterviewStartRequest,
    InterviewStartResponse,
    AnswerRequest,
    QuestionResponse,
    VideoSignalsRequest,
    InterviewEndResponse,
)

router = APIRouter()

# In-memory session store (use Redis/DB in production)
sessions: dict = {}


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    """
    Start a new interview session.
    Requires: mode, persona, and optionally github_url + deployment_url for project mode.
    """
    orchestrator = InterviewOrchestrator()
    session = await orchestrator.start_session(
        mode=request.mode,
        persona=request.persona,
        user_id=request.user_id,
        github_url=request.github_url,
        deployment_url=request.deployment_url,
    )
    sessions[session.session_id] = orchestrator
    return session


@router.post("/{session_id}/answer", response_model=QuestionResponse)
async def submit_answer(session_id: str, request: AnswerRequest):
    """
    Submit an answer and get the next adaptive question.
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    orchestrator = sessions[session_id]
    next_question = await orchestrator.process_answer(request.answer)
    return next_question


@router.post("/{session_id}/video-signals")
async def receive_video_signals(session_id: str, request: VideoSignalsRequest):
    """
    Receive video behavior signals (eye gaze, confidence, attention).
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    orchestrator = sessions[session_id]
    await orchestrator.update_video_signals(request.signals)
    return {"status": "signals received"}


@router.get("/{session_id}/question", response_model=QuestionResponse)
async def get_current_question(session_id: str):
    """
    Get the current question for the session.
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    orchestrator = sessions[session_id]
    return orchestrator.get_current_question()


@router.post("/{session_id}/end", response_model=InterviewEndResponse)
async def end_interview(session_id: str):
    """
    End the interview session and trigger report generation.
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    orchestrator = sessions[session_id]
    result = await orchestrator.end_session()
    del sessions[session_id]
    return result

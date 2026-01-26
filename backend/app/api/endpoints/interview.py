from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from app.services.orchestrator import InterviewOrchestrator
from app.services.interview_agents import get_interview_agent
from app.services.cv_parser import CVParser
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


@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    """
    Upload and parse CV/Resume before starting interview.
    Returns parsed CV data for personalization.
    """
    if not file.filename.lower().endswith(('.pdf', '.doc', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload PDF, DOC, DOCX, or TXT")
    
    try:
        content = await file.read()
        
        # For now, handle text files directly
        if file.filename.lower().endswith('.txt'):
            text = content.decode('utf-8')
        else:
            text = content.decode('utf-8', errors='ignore')
        
        parser = CVParser()
        parsed_cv = await parser.parse_with_ai(text)
        
        # Store in Supabase permanently
        from app.services.supabase_service import SupabaseService
        cv_id = await SupabaseService.store_cv(parsed_cv)
        
        return {
            "cv_id": cv_id,
            "parsed_data": {
                "skills": parsed_cv.get("skills", {}),
                "experience_years": parsed_cv.get("experience_years"),
                "summary": parsed_cv.get("summary", ""),
                "ai_analysis": parsed_cv.get("ai_analysis", {})
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CV: {str(e)}")


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(request: InterviewStartRequest):
    """
    Start a new interview session.
    Requires: mode, persona, user_id, and optionally cv_id for personalization.
    """
    from app.services.supabase_service import SupabaseService
    from app.services.cv_parser import CVParser
    
    # Get the appropriate interview agent based on mode
    agent = get_interview_agent(request.mode)
    
    # Get CV data if available and parse it
    cv_data = None
    if hasattr(request, 'cv_id') and request.cv_id:
        print(f"[INTERVIEW] Fetching CV with ID: {request.cv_id}")
        cv_raw = await SupabaseService.get_cv(request.cv_id)
        
        if cv_raw and cv_raw.get('content'):
            try:
                print(f"[INTERVIEW] CV found, parsing content...")
                parser = CVParser()
                # Parse CV to extract structured data
                cv_data = await parser.parse_with_ai(cv_raw['content'])
                print(f"[INTERVIEW] CV parsed successfully!")
            except Exception as e:
                print(f"[INTERVIEW] Warning: CV parsing failed: {e}. Proceeding without personalization.")
                cv_data = None
        else:
            print(f"[INTERVIEW] CV not found or empty")

    
    orchestrator = InterviewOrchestrator()
    orchestrator.interview_agent = agent
    orchestrator.cv_data = cv_data
    
    session = await orchestrator.start_session(
        mode=request.mode,
        persona=request.persona,
        user_id=request.user_id,
        github_url=getattr(request, 'github_url', None),
        deployment_url=getattr(request, 'deployment_url', None),
    )
    sessions[session.session_id] = orchestrator
    return session


@router.post("/{session_id}/answer", response_model=QuestionResponse)
async def submit_answer(session_id: str, request: AnswerRequest):
    """
    Submit an answer and get the next adaptive question.
    Uses specialized AI agents for question generation.
    """
    if session_id not in sessions:
        print(f"[INTERVIEW] Error: Session {session_id} not found in memory.")
        if session_id == "mock-session":
            return QuestionResponse(
                question="We are in fallback mode. How would you handle a production outage in a microservices environment?",
                focus="reliability",
                difficulty="medium"
            )
        raise HTTPException(status_code=404, detail=f"Session {session_id} not found. The backend may have restarted.")
    
    orchestrator = sessions[session_id]
    
    # Process answer with the specialized agent
    next_question = await orchestrator.process_answer(request.answer)
    return next_question


@router.post("/{session_id}/video-signals")
async def receive_video_signals(session_id: str, request: VideoSignalsRequest):
    """
    Receive video behavior signals (eye gaze, confidence, attention).
    Used for anti-cheat detection and adaptive questioning.
    """
    if session_id not in sessions:
        # Don't spam 404 for video signals if in mock mode
        if session_id == "mock-session":
            return {"status": "mock signals received", "suspicious_detected": [], "attention_level": 1.0}
        raise HTTPException(status_code=404, detail="Session not found")
    
    orchestrator = sessions[session_id]
    await orchestrator.update_video_signals(request.signals)
    
    # Check for suspicious patterns
    suspicious = orchestrator.check_suspicious_behavior()
    
    return {
        "status": "signals received",
        "suspicious_detected": suspicious,
        "attention_level": orchestrator.get_attention_level()
    }


@router.get("/{session_id}/question", response_model=QuestionResponse)
async def get_current_question(session_id: str):
    """
    Get the current question for the session.
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    orchestrator = sessions[session_id]
    return orchestrator.get_current_question()


@router.get("/{session_id}/status")
async def get_session_status(session_id: str):
    """
    Get the current status of the interview session.
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    orchestrator = sessions[session_id]
    return {
        "session_id": session_id,
        "question_count": len(orchestrator.memory.get("qa_history", [])),
        "current_difficulty": orchestrator.pressure_engine.current_level if hasattr(orchestrator, 'pressure_engine') else 0.5,
        "mode": orchestrator.mode,
        "time_elapsed": orchestrator.get_elapsed_time() if hasattr(orchestrator, 'get_elapsed_time') else 0
    }


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


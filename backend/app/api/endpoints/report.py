from fastapi import APIRouter, HTTPException
from app.models.schemas import ReportResponse

router = APIRouter()

# In-memory report store (use DB in production)
reports: dict = {}


@router.get("/{session_id}", response_model=ReportResponse)
async def get_report(session_id: str):
    """
    Get the evaluation report for a completed session.
    """
    if session_id not in reports:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return reports[session_id]


def store_report(session_id: str, report: ReportResponse):
    """Store a generated report."""
    reports[session_id] = report

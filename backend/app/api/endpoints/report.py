from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.schemas import ReportResponse
from app.services.supabase_service import SupabaseService

router = APIRouter()


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    """
    Get the evaluation report from Supabase.
    """
    report = await SupabaseService.get_report_by_id(report_id)
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report


@router.get("/user/{user_id}", response_model=List[ReportResponse])
async def get_user_reports(user_id: str):
    """
    Get all reports for a specific user.
    """
    reports = await SupabaseService.get_user_reports(user_id)
    return reports

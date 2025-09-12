from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Attendance
from schemas import AttendanceResponse
from utils.date_utils import utc_to_recife

router = APIRouter()

@router.get("/admin/attendance/scheduled", response_model=List[AttendanceResponse])
def get_scheduled_attendances(
    start_date: str = Query(None, description="Data inicial (YYYY-MM-DD)"),
    end_date: str = Query(None, description="Data final (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """Retorna todos os atendimentos agendados, podendo filtrar por período"""
    query = db.query(Attendance).filter(Attendance.attendance_type == "appointment")
    if start_date:
        query = query.filter(Attendance.appointment_date >= start_date)
    if end_date:
        query = query.filter(Attendance.appointment_date <= end_date)
    attendances = query.order_by(Attendance.appointment_date.asc()).all()
    return attendances

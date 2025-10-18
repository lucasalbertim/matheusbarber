from fastapi import APIRouter, Depends, Query
from datetime import datetime
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
    # Converter datas para datetime local (Recife)
    from utils.date_utils import utc_to_recife
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.filter(Attendance.appointment_date >= start_dt)
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.filter(Attendance.appointment_date <= end_dt)
    attendances = query.order_by(Attendance.appointment_date.asc()).all()
    # Garantir que só retornem agendamentos dentro do intervalo local
    filtered = []
    for att in attendances:
        recife_date = utc_to_recife(att.appointment_date).date()
        filtro_inicio = utc_to_recife(start_dt).date() if start_date else None
        filtro_fim = utc_to_recife(end_dt).date() if end_date else None
        if filtro_inicio and recife_date < filtro_inicio:
            continue
        if filtro_fim and recife_date > filtro_fim:
            continue
        filtered.append(att)
    return filtered

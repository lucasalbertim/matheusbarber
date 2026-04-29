from datetime import datetime
from flask import Blueprint, jsonify, request

from ..auth import require_admin
from ..database import get_db
from ..models import Attendance
from ..schemas import AttendanceResponse
from ..utils.date_utils import utc_to_recife, parse_recife_datetime
from .utils import serialize_list

scheduled_bp = Blueprint("scheduled", __name__)


@scheduled_bp.get("/attendance/scheduled")
def get_public_scheduled_attendances():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    with get_db() as db:
        query = db.query(Attendance).filter(
            Attendance.attendance_type == "appointment",
            Attendance.status.in_(["waiting", "progress"]),
        )

        if start_date:
            start_dt = parse_recife_datetime(start_date)
            query = query.filter(Attendance.appointment_date >= start_dt)
        if end_date:
            end_dt = parse_recife_datetime(end_date)
            query = query.filter(Attendance.appointment_date <= end_dt)

        attendances = query.order_by(Attendance.appointment_date.asc()).all()
        return jsonify(
            [
                {"appointment_date": att.appointment_date.isoformat(), "status": att.status}
                for att in attendances
            ]
        )


@scheduled_bp.get("/admin/attendance/scheduled")
@require_admin
def get_scheduled_attendances():
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    with get_db() as db:
        query = db.query(Attendance).filter(Attendance.attendance_type == "appointment")

        if start_date:
            start_dt = parse_recife_datetime(start_date)
            query = query.filter(Attendance.appointment_date >= start_dt)
        if end_date:
            end_dt = parse_recife_datetime(end_date)
            query = query.filter(Attendance.appointment_date <= end_dt)

        attendances = query.order_by(Attendance.appointment_date.asc()).all()

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

        return jsonify(serialize_list(AttendanceResponse, filtered))

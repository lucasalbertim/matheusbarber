from datetime import datetime
from flask import Blueprint, jsonify, request

from ..auth import require_admin
from ..database import get_db
from ..schemas import AttendanceCreate, AttendanceUpdate, AttendanceCancel, AttendanceResponse
from ..services.attendance_service import attendance_service
from .utils import parse_body, serialize, serialize_list

attendance_bp = Blueprint("attendance", __name__)


@attendance_bp.post("/attendance/")
def create_attendance():
    attendance_data = parse_body(AttendanceCreate)
    with get_db() as db:
        result = attendance_service.create_attendance(db, attendance_data)
        attendance = serialize(AttendanceResponse, result["attendance"])
        return jsonify({"attendance": attendance, "queue_position": result["queue_position"]})


@attendance_bp.get("/attendance/today")
def get_today_attendance():
    attendance_type = request.args.get("attendance_type", "all")
    with get_db() as db:
        attendances = attendance_service.get_today_attendance(db, attendance_type)
        return jsonify(serialize_list(AttendanceResponse, attendances))


@attendance_bp.put("/attendance/<int:attendance_id>")
@require_admin
def update_attendance(attendance_id: int):
    attendance_update = parse_body(AttendanceUpdate)
    with get_db() as db:
        attendance = attendance_service.update_attendance(db, attendance_id, attendance_update)
        return jsonify(serialize(AttendanceResponse, attendance))


@attendance_bp.delete("/attendance/<int:attendance_id>")
@require_admin
def delete_attendance(attendance_id: int):
    with get_db() as db:
        attendance_service.delete_attendance(db, attendance_id)
        return jsonify({"message": "Atendimento excluído com sucesso"})


@attendance_bp.put("/admin/attendance/<int:attendance_id>/cancel")
@require_admin
def cancel_attendance_admin(attendance_id: int):
    cancellation = parse_body(AttendanceCancel)
    with get_db() as db:
        attendance = attendance_service.cancel_attendance_admin(db, attendance_id, cancellation.cancellation_reason)
        return jsonify(serialize(AttendanceResponse, attendance))


@attendance_bp.put("/attendance/<int:attendance_id>/cancel")
def cancel_attendance_client(attendance_id: int):
    cancellation = parse_body(AttendanceCancel)
    with get_db() as db:
        attendance = attendance_service.cancel_attendance_client(db, attendance_id, cancellation.cancellation_reason)
        return jsonify(serialize(AttendanceResponse, attendance))


@attendance_bp.post("/attendance/validate-appointment")
def validate_appointment_schedule():
    appointment_date = request.get_json(silent=True) or {}
    date_value = appointment_date.get("appointment_date") or appointment_date.get("date")
    if not date_value:
        date_value = request.args.get("appointment_date") or request.args.get("date")
    if not date_value and isinstance(appointment_date, str):
        date_value = appointment_date
    try:
        appointment_datetime = datetime.fromisoformat(str(date_value).replace("Z", "+00:00"))
    except Exception:
        return jsonify({"detail": "Formato de data inválido"}), 400

    with get_db() as db:
        result = attendance_service.validate_appointment_schedule(db, appointment_datetime)
        return jsonify(result)

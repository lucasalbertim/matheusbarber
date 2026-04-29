from flask import Blueprint, jsonify

from ..auth import require_admin
from ..database import get_db
from ..schemas import AttendanceModeConfigUpdate
from ..services.config_service import ConfigService
from ..errors import ApiError
from .utils import parse_body

config_bp = Blueprint("config", __name__)


@config_bp.get("/admin/config/attendance-mode")
@require_admin
def get_attendance_mode_config():
    with get_db() as db:
        config = ConfigService.get_attendance_mode_config(db)
        return jsonify(_normalize_config(config))


@config_bp.put("/admin/config/attendance-mode")
@require_admin
def update_attendance_mode_config():
    config_update = parse_body(AttendanceModeConfigUpdate)
    config_data = {k: v for k, v in config_update.dict().items() if v is not None}
    if "appointment_scheduled_month_days" in config_data:
        invalid_days = [d for d in config_data["appointment_scheduled_month_days"] if d < 1 or d > 31]
        if invalid_days:
            raise ApiError("Os dias do mês para agendamento devem estar entre 1 e 31", 400)
    with get_db() as db:
        updated_config = ConfigService.update_attendance_mode_config(db, config_data)
        return jsonify(_normalize_config(updated_config))


@config_bp.get("/config/attendance-mode")
def get_public_attendance_mode_config():
    with get_db() as db:
        config = ConfigService.get_attendance_mode_config(db)
        normalized = _normalize_config(config)
        return jsonify(
            {
                "presential_mode_enabled": normalized["presential_mode_enabled"],
                "appointment_mode_enabled": normalized["appointment_mode_enabled"],
                "appointment_working_hours": normalized["appointment_working_hours"],
                "appointment_interval_minutes": normalized["appointment_interval_minutes"],
                "appointment_break_hours": normalized["appointment_break_hours"],
                "appointment_scheduled_days": normalized["appointment_scheduled_days"],
                "appointment_scheduled_month_days": normalized["appointment_scheduled_month_days"],
                "appointment_always_scheduled": normalized["appointment_always_scheduled"],
            }
        )


def _normalize_config(config: dict) -> dict:
    if isinstance(config.get("appointment_scheduled_days"), str):
        values = [x for x in config["appointment_scheduled_days"].split(",") if x]
        config["appointment_scheduled_days"] = [int(x) for x in values]
    if isinstance(config.get("appointment_scheduled_month_days"), str):
        values = [x for x in config["appointment_scheduled_month_days"].split(",") if x]
        config["appointment_scheduled_month_days"] = [int(x) for x in values]
    if isinstance(config.get("appointment_interval_minutes"), str):
        config["appointment_interval_minutes"] = int(config["appointment_interval_minutes"])
    return config

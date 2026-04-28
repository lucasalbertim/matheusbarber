from flask import Blueprint, jsonify, request

from ..auth import require_admin
from ..database import get_db
from ..services.attendance_service import attendance_service

reports_bp = Blueprint("reports", __name__)


@reports_bp.get("/admin/reports/summary")
@require_admin
def get_reports_summary():
    with get_db() as db:
        return jsonify(attendance_service.get_reports_summary(db))


@reports_bp.get("/admin/reports/summary-by-period")
@require_admin
def get_reports_summary_by_period():
    period = request.args.get("period")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    with get_db() as db:
        return jsonify(attendance_service.get_reports_summary_by_period(db, period, start_date, end_date))


@reports_bp.get("/admin/reports/top-clients")
@require_admin
def get_top_clients():
    with get_db() as db:
        return jsonify(attendance_service.get_top_clients(db))


@reports_bp.get("/admin/reports/recent-activities")
@require_admin
def get_recent_activities():
    limit = int(request.args.get("limit", 10))
    with get_db() as db:
        return jsonify(attendance_service.get_recent_activities(db, limit))


@reports_bp.get("/admin/reports/revenue-chart")
@require_admin
def get_revenue_chart():
    period = request.args.get("period")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    with get_db() as db:
        return jsonify(attendance_service.get_revenue_by_period(db, period, start_date, end_date))


@reports_bp.get("/admin/reports/export")
@require_admin
def export_reports():
    with get_db() as db:
        return jsonify(attendance_service.export_reports(db))

from datetime import datetime, date
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from ..errors import ApiError
from ..models import Attendance, Client, Service
from ..schemas import AttendanceCreate, AttendanceUpdate
from ..utils.date_utils import (
    get_recife_datetime,
    get_recife_date,
    utc_to_recife,
    parse_recife_datetime,
)
from .config_service import ConfigService


class AttendanceService:
    def create_attendance(self, db: Session, attendance: AttendanceCreate) -> Dict[str, Any]:
        client = db.query(Client).filter(Client.id == attendance.client_id).first()
        if not client:
            raise ApiError("Cliente não encontrado", 404)

        if not client.is_active:
            client.is_active = True
            client.updated_at = get_recife_datetime()
            db.commit()
            db.refresh(client)

        services = db.query(Service).filter(
            Service.id.in_(attendance.service_ids), Service.is_active == True
        ).all()
        if not services or len(services) != len(attendance.service_ids):
            raise ApiError("Um ou mais serviços inválidos/inativos", 400)

        payload = attendance.dict()
        payload.pop("service_ids", None)

        appointment_date = payload["appointment_date"]
        try:
            attendance_date = parse_recife_datetime(appointment_date)
        except ValueError:
            raise ApiError("Formato de data de agendamento inválido.", 400)

        payload["appointment_date"] = attendance_date
        now = get_recife_datetime()

        if payload.get("attendance_type") is None:
            if abs((attendance_date - now).total_seconds()) < 3600:
                payload["attendance_type"] = "presential"
            else:
                payload["attendance_type"] = "appointment"

        config = ConfigService.get_attendance_mode_config(db)
        if payload["attendance_type"] == "presential" and not config.get("presential_mode_enabled", False):
            raise ApiError("Modo de atendimento presencial está desabilitado", 400)
        if payload["attendance_type"] == "appointment" and not config.get("appointment_mode_enabled", False):
            raise ApiError("Modo de agendamento está desabilitado", 400)

        if payload["attendance_type"] == "appointment":
            self.validate_appointment_schedule(db, attendance_date)

        db_attendance = Attendance(**payload)
        db_attendance.services = services
        db_attendance.status = "waiting"
        db_attendance.payment_status = "pending"
        db_attendance.updated_at = get_recife_datetime()

        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)

        if payload["attendance_type"] == "presential":
            queue_position = (
                db.query(Attendance)
                .filter(
                    and_(
                        Attendance.status == "waiting",
                        Attendance.attendance_type == "presential",
                        Attendance.appointment_date < db_attendance.appointment_date,
                    )
                )
                .count()
                + 1
            )
        else:
            queue_position = (
                db.query(Attendance)
                .filter(
                    and_(
                        Attendance.status == "waiting",
                        Attendance.attendance_type == "appointment",
                        Attendance.appointment_date < db_attendance.appointment_date,
                    )
                )
                .count()
                + 1
            )

        db_attendance.queue_position = queue_position
        db.commit()
        db.refresh(db_attendance)

        return {"attendance": db_attendance, "queue_position": queue_position}

    def get_attendance(self, db: Session, attendance_id: int) -> Attendance:
        attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
        if not attendance:
            raise ApiError("Atendimento não encontrado", 404)
        return attendance

    def get_today_attendance(self, db: Session, attendance_type: str = "all") -> List[Attendance]:
        today = get_recife_date()
        all_attendances = db.query(Attendance).all()
        attendances_today = []
        for att in all_attendances:
            recife_date = utc_to_recife(att.appointment_date).date()
            if recife_date == today:
                attendances_today.append(att)

        if attendance_type == "presential":
            attendances_today = [a for a in attendances_today if a.attendance_type == "presential"]
        elif attendance_type == "appointment":
            attendances_today = [a for a in attendances_today if a.attendance_type == "appointment"]

        attendances_today.sort(key=lambda a: a.appointment_date, reverse=True)
        return attendances_today

    def update_attendance(self, db: Session, attendance_id: int, attendance_update: AttendanceUpdate) -> Attendance:
        db_attendance = self.get_attendance(db, attendance_id)
        update_data = attendance_update.dict(exclude_unset=True)

        new_status = update_data.get("status")
        if new_status:
            db_attendance.status = new_status
            if new_status == "finished":
                db_attendance.payment_status = "paid"

        if "payment_method" in update_data and update_data["payment_method"] is not None:
            db_attendance.payment_method = update_data["payment_method"]
        if "payment_status" in update_data and update_data["payment_status"] is not None:
            db_attendance.payment_status = update_data["payment_status"]
        if "notes" in update_data:
            db_attendance.notes = update_data["notes"]

        db_attendance.updated_at = get_recife_datetime()
        db.commit()
        db.refresh(db_attendance)
        return db_attendance

    def delete_attendance(self, db: Session, attendance_id: int):
        db_attendance = self.get_attendance(db, attendance_id)
        db.delete(db_attendance)
        db.commit()

    def validate_appointment_schedule(self, db: Session, appointment_date: datetime) -> Dict[str, Any]:
        config = ConfigService.get_attendance_mode_config(db)
        if not config.get("appointment_mode_enabled", False):
            raise ApiError("Modo de agendamento está desabilitado", 400)

        py_weekday = appointment_date.weekday()
        js_weekday = (py_weekday + 1) % 7
        scheduled_days = config.get("appointment_scheduled_days", [])

        if not config.get("appointment_always_scheduled", False) and js_weekday not in scheduled_days:
            weekday_names = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
            raise ApiError(f"Agendamentos não são permitidos aos {weekday_names[js_weekday]}s", 400)

        working_hours = config.get("appointment_working_hours", "08:00-18:00")
        start_time, end_time = working_hours.split("-")

        appointment_time = appointment_date.time()
        start_hour, start_minute = map(int, start_time.split(":"))
        end_hour, end_minute = map(int, end_time.split(":"))

        start_datetime = appointment_date.replace(hour=start_hour, minute=start_minute, second=0, microsecond=0)
        end_datetime = appointment_date.replace(hour=end_hour, minute=end_minute, second=0, microsecond=0)

        if appointment_time < start_datetime.time() or appointment_time >= end_datetime.time():
            raise ApiError(f"Agendamentos só são permitidos entre {start_time} e {end_time}", 400)

        break_hours = config.get("appointment_break_hours", "12:00-13:00")
        break_start, break_end = break_hours.split("-")

        break_start_hour, break_start_minute = map(int, break_start.split(":"))
        break_end_hour, break_end_minute = map(int, break_end.split(":"))

        break_start_datetime = appointment_date.replace(
            hour=break_start_hour, minute=break_start_minute, second=0, microsecond=0
        )
        break_end_datetime = appointment_date.replace(
            hour=break_end_hour, minute=break_end_minute, second=0, microsecond=0
        )

        if break_start_datetime.time() <= appointment_time < break_end_datetime.time():
            raise ApiError(
                f"Agendamentos não são permitidos durante o horário de descanso ({break_hours})", 400
            )

        return {"valid": True, "message": "Agendamento válido"}

    def get_reports_summary(self, db: Session) -> Dict[str, Any]:
        today = get_recife_date()

        total_clients = db.query(func.count(Client.id)).filter(Client.is_active == True).scalar()
        total_attendances = db.query(func.count(Attendance.id)).filter(
            Attendance.status == "finished"
        ).scalar()

        total_revenue = (
            db.query(func.sum(Service.price))
            .select_from(Attendance)
            .join(Attendance.services)
            .filter(and_(Attendance.payment_status == "paid", Attendance.status == "finished"))
            .scalar()
            or 0.0
        )

        inactive_clients = db.query(func.count(Client.id)).filter(Client.is_active == False).scalar()
        today_attendances = db.query(func.count(Attendance.id)).filter(
            and_(func.date(Attendance.appointment_date) == today, Attendance.status == "finished")
        ).scalar()

        pending_payments = db.query(func.count(Attendance.id)).filter(
            and_(Attendance.payment_status == "pending", Attendance.status != "cancelled")
        ).scalar()

        average_ticket = total_revenue / total_attendances if total_attendances > 0 else 0.0
        growth_percentages = self._get_dashboard_growth_percentages(db)

        return {
            "totalClients": total_clients,
            "totalAttendances": total_attendances,
            "totalRevenue": float(total_revenue),
            "averageTicket": float(average_ticket),
            "inactiveClients": inactive_clients,
            "todayAttendances": today_attendances,
            "pendingPayments": pending_payments,
            "growthPercentages": growth_percentages,
        }

    def get_attendance_by_status(self, db: Session, status: str) -> List[Attendance]:
        return db.query(Attendance).filter(Attendance.status == status).all()

    def get_attendance_by_date_range(self, db: Session, start_date: date, end_date: date) -> List[Attendance]:
        return db.query(Attendance).filter(
            and_(func.date(Attendance.appointment_date) >= start_date, func.date(Attendance.appointment_date) <= end_date)
        ).all()

    def get_client_attendances(self, db: Session, client_id: int) -> List[Attendance]:
        return (
            db.query(Attendance)
            .filter(Attendance.client_id == client_id)
            .order_by(Attendance.appointment_date.desc())
            .all()
        )

    def get_top_clients(self, db: Session) -> List[Dict[str, Any]]:
        from sqlalchemy import desc

        result = (
            db.query(
                Client.id,
                Client.name,
                Client.phone,
                func.count(Attendance.id).label("attendance_count"),
                func.sum(Service.price).label("total_spent"),
                func.max(Attendance.appointment_date).label("last_visit"),
            )
            .join(Attendance, Client.id == Attendance.client_id)
            .join(Attendance.services)
            .filter(and_(Attendance.payment_status == "paid", Attendance.status == "finished"))
            .group_by(Client.id, Client.name, Client.phone)
            .order_by(desc("attendance_count"))
            .limit(10)
            .all()
        )

        return [
            {
                "id": row.id,
                "name": row.name,
                "phone": row.phone,
                "totalVisits": row.attendance_count,
                "totalRevenue": float(row.total_spent) if row.total_spent else 0.0,
                "lastVisit": row.last_visit.isoformat() if row.last_visit else None,
                "status": "active",
            }
            for row in result
        ]

    def get_recent_activities(self, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        from sqlalchemy import desc

        recent_attendances = (
            db.query(
                Attendance.id,
                Attendance.status,
                Attendance.payment_status,
                Attendance.appointment_date,
                Attendance.updated_at,
                Client.name.label("client_name"),
                func.string_agg(Service.name, ", ").label("services"),
            )
            .join(Client, Attendance.client_id == Client.id)
            .join(Attendance.services)
            .group_by(
                Attendance.id,
                Attendance.status,
                Attendance.payment_status,
                Attendance.appointment_date,
                Attendance.updated_at,
                Client.name,
            )
            .order_by(desc(Attendance.updated_at))
            .limit(limit)
            .all()
        )

        activities = []
        for attendance in recent_attendances:
            if attendance.status == "waiting":
                activity_type = "new_attendance"
                title = f"Novo atendimento - {attendance.client_name}"
                description = f"Serviços: {attendance.services}"
            elif attendance.status == "progress":
                activity_type = "attendance_started"
                title = f"Atendimento iniciado - {attendance.client_name}"
                description = f"Serviços: {attendance.services}"
            elif attendance.status == "finished":
                if attendance.payment_status == "paid":
                    activity_type = "attendance_completed"
                    title = f"Atendimento concluído - {attendance.client_name}"
                    description = f"Serviços: {attendance.services}"
                else:
                    activity_type = "attendance_finished"
                    title = f"Atendimento finalizado - {attendance.client_name}"
                    description = f"Serviços: {attendance.services}"
            else:
                activity_type = "attendance_updated"
                title = f"Atendimento atualizado - {attendance.client_name}"
                description = f"Status: {attendance.status}"

            activities.append(
                {
                    "id": attendance.id,
                    "type": activity_type,
                    "title": title,
                    "description": description,
                    "timestamp": attendance.updated_at.isoformat(),
                    "client_name": attendance.client_name,
                    "services": attendance.services,
                    "status": attendance.status,
                    "payment_status": attendance.payment_status,
                }
            )

        return activities

    def get_reports_summary_by_period(self, db: Session, period: str, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        from datetime import timedelta

        if start_date and end_date:
            current_start = datetime.strptime(start_date, "%Y-%m-%d").date()
            current_end = datetime.strptime(end_date, "%Y-%m-%d").date()
        else:
            today = date.today()
            if period == "day":
                current_start = current_end = today
            elif period == "week":
                current_start = today - timedelta(days=today.weekday())
                current_end = current_start + timedelta(days=6)
            elif period == "month":
                current_start = today.replace(day=1)
                if today.month == 12:
                    current_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    current_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)
            elif period == "quarter":
                quarter_start_month = ((today.month - 1) // 3) * 3 + 1
                current_start = today.replace(month=quarter_start_month, day=1)
                if quarter_start_month == 10:
                    current_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    current_end = today.replace(month=quarter_start_month + 3, day=1) - timedelta(days=1)
            elif period == "year":
                current_start = today.replace(month=1, day=1)
                current_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                current_start = current_end = today

        days_diff = (current_end - current_start).days + 1
        previous_start = current_start - timedelta(days=days_diff)
        previous_end = current_start - timedelta(days=1)

        current_metrics = self._get_metrics_for_period(db, current_start, current_end)
        previous_metrics = self._get_metrics_for_period(db, previous_start, previous_end)
        growth_percentages = self._calculate_growth_percentages(current_metrics, previous_metrics)

        return {
            **current_metrics,
            "growthPercentages": growth_percentages,
            "period": {
                "current": {"start": current_start.isoformat(), "end": current_end.isoformat()},
                "previous": {"start": previous_start.isoformat(), "end": previous_end.isoformat()},
            },
        }

    def _get_metrics_for_period(self, db: Session, start_date: date, end_date: date) -> Dict[str, Any]:
        total_clients = db.query(func.count(Client.id)).filter(Client.is_active == True).scalar()

        clients_in_period = db.query(func.count(func.distinct(Attendance.client_id))).filter(
            and_(
                func.date(Attendance.appointment_date) >= start_date,
                func.date(Attendance.appointment_date) <= end_date,
                Attendance.status == "finished",
            )
        ).scalar()

        attendances_in_period = db.query(func.count(Attendance.id)).filter(
            and_(
                func.date(Attendance.appointment_date) >= start_date,
                func.date(Attendance.appointment_date) <= end_date,
                Attendance.status == "finished",
            )
        ).scalar()

        revenue_in_period = (
            db.query(func.sum(Service.price))
            .select_from(Attendance)
            .join(Attendance.services)
            .filter(
                and_(
                    Attendance.payment_status == "paid",
                    Attendance.status == "finished",
                    func.date(Attendance.appointment_date) >= start_date,
                    func.date(Attendance.appointment_date) <= end_date,
                )
            )
            .scalar()
            or 0.0
        )

        average_ticket = revenue_in_period / attendances_in_period if attendances_in_period > 0 else 0.0

        return {
            "totalClients": total_clients,
            "activeClientsInPeriod": clients_in_period,
            "totalAttendances": attendances_in_period,
            "totalRevenue": float(revenue_in_period),
            "averageTicket": float(average_ticket),
        }

    def _calculate_growth_percentages(self, current: Dict[str, Any], previous: Dict[str, Any]) -> Dict[str, float]:
        def calculate_percentage(current_val, previous_val):
            if previous_val == 0:
                return 100.0 if current_val > 0 else 0.0
            return ((current_val - previous_val) / previous_val) * 100

        return {
            "revenueGrowth": calculate_percentage(current["totalRevenue"], previous["totalRevenue"]),
            "clientsGrowth": calculate_percentage(current["activeClientsInPeriod"], previous["activeClientsInPeriod"]),
            "attendancesGrowth": calculate_percentage(current["totalAttendances"], previous["totalAttendances"]),
            "averageTicketGrowth": calculate_percentage(current["averageTicket"], previous["averageTicket"]),
        }

    def _get_dashboard_growth_percentages(self, db: Session) -> Dict[str, float]:
        from datetime import timedelta

        today = date.today()
        current_month_start = today.replace(day=1)
        if today.month == 12:
            current_month_end = today.replace(year=today.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            current_month_end = today.replace(month=today.month + 1, day=1) - timedelta(days=1)

        if today.month == 1:
            previous_month_start = today.replace(year=today.year - 1, month=12, day=1)
            previous_month_end = today.replace(day=1) - timedelta(days=1)
        else:
            previous_month_start = today.replace(month=today.month - 1, day=1)
            previous_month_end = today.replace(day=1) - timedelta(days=1)

        current_metrics = self._get_metrics_for_period(db, current_month_start, current_month_end)
        previous_metrics = self._get_metrics_for_period(db, previous_month_start, previous_month_end)
        return self._calculate_growth_percentages(current_metrics, previous_metrics)

    def get_revenue_by_period(self, db: Session, period: str, start_date: str = None, end_date: str = None) -> List[Dict[str, Any]]:
        from datetime import timedelta

        if start_date and end_date:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
        else:
            today = date.today()
            if period == "day":
                start = today - timedelta(days=30)
                end = today
            elif period == "week":
                start = today - timedelta(days=12 * 7)
                end = today
            elif period == "month":
                start = today - timedelta(days=365)
                end = today
            elif period == "quarter":
                start = today - timedelta(days=4 * 90)
                end = today
            elif period == "year":
                start = today.replace(month=1, day=1) - timedelta(days=365 * 3)
                end = today
            else:
                start = today - timedelta(days=30)
                end = today

        data_points = []
        current = start
        while current <= end:
            if period == "day":
                day_start = current
                revenue = (
                    db.query(func.sum(Service.price))
                    .select_from(Attendance)
                    .join(Attendance.services)
                    .filter(
                        and_(
                            Attendance.payment_status == "paid",
                            Attendance.status == "finished",
                            func.date(Attendance.appointment_date) == day_start,
                        )
                    )
                    .scalar()
                    or 0.0
                )
                data_points.append(
                    {"date": day_start.isoformat(), "revenue": float(revenue), "label": current.strftime("%d/%m")}
                )
                current += timedelta(days=1)
            elif period == "week":
                week_start = current
                week_end = current + timedelta(days=6)
                revenue = (
                    db.query(func.sum(Service.price))
                    .select_from(Attendance)
                    .join(Attendance.services)
                    .filter(
                        and_(
                            Attendance.payment_status == "paid",
                            Attendance.status == "finished",
                            func.date(Attendance.appointment_date) >= week_start,
                            func.date(Attendance.appointment_date) <= week_end,
                        )
                    )
                    .scalar()
                    or 0.0
                )
                data_points.append(
                    {"date": week_start.isoformat(), "revenue": float(revenue), "label": f"Sem {current.strftime('%U')}"}
                )
                current += timedelta(days=7)
            elif period == "month":
                month_start = current.replace(day=1)
                if current.month == 12:
                    month_end = current.replace(year=current.year + 1, month=1, day=1) - timedelta(days=1)
                else:
                    month_end = current.replace(month=current.month + 1, day=1) - timedelta(days=1)

                revenue = (
                    db.query(func.sum(Service.price))
                    .select_from(Attendance)
                    .join(Attendance.services)
                    .filter(
                        and_(
                            Attendance.payment_status == "paid",
                            Attendance.status == "finished",
                            func.date(Attendance.appointment_date) >= month_start,
                            func.date(Attendance.appointment_date) <= month_end,
                        )
                    )
                    .scalar()
                    or 0.0
                )
                data_points.append(
                    {"date": month_start.isoformat(), "revenue": float(revenue), "label": current.strftime("%b/%Y")}
                )
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1, day=1)
                else:
                    current = current.replace(month=current.month + 1, day=1)
            elif period == "quarter":
                quarter = (current.month - 1) // 3
                quarter_start_month = quarter * 3 + 1
                quarter_end_month = quarter_start_month + 2

                quarter_start = current.replace(month=quarter_start_month, day=1)
                if quarter_end_month == 12:
                    quarter_end = current.replace(month=12, day=31)
                else:
                    quarter_end = current.replace(month=quarter_end_month + 1, day=1) - timedelta(days=1)

                revenue = (
                    db.query(func.sum(Service.price))
                    .select_from(Attendance)
                    .join(Attendance.services)
                    .filter(
                        and_(
                            Attendance.payment_status == "paid",
                            Attendance.status == "finished",
                            func.date(Attendance.appointment_date) >= quarter_start,
                            func.date(Attendance.appointment_date) <= quarter_end,
                        )
                    )
                    .scalar()
                    or 0.0
                )
                data_points.append(
                    {"date": quarter_start.isoformat(), "revenue": float(revenue), "label": f"T{quarter + 1}/{current.year}"}
                )
                if quarter_end_month == 12:
                    current = current.replace(year=current.year + 1, month=1, day=1)
                else:
                    current = current.replace(month=quarter_end_month + 1, day=1)
            elif period == "year":
                year_start = current.replace(month=1, day=1)
                year_end = current.replace(month=12, day=31)
                revenue = (
                    db.query(func.sum(Service.price))
                    .select_from(Attendance)
                    .join(Attendance.services)
                    .filter(
                        and_(
                            Attendance.payment_status == "paid",
                            Attendance.status == "finished",
                            func.date(Attendance.appointment_date) >= year_start,
                            func.date(Attendance.appointment_date) <= year_end,
                        )
                    )
                    .scalar()
                    or 0.0
                )
                data_points.append(
                    {"date": year_start.isoformat(), "revenue": float(revenue), "label": str(current.year)}
                )
                current = current.replace(year=current.year + 1, month=1, day=1)

        return data_points

    def export_reports(self, db: Session) -> Dict[str, Any]:
        summary = self.get_reports_summary(db)
        top_clients = self.get_top_clients(db)
        return {
            "summary": summary,
            "top_clients": top_clients,
            "export_date": datetime.utcnow().isoformat(),
            "message": "Exportação simulada - implementar geração de arquivo Excel",
        }

    def cancel_attendance_admin(self, db: Session, attendance_id: int, cancellation_reason: str) -> Attendance:
        db_attendance = self.get_attendance(db, attendance_id)
        if db_attendance.status == "finished":
            raise ApiError("Não é possível cancelar um atendimento finalizado", 400)

        db_attendance.status = "cancelled"
        db_attendance.cancellation_reason = cancellation_reason
        db_attendance.cancelled_by = "admin"
        db_attendance.cancelled_at = get_recife_datetime()
        db_attendance.updated_at = get_recife_datetime()

        db.commit()
        db.refresh(db_attendance)
        return db_attendance

    def cancel_attendance_client(self, db: Session, attendance_id: int, cancellation_reason: str) -> Attendance:
        db_attendance = self.get_attendance(db, attendance_id)
        if db_attendance.status != "waiting":
            raise ApiError("Cliente só pode cancelar atendimentos que ainda não foram iniciados", 400)

        db_attendance.status = "cancelled"
        db_attendance.cancellation_reason = cancellation_reason
        db_attendance.cancelled_by = "client"
        db_attendance.cancelled_at = get_recife_datetime()
        db_attendance.updated_at = get_recife_datetime()

        db.commit()
        db.refresh(db_attendance)
        return db_attendance


attendance_service = AttendanceService()

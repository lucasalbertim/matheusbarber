from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from fastapi import HTTPException, status
from datetime import datetime, date
from typing import List, Dict, Any

from models import Attendance, Client, Service
from schemas import AttendanceCreate, AttendanceUpdate

class AttendanceService:
    def create_attendance(self, db: Session, attendance: AttendanceCreate) -> Attendance:
        # Verificar se cliente existe
        client = db.query(Client).filter(Client.id == attendance.client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado"
            )
        
        # Buscar e validar serviços
        services = db.query(Service).filter(Service.id.in_(attendance.service_ids), Service.is_active == True).all()
        if not services or len(services) != len(attendance.service_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Um ou mais serviços inválidos/inativos"
            )
        
        payload = attendance.dict()
        payload.pop('service_ids', None)
        db_attendance = Attendance(**payload)
        db_attendance.services = services
        db.add(db_attendance)
        db.commit()
        db.refresh(db_attendance)
        
        return db_attendance
    
    def get_attendance(self, db: Session, attendance_id: int) -> Attendance:
        attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
        if not attendance:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Atendimento não encontrado"
            )
        return attendance
    
    def get_today_attendance(self, db: Session) -> List[Attendance]:
        today = date.today()
        return db.query(Attendance).filter(
            and_(
                func.date(Attendance.appointment_date) == today,
                Attendance.status.in_(["waiting", "progress"])
            )
        ).order_by(Attendance.appointment_date).all()
    
    def update_attendance(self, db: Session, attendance_id: int, attendance_update: AttendanceUpdate) -> Attendance:
        db_attendance = self.get_attendance(db, attendance_id)
        
        for field, value in attendance_update.dict(exclude_unset=True).items():
            setattr(db_attendance, field, value)
        
        db_attendance.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_attendance)
        
        return db_attendance
    
    def delete_attendance(self, db: Session, attendance_id: int):
        db_attendance = self.get_attendance(db, attendance_id)
        db.delete(db_attendance)
        db.commit()
    
    def get_reports_summary(self, db: Session) -> Dict[str, Any]:
        """Obter resumo de relatórios para dashboard administrativo"""
        today = date.today()
        
        # Total de clientes
        total_clients = db.query(func.count(Client.id)).filter(Client.is_active == True).scalar()
        
        # Total de atendimentos
        total_attendances = db.query(func.count(Attendance.id)).scalar()
        
        # Receita total (soma de serviços dos atendimentos pagos)
        total_revenue = db.query(func.sum(Service.price)).select_from(Attendance).join(Attendance.services).filter(
            Attendance.payment_status == "paid"
        ).scalar() or 0.0
        
        # Clientes inativos (últimos 30 dias)
        from datetime import timedelta
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        inactive_clients = db.query(func.count(Client.id)).filter(
            and_(
                Client.is_active == True,
                Client.updated_at < cutoff_date
            )
        ).scalar()
        
        # Atendimentos de hoje
        today_attendances = db.query(func.count(Attendance.id)).filter(
            func.date(Attendance.appointment_date) == today
        ).scalar()
        
        # Pagamentos pendentes
        pending_payments = db.query(func.count(Attendance.id)).filter(
            Attendance.payment_status == "pending"
        ).scalar()
        
        return {
            "total_clients": total_clients,
            "total_attendances": total_attendances,
            "total_revenue": total_revenue,
            "inactive_clients": inactive_clients,
            "today_attendances": today_attendances,
            "pending_payments": pending_payments
        }
    
    def get_attendance_by_status(self, db: Session, status: str) -> List[Attendance]:
        """Buscar atendimentos por status"""
        return db.query(Attendance).filter(Attendance.status == status).all()
    
    def get_attendance_by_date_range(self, db: Session, start_date: date, end_date: date) -> List[Attendance]:
        """Buscar atendimentos por período"""
        return db.query(Attendance).filter(
            and_(
                func.date(Attendance.appointment_date) >= start_date,
                func.date(Attendance.appointment_date) <= end_date
            )
        ).all()

attendance_service = AttendanceService()
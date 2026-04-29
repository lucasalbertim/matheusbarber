from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from ..errors import ApiError
from ..models import Client, Attendance
from ..schemas import ClientCreate, ClientLogin
from .whatsapp_service import whatsapp_service


def _only_digits(value: str) -> str:
    return "".join(ch for ch in (value or "") if ch.isdigit())


def _normalize_email(value: Optional[str]) -> Optional[str]:
    return (value or "").strip().lower() or None


class ClientService:
    def create_client(self, db: Session, client: ClientCreate) -> Client:
        phone_digits = _only_digits(client.phone)
        email_norm = _normalize_email(client.email)

        if len(phone_digits) not in (10, 11):
            raise ApiError("Telefone inválido", 400)

        if db.query(Client).filter(Client.phone == phone_digits).first():
            raise ApiError("Telefone já cadastrado", 400)

        payload = client.dict()
        payload["phone"] = phone_digits
        payload["email"] = email_norm
        payload["name"] = payload["name"].strip()

        db_client = Client(**payload)
        db.add(db_client)
        db.commit()
        db.refresh(db_client)

        try:
            welcome_message = (
                f"Seja bem-vindo, {db_client.name}! Você foi cadastrado com sucesso na Matheus Barber."
            )
            whatsapp_service.send_message(db_client.phone, welcome_message)
        except Exception:
            pass

        return db_client

    def login_client(self, db: Session, login_data: ClientLogin) -> Client:
        identifier = _only_digits(login_data.identifier)
        client = db.query(Client).filter(
            and_(Client.is_active == True, Client.phone == identifier)
        ).first()

        if not client:
            raise ApiError("Cliente não encontrado", 404)

        is_returning = (
            db.query(Client)
            .filter(and_(Client.id == client.id, Client.attendances.any()))
            .first()
            is not None
        )

        try:
            message = f"Bem-vindo de volta, {client.name}!" if is_returning else f"Seja bem-vindo, {client.name}!"
            whatsapp_service.send_message(client.phone, message)
        except Exception:
            pass

        return client

    def get_client(self, db: Session, client_id: int) -> Client:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise ApiError("Cliente não encontrado", 404)
        return client

    def get_clients(self, db: Session, skip: int = 0, limit: int = 100) -> List[Client]:
        return db.query(Client).offset(skip).limit(limit).all()

    def update_client(self, db: Session, client_id: int, client_update: ClientCreate) -> Client:
        db_client = self.get_client(db, client_id)

        phone_digits = _only_digits(client_update.phone)
        email_norm = _normalize_email(client_update.email)

        if len(phone_digits) not in (10, 11):
            raise ApiError("Telefone inválido", 400)

        if phone_digits != db_client.phone:
            if db.query(Client).filter(and_(Client.phone == phone_digits, Client.id != client_id)).first():
                raise ApiError("Telefone já cadastrado", 400)

        db_client.name = client_update.name.strip()
        db_client.phone = phone_digits
        db_client.email = email_norm
        db_client.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(db_client)
        return db_client

    def update_client_profile(self, db: Session, client_id: int, data_nascimento=None, email: Optional[str] = None) -> Client:
        db_client = self.get_client(db, client_id)

        if data_nascimento:
            db_client.data_nascimento = data_nascimento
        if email is not None:
            db_client.email = _normalize_email(email)

        db_client.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_client)
        return db_client

    def delete_client(self, db: Session, client_id: int):
        db_client = self.get_client(db, client_id)
        db.delete(db_client)
        db.commit()

    def inactivate_client(self, db: Session, client_id: int):
        db_client = self.get_client(db, client_id)
        db_client.is_active = False
        db_client.updated_at = datetime.utcnow()
        db.commit()

    def get_clients_with_status(
        self, db: Session, status_filter: str = "all", skip: int = 0, limit: int = 100
    ) -> List[Client]:
        query = db.query(Client)
        if status_filter == "active":
            query = query.filter(Client.is_active == True)
        elif status_filter == "inactive":
            query = query.filter(Client.is_active == False)
        return query.offset(skip).limit(limit).all()

    def get_all_clients(self, db: Session) -> List[Client]:
        return db.query(Client).order_by(Client.name).all()

    def get_inactive_clients(self, db: Session, days_inactive: int = 45) -> List[Client]:
        cutoff_date = datetime.utcnow() - timedelta(days=days_inactive)
        return db.query(Client).filter(
            and_(Client.is_active == True, Client.updated_at < cutoff_date)
        ).all()

    def auto_inactivate_clients(self, db: Session, days_inactive: int = 45) -> int:
        cutoff_date = datetime.utcnow() - timedelta(days=days_inactive)
        clients_to_inactivate = db.query(Client).filter(
            and_(
                Client.is_active == True,
                ~Client.id.in_(
                    db.query(Attendance.client_id)
                    .filter(func.date(Attendance.appointment_date) >= cutoff_date.date())
                    .distinct()
                ),
            )
        ).all()

        count = 0
        for client in clients_to_inactivate:
            client.is_active = False
            client.updated_at = datetime.utcnow()
            count += 1

        db.commit()
        return count


client_service = ClientService()

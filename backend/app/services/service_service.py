from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..errors import ApiError
from ..models import Service
from ..schemas import ServiceCreate


class ServiceService:
    def create_service(self, db: Session, service: ServiceCreate) -> Service:
        if db.query(Service).filter(Service.name == service.name).first():
            raise ApiError("Serviço com este nome já existe", 400)

        db_service = Service(**service.dict())
        db.add(db_service)
        db.commit()
        db.refresh(db_service)
        return db_service

    def get_service(self, db: Session, service_id: int) -> Service:
        service = db.query(Service).filter(Service.id == service_id).first()
        if not service:
            raise ApiError("Serviço não encontrado", 404)
        return service

    def get_services(self, db: Session) -> List[Service]:
        return db.query(Service).filter(Service.is_active == True).all()

    def update_service(self, db: Session, service_id: int, service_update: ServiceCreate) -> Service:
        db_service = self.get_service(db, service_id)

        if service_update.name != db_service.name:
            if db.query(Service).filter(and_(Service.name == service_update.name, Service.id != service_id)).first():
                raise ApiError("Serviço com este nome já existe", 400)

        for field, value in service_update.dict().items():
            setattr(db_service, field, value)

        db.commit()
        db.refresh(db_service)
        return db_service

    def delete_service(self, db: Session, service_id: int):
        db_service = self.get_service(db, service_id)
        db_service.is_active = False
        db.commit()


service_service = ServiceService()

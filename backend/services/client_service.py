from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from typing import List, Optional

from models import Client
from schemas import ClientCreate, ClientLogin
from services.whatsapp_service import whatsapp_service

class ClientService:
    def create_client(self, db: Session, client: ClientCreate) -> Client:
        # Verificar se CPF já existe
        if db.query(Client).filter(Client.cpf == client.cpf).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF já cadastrado"
            )
        
        # Verificar se telefone já existe
        if db.query(Client).filter(Client.phone == client.phone).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Telefone já cadastrado"
            )
        
        db_client = Client(**client.dict())
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        
        # Enviar mensagem de boas-vindas via WhatsApp
        try:
            welcome_message = f"Seja bem-vindo, {client.name}! Você foi cadastrado com sucesso na Matheus Barber."
            whatsapp_service.send_message(client.phone, welcome_message)
        except Exception as e:
            print(f"Erro ao enviar mensagem WhatsApp: {e}")
        
        return db_client
    
    def login_client(self, db: Session, login_data: ClientLogin) -> Client:
        # Buscar cliente por CPF ou telefone
        client = db.query(Client).filter(
            and_(
                Client.is_active == True,
                (Client.cpf == login_data.identifier) | (Client.phone == login_data.identifier)
            )
        ).first()
        
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado"
            )
        
        # Verificar se é cliente retornante (tem atendimentos anteriores)
        is_returning = db.query(Client).filter(
            and_(
                Client.id == client.id,
                Client.attendances.any()
            )
        ).first() is not None
        
        # Enviar mensagem de boas-vindas
        try:
            if is_returning:
                message = f"Bem-vindo de volta, {client.name}!"
            else:
                message = f"Seja bem-vindo, {client.name}!"
            
            whatsapp_service.send_message(client.phone, message)
        except Exception as e:
            print(f"Erro ao enviar mensagem WhatsApp: {e}")
        
        return client
    
    def get_client(self, db: Session, client_id: int) -> Client:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente não encontrado"
            )
        return client
    
    def get_clients(self, db: Session, skip: int = 0, limit: int = 100) -> List[Client]:
        return db.query(Client).offset(skip).limit(limit).all()
    
    def update_client(self, db: Session, client_id: int, client_update: ClientCreate) -> Client:
        db_client = self.get_client(db, client_id)
        
        # Verificar se CPF já existe (se foi alterado)
        if client_update.cpf != db_client.cpf:
            if db.query(Client).filter(and_(Client.cpf == client_update.cpf, Client.id != client_id)).first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF já cadastrado"
                )
        
        # Verificar se telefone já existe (se foi alterado)
        if client_update.phone != db_client.phone:
            if db.query(Client).filter(and_(Client.phone == client_update.phone, Client.id != client_id)).first():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Telefone já cadastrado"
                )
        
        for field, value in client_update.dict().items():
            setattr(db_client, field, value)
        
        db_client.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_client)
        
        return db_client
    
    def delete_client(self, db: Session, client_id: int):
        db_client = self.get_client(db, client_id)
        db_client.is_active = False
        db_client.updated_at = datetime.utcnow()
        db.commit()
    
    def get_inactive_clients(self, db: Session, days_inactive: int = 30) -> List[Client]:
        """Buscar clientes inativos por X dias"""
        cutoff_date = datetime.utcnow() - timedelta(days=days_inactive)
        return db.query(Client).filter(
            and_(
                Client.is_active == True,
                Client.updated_at < cutoff_date
            )
        ).all()

client_service = ClientService()
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import List, Optional
import jwt
from datetime import datetime, timedelta

from database import get_db, engine
from models import Base, Client, Admin, Service, Attendance
from schemas import (
    ClientCreate, ClientResponse, ClientLogin,
    AdminCreate, AdminLogin, AdminResponse,
    ServiceCreate, ServiceResponse,
    AttendanceCreate, AttendanceResponse,
    AttendanceUpdate
)
from services import (
    client_service, admin_service, service_service,
    attendance_service, whatsapp_service
)
from auth import get_current_admin

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Metheus Barber API",
    description="API para sistema de barbearia",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Rotas de Cliente
@app.post("/clients/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    """Cadastrar novo cliente"""
    return client_service.create_client(db, client)

@app.post("/clients/login", response_model=ClientResponse)
def client_login(login_data: ClientLogin, db: Session = Depends(get_db)):
    """Login do cliente via CPF ou telefone"""
    return client_service.login_client(db, login_data)

@app.get("/clients/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(get_db)):
    """Obter cliente por ID"""
    return client_service.get_client(db, client_id)

# Rotas de Administrador
@app.post("/admins/", response_model=AdminResponse)
def create_admin(admin: AdminCreate, db: Session = Depends(get_db)):
    """Cadastrar novo administrador"""
    return admin_service.create_admin(db, admin)

@app.post("/admins/login")
def admin_login(login_data: AdminLogin, db: Session = Depends(get_db)):
    """Login do administrador"""
    return admin_service.login_admin(db, login_data)

@app.get("/admins/me", response_model=AdminResponse)
def get_current_admin_info(current_admin: Admin = Depends(get_current_admin)):
    """Obter informações do administrador logado"""
    return current_admin

# Rotas de Cliente (Administrativas)
@app.get("/admin/clients/", response_model=List[ClientResponse])
def list_clients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Listar todos os clientes (apenas admin)"""
    return client_service.get_clients(db, skip=skip, limit=limit)

@app.put("/admin/clients/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_update: ClientCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Atualizar cliente (apenas admin)"""
    return client_service.update_client(db, client_id, client_update)

@app.delete("/admin/clients/{client_id}")
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Excluir cliente (apenas admin)"""
    client_service.delete_client(db, client_id)
    return {"message": "Cliente excluído com sucesso"}

# Rotas de Serviços
@app.post("/services/", response_model=ServiceResponse)
def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Criar novo serviço (apenas admin)"""
    return service_service.create_service(db, service)

@app.get("/services/", response_model=List[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    """Listar todos os serviços"""
    return service_service.get_services(db)

# Rotas de Atendimento
@app.post("/attendance/", response_model=AttendanceResponse)
def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db)
):
    """Criar novo atendimento"""
    return attendance_service.create_attendance(db, attendance)

@app.get("/attendance/today", response_model=List[AttendanceResponse])
def get_today_attendance(db: Session = Depends(get_db)):
    """Obter atendimentos do dia"""
    return attendance_service.get_today_attendance(db)

@app.put("/attendance/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: int,
    attendance_update: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Atualizar atendimento (apenas admin)"""
    return attendance_service.update_attendance(db, attendance_id, attendance_update)

@app.delete("/attendance/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Excluir atendimento (apenas admin)"""
    attendance_service.delete_attendance(db, attendance_id)
    return {"message": "Atendimento excluído com sucesso"}

# Rotas de Relatórios
@app.get("/admin/reports/summary")
def get_reports_summary(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Obter resumo de relatórios (apenas admin)"""
    return attendance_service.get_reports_summary(db)

# Rotas de WhatsApp
@app.post("/whatsapp/send-message")
def send_whatsapp_message(
    phone: str,
    message: str,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Enviar mensagem via WhatsApp (apenas admin)"""
    return whatsapp_service.send_message(phone, message)

@app.get("/")
def read_root():
    return {"message": "Metheus Barber API", "version": "1.0.0"}
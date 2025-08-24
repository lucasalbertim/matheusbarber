from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import os
from datetime import datetime
import io
import json

from database import get_db, engine
from models import Base, Admin
from sqlalchemy import text
from schemas import (
    ClientCreate, ClientResponse, ClientLogin,
    AdminCreate, AdminLogin, AdminResponse, AdminUpdate,
    ServiceCreate, ServiceResponse,
    AttendanceCreate, AttendanceResponse,
    AttendanceUpdate
)
from services import (
    client_service, admin_service, service_service,
    attendance_service, whatsapp_service
)
from auth import get_current_admin

import time

# Função para aguardar o banco estar disponível
def wait_for_database(max_retries=30, delay=2):
    """Aguarda o banco de dados estar disponível"""
    for attempt in range(max_retries):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
                print("✅ Conexão com banco de dados estabelecida!")
                return True
        except Exception as e:
            if attempt == 0:
                print("🔄 Aguardando banco de dados estar disponível...")
            elif attempt % 5 == 0:
                print(f"🔄 Tentativa {attempt + 1}/{max_retries}...")
            time.sleep(delay)
    
    print("❌ Não foi possível conectar ao banco de dados após várias tentativas")
    return False

# Aguardar banco estar disponível
if not wait_for_database():
    print("⚠️ Continuando sem verificação de coluna...")

# Criar tabelas
try:
    Base.metadata.create_all(bind=engine)
    print("✅ Tabelas criadas/verificadas com sucesso!")
except Exception as e:
    print(f"⚠️ Erro ao criar tabelas: {e}")

# Função para verificar e adicionar coluna is_first_login se necessário
def ensure_first_login_column():
    """Verificar se a coluna is_first_login existe e adicionar se necessário"""
    try:
        with engine.connect() as conn:
            # Verificar se a coluna existe
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'admins' AND column_name = 'is_first_login'
            """))
            
            if not result.fetchone():
                print("🔄 Adicionando coluna is_first_login à tabela admins...")
                # Adicionar a coluna
                conn.execute(text("""
                    ALTER TABLE admins 
                    ADD COLUMN is_first_login BOOLEAN DEFAULT TRUE
                """))
                
                # Atualizar registros existentes
                conn.execute(text("""
                    UPDATE admins 
                    SET is_first_login = TRUE 
                    WHERE username = 'admin'
                """))
                
                conn.execute(text("""
                    UPDATE admins 
                    SET is_first_login = FALSE 
                    WHERE username != 'admin'
                """))
                
                conn.commit()
                print("✅ Coluna is_first_login adicionada com sucesso!")
            else:
                print("✅ Coluna is_first_login já existe")
                
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível verificar/adicionar coluna is_first_login: {e}")

# Executar verificação da coluna
ensure_first_login_column()

# Função para criar admin padrão se não existir
def ensure_default_admin():
    """Criar admin padrão se não existir"""
    try:
        from security import get_password_hash
        
        with engine.connect() as conn:
            # Verificar se existe algum admin
            result = conn.execute(text("SELECT COUNT(*) FROM admins"))
            admin_count = result.fetchone()[0]
            
            if admin_count == 0:
                print("🔄 Criando administrador padrão...")
                # Criar admin padrão
                conn.execute(text("""
                    INSERT INTO admins (username, name, email, password_hash, is_active, is_first_login, created_at)
                    VALUES ('admin', 'Administrador', 'admin@metheusbarber.com', :password_hash, true, true, NOW())
                """), {"password_hash": get_password_hash("admin123")})
                
                conn.commit()
                print("✅ Administrador padrão criado com sucesso!")
                print("   Username: admin")
                print("   Senha: admin123")
            else:
                print("✅ Administrador já existe no banco")
                
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível verificar/criar admin padrão: {e}")

# Executar verificação do admin padrão
ensure_default_admin()

# Função para criar serviços padrão se não existirem
def ensure_default_services():
    """Criar serviços padrão se não existirem"""
    try:
        with engine.connect() as conn:
            # Verificar se existem serviços
            result = conn.execute(text("SELECT COUNT(*) FROM services"))
            service_count = result.fetchone()[0]
            
            if service_count == 0:
                print("🔄 Criando serviços padrão...")
                
                # Lista de serviços padrão
                default_services = [
                    ("Corte Masculino", "Corte tradicional masculino com acabamento", 35.00, 30),
                    ("Barba", "Acabamento de barba com navalha", 25.00, 20),
                    ("Corte + Barba", "Corte masculino + acabamento de barba", 50.00, 45),
                    ("Hidratação", "Tratamento hidratante para cabelo", 40.00, 25),
                    ("Pigmentação", "Coloração de cabelo ou barba", 60.00, 60)
                ]
                
                for name, description, price, duration in default_services:
                    conn.execute(text("""
                        INSERT INTO services (name, description, price, duration_minutes, is_active, created_at)
                        VALUES (:name, :description, :price, :duration, true, NOW())
                    """), {
                        "name": name,
                        "description": description,
                        "price": price,
                        "duration": duration
                    })
                
                conn.commit()
                print("✅ Serviços padrão criados com sucesso!")
            else:
                print("✅ Serviços já existem no banco")
                
    except Exception as e:
        print(f"⚠️ Aviso: Não foi possível verificar/criar serviços padrão: {e}")

# Executar verificação dos serviços padrão
ensure_default_services()

app = FastAPI(
    title="Metheus Barber API",
    description="API para sistema de barbearia",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://matheusbarber.shop",
        "https://www.matheusbarber.shop",
        "http://localhost:3000"],  # manter para desenvolvimento local],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração para servir arquivos estáticos do frontend
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "build")
if os.path.exists(frontend_path):
    app.mount("/static", StaticFiles(directory=os.path.join(frontend_path, "static")), name="static")

# Rota para servir o frontend
@app.get("/")
async def serve_frontend():
    """Servir o frontend React"""
    if os.path.exists(frontend_path):
        index_path = os.path.join(frontend_path, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
    
    return {"message": "Frontend não encontrado. Execute 'npm run build' no diretório frontend."}

# Rota para manifest.json
@app.get("/manifest.json")
async def serve_manifest():
    """Servir o manifest.json"""
    manifest_path = os.path.join(frontend_path, "manifest.json")
    if os.path.exists(manifest_path):
        return FileResponse(manifest_path)
    
    # Fallback para desenvolvimento
    dev_manifest_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "manifest.json")
    if os.path.exists(dev_manifest_path):
        return FileResponse(dev_manifest_path)
    
    raise HTTPException(status_code=404, detail="Manifest não encontrado")

 #Health check
@app.get("/health")
async def health_check():
    """Verificar status da API"""
    return {"status": "healthy", "message": "Metheus Barber API funcionando"}

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

@app.get("/clients/{client_id}/attendances", response_model=List[AttendanceResponse])
def get_client_attendances(client_id: int, db: Session = Depends(get_db)):
    """Obter atendimentos de um cliente específico"""
    return attendance_service.get_client_attendances(db, client_id)

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

@app.put("/admins/first-login", response_model=AdminResponse)
def update_first_login_admin(
    admin_update: AdminUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Atualizar administrador no primeiro login"""
    return admin_service.update_first_login_admin(db, current_admin.id, admin_update)

# Rotas de Cliente (Administrativas)
@app.get("/admin/clients/", response_model=List[ClientResponse])
def list_clients(
    status: str = Query("all", description="Filtro de status: all, active, inactive"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Listar clientes com filtro de status (apenas admin)"""
    return client_service.get_clients_with_status(db, status, skip, limit)

@app.get("/admin/clients/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Obter cliente específico (apenas admin)"""
    return client_service.get_client(db, client_id)

@app.post("/admin/clients/", response_model=ClientResponse)
def create_client(
    client: ClientCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Criar novo cliente (apenas admin)"""
    return client_service.create_client(db, client)

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

@app.post("/admin/clients/auto-inactivate")
def auto_inactivate_clients(
    days: int = Query(45, description="Número de dias para considerar cliente inativo"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Inativar automaticamente clientes inativos (apenas admin)"""
    count = client_service.auto_inactivate_clients(db, days)
    return {"message": f"{count} clientes foram inativados automaticamente"}

@app.post("/admin/clients/{client_id}/reactivate")
def reactivate_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Reativar cliente inativo (apenas admin)"""
    client = client_service.get_client(db, client_id)
    if client.is_active:
        raise HTTPException(status_code=400, detail="Cliente já está ativo")
    
    client.is_active = True
    client.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(client)
    
    return {"message": "Cliente reativado com sucesso"}

@app.post("/admin/clients/config")
def save_client_config(
    config: dict,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Salvar configurações de clientes (apenas admin)"""
    inactive_days = config.get("inactive_days", 45)
    
    # Aqui você pode salvar em uma tabela de configurações
    # Por enquanto, vamos apenas retornar sucesso
    return {"message": f"Configuração salva: {inactive_days} dias para inativação automática"}

@app.get("/admin/clients/export/excel")
def export_clients_excel(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Exportar lista de clientes em Excel (apenas admin)"""
    clients = client_service.get_all_clients(db)
    
    # Criar dados CSV (simulando Excel)
    csv_data = "Nome,CPF,Telefone,Email,Status,Data de Cadastro\n"
    for client in clients:
        status = "Ativo" if client.is_active else "Inativo"
        created_date = client.created_at.strftime("%d/%m/%Y") if client.created_at else ""
        csv_data += f'"{client.name}","{client.cpf}","{client.phone}","{client.email or ""}","{status}","{created_date}"\n'
    
    # Criar arquivo em memória
    output = io.StringIO()
    output.write(csv_data)
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=clientes_{datetime.now().strftime('%Y-%m-%d')}.csv"}
    )

@app.get("/admin/clients/export/pdf")
def export_clients_pdf(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Exportar lista de clientes em PDF (apenas admin)"""
    clients = client_service.get_all_clients(db)
    
    # Criar dados JSON (simulando PDF)
    pdf_data = {
        "title": "Lista de Clientes",
        "date": datetime.now().strftime("%d/%m/%Y"),
        "total_clients": len(clients),
        "clients": []
    }
    
    for client in clients:
        pdf_data["clients"].append({
            "name": client.name,
            "cpf": client.cpf,
            "phone": client.phone,
            "email": client.email or "Não informado",
            "status": "Ativo" if client.is_active else "Inativo",
            "created_at": client.created_at.strftime("%d/%m/%Y") if client.created_at else ""
        })
    
    # Criar arquivo JSON (simulando PDF)
    json_content = json.dumps(pdf_data, indent=2, ensure_ascii=False)
    
    return StreamingResponse(
        io.BytesIO(json_content.encode('utf-8')),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=clientes_{datetime.now().strftime('%Y-%m-%d')}.json"}
    )

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

@app.put("/services/{service_id}", response_model=ServiceResponse)
def update_service(
    service_id: int,
    service_update: ServiceCreate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Atualizar serviço (apenas admin)"""
    return service_service.update_service(db, service_id, service_update)

@app.delete("/services/{service_id}")
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Inativar serviço (apenas admin)"""
    service_service.delete_service(db, service_id)
    return {"message": "Serviço inativado com sucesso"}

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

@app.get("/admin/reports/summary-by-period")
def get_reports_summary_by_period(
    period: str,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Obter resumo de relatórios por período (apenas admin)"""
    return attendance_service.get_reports_summary_by_period(db, period, start_date, end_date)

@app.get("/admin/reports/top-clients")
def get_top_clients(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Obter top clientes (apenas admin)"""
    return attendance_service.get_top_clients(db)

@app.get("/admin/reports/recent-activities")
def get_recent_activities(
    limit: int = Query(10, description="Número de atividades a retornar"),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Obter atividades recentes (apenas admin)"""
    return attendance_service.get_recent_activities(db, limit)

@app.get("/admin/reports/revenue-chart")
def get_revenue_chart(
    period: str,
    start_date: str = None,
    end_date: str = None,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Obter dados de receita para gráfico (apenas admin)"""
    return attendance_service.get_revenue_by_period(db, period, start_date, end_date)

@app.get("/admin/reports/export")
def export_reports(
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    """Exportar relatórios (apenas admin)"""
    return attendance_service.export_reports(db)

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
import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from models import Base, Client, Admin, Service
from security import get_password_hash
from database import get_db

def create_test_app():
    """Criar aplicação de teste sem conexão com banco real"""
    app = FastAPI(title="Test App")
    
    # Configuração do banco de teste em memória
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    
    # Adicionar rotas básicas para teste
    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "message": "Test API funcionando"}
    
    @app.post("/admins/login")
    async def admin_login(login_data: dict, db=next(override_get_db())):
        from services.admin_service import admin_service
        from schemas import AdminLogin
        
        admin_login = AdminLogin(**login_data)
        return admin_service.login_admin(db, admin_login)
    
    @app.post("/clients/")
    async def create_client(client_data: dict, db=next(override_get_db())):
        from services.client_service import client_service
        from schemas import ClientCreate
        
        client_create = ClientCreate(**client_data)
        return client_service.create_client(db, client_create)
    
    @app.get("/services/")
    async def list_services(db=next(override_get_db())):
        from services.service_service import service_service
        return service_service.get_services(db)
    
    return app, engine, TestingSessionLocal

@pytest.fixture(scope="function")
def test_app():
    """Fixture para aplicação de teste"""
    app, engine, session_local = create_test_app()
    yield app, engine, session_local
    # Cleanup
    engine.dispose()

@pytest.fixture(scope="function")
def client(test_app):
    """Cliente HTTP de teste"""
    app, _, _ = test_app
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="function")
def db_session(test_app):
    """Sessão de banco de teste"""
    _, _, session_local = test_app
    db = session_local()
    try:
        yield db
    finally:
        db.close()

def test_health_endpoint(client):
    """Testar endpoint de health"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Test API funcionando" in data["message"]

def test_admin_login_success(client, db_session):
    """Testar login de admin com sucesso"""
    # Criar admin de teste
    admin = Admin(
        username="testadmin",
        name="Admin Teste",
        email="admin@teste.com",
        password_hash=get_password_hash("test123"),
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    
    response = client.post("/admins/login", json={
        "username": "testadmin",
        "password": "test123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_admin_login_invalid_credentials(client):
    """Testar login de admin com credenciais inválidas"""
    response = client.post("/admins/login", json={
        "username": "inexistente",
        "password": "senhaerrada"
    })
    
    assert response.status_code == 401
    assert "Credenciais inválidas" in response.json()["detail"]

def test_create_client_success(client):
    """Testar criação de cliente com sucesso"""
    client_data = {
        "name": "João Silva",
        "cpf": "12345678901",
        "phone": "11999999999",
        "email": "joao@teste.com"
    }
    
    response = client.post("/clients/", json=client_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == client_data["name"]
    assert data["cpf"] == client_data["cpf"]
    assert data["phone"] == client_data["phone"]
    assert data["email"] == client_data["email"]
    assert data["is_active"] == True

def test_create_client_duplicate_cpf(client, db_session):
    """Testar criação de cliente com CPF duplicado"""
    # Criar primeiro cliente
    client1 = Client(
        name="João Silva",
        cpf="12345678901",
        phone="11999999999",
        email="joao@teste.com",
        is_active=True
    )
    db_session.add(client1)
    db_session.commit()
    
    # Tentar criar segundo cliente com mesmo CPF
    client_data = {
        "name": "Maria Santos",
        "cpf": "12345678901",  # CPF duplicado
        "phone": "11888888888",
        "email": "maria@teste.com"
    }
    
    response = client.post("/clients/", json=client_data)
    
    assert response.status_code == 400
    assert "CPF já cadastrado" in response.json()["detail"]

def test_list_services_empty(client):
    """Testar listagem de serviços vazia"""
    response = client.get("/services/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

def test_list_services_with_data(client, db_session):
    """Testar listagem de serviços com dados"""
    # Criar serviço de teste
    service = Service(
        name="Corte Masculino",
        description="Corte tradicional masculino",
        price=35.00,
        duration_minutes=30,
        is_active=True
    )
    db_session.add(service)
    db_session.commit()
    
    response = client.get("/services/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Corte Masculino"
    assert data[0]["price"] == 35.00

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
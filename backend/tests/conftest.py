import pytest
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import app without database connection for testing
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import get_db
from models import Base

# Configuração do banco de teste em memória
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Criar sessão de banco de teste para cada teste"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Cliente HTTP de teste com banco mockado"""
    # Criar app de teste sem conexão com banco
    test_app = FastAPI(title="Test App")
    test_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Importar rotas do main sem executar o código de inicialização
    from main import app
    # Copiar rotas para o app de teste
    for route in app.routes:
        test_app.routes.append(route)
    
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    test_app.dependency_overrides[get_db] = override_get_db
    with TestClient(test_app) as test_client:
        yield test_client
    test_app.dependency_overrides.clear()

@pytest.fixture(scope="function")
def admin_token(client, db_session):
    """Token de admin para testes autenticados"""
    from security import get_password_hash
    from models import Admin
    
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
    
    # Fazer login para obter token
    response = client.post("/admins/login", json={
        "username": "testadmin",
        "password": "test123"
    })
    
    return response.json()["access_token"]

@pytest.fixture(scope="function")
def sample_client(db_session):
    """Cliente de exemplo para testes"""
    from models import Client
    
    client = Client(
        name="João Silva",
        cpf="12345678901",
        phone="11999999999",
        email="joao@teste.com",
        is_active=True
    )
    db_session.add(client)
    db_session.commit()
    db_session.refresh(client)
    
    return client

@pytest.fixture(scope="function")
def sample_service(db_session):
    """Serviço de exemplo para testes"""
    from models import Service
    
    service = Service(
        name="Corte Masculino",
        description="Corte tradicional masculino",
        price=35.00,
        duration_minutes=30,
        is_active=True
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    
    return service
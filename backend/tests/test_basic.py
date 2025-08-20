import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from models import Base, Client, Admin, Service
from security import get_password_hash, verify_password, create_access_token

def test_models_import():
    """Testar se os modelos podem ser importados"""
    assert Client is not None
    assert Admin is not None
    assert Service is not None
    assert Base is not None

def test_security_functions():
    """Testar funções de segurança"""
    # Testar hash de senha
    password = "test123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert len(hashed) > 0
    
    # Testar verificação de senha
    assert verify_password(password, hashed) == True
    assert verify_password("wrong", hashed) == False
    
    # Testar criação de token
    token = create_access_token(data={"sub": "testuser"})
    assert token is not None
    assert len(token) > 0

def test_database_connection():
    """Testar conexão com banco em memória"""
    # Configuração do banco de teste em memória
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Criar tabelas
    Base.metadata.create_all(bind=engine)
    
    # Criar sessão
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    try:
        # Testar criação de admin
        admin = Admin(
            username="testadmin",
            name="Admin Teste",
            email="admin@teste.com",
            password_hash=get_password_hash("test123"),
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        assert admin.id is not None
        assert admin.username == "testadmin"
        
        # Testar criação de cliente
        client = Client(
            name="João Silva",
            cpf="12345678901",
            phone="11999999999",
            email="joao@teste.com",
            is_active=True
        )
        db.add(client)
        db.commit()
        db.refresh(client)
        
        assert client.id is not None
        assert client.name == "João Silva"
        assert client.cpf == "12345678901"
        
        # Testar criação de serviço
        service = Service(
            name="Corte Masculino",
            description="Corte tradicional masculino",
            price=35.00,
            duration_minutes=30,
            is_active=True
        )
        db.add(service)
        db.commit()
        db.refresh(service)
        
        assert service.id is not None
        assert service.name == "Corte Masculino"
        assert service.price == 35.00
        
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

def test_client_validation():
    """Testar validação de dados do cliente"""
    # CPF válido
    valid_cpf = "12345678901"
    assert len(valid_cpf) == 11
    assert valid_cpf.isdigit()
    
    # Telefone válido
    valid_phone = "11999999999"
    assert len(valid_phone) == 11
    assert valid_phone.isdigit()
    
    # Email válido
    valid_email = "teste@email.com"
    assert "@" in valid_email
    assert "." in valid_email

def test_service_validation():
    """Testar validação de dados do serviço"""
    # Preço válido
    valid_price = 35.50
    assert valid_price > 0
    assert isinstance(valid_price, (int, float))
    
    # Duração válida
    valid_duration = 30
    assert valid_duration > 0
    assert isinstance(valid_duration, int)

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
import pytest
from fastapi.testclient import TestClient

def test_admin_login_success(client: TestClient, db_session):
    """Testar login de admin com sucesso"""
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
    
    response = client.post("/admins/login", json={
        "username": "testadmin",
        "password": "test123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "admin" in data

def test_admin_login_invalid_credentials(client: TestClient):
    """Testar login de admin com credenciais inválidas"""
    response = client.post("/admins/login", json={
        "username": "inexistente",
        "password": "senhaerrada"
    })
    
    assert response.status_code == 401
    assert "Credenciais inválidas" in response.json()["detail"]

def test_admin_login_inactive_user(client: TestClient, db_session):
    """Testar login de admin inativo"""
    from security import get_password_hash
    from models import Admin
    
    admin = Admin(
        username="inativo",
        name="Admin Inativo",
        email="inativo@teste.com",
        password_hash=get_password_hash("test123"),
        is_active=False
    )
    db_session.add(admin)
    db_session.commit()
    
    response = client.post("/admins/login", json={
        "username": "inativo",
        "password": "test123"
    })
    
    assert response.status_code == 401
    assert "Credenciais inválidas" in response.json()["detail"]

def test_protected_endpoint_without_token(client: TestClient):
    """Testar endpoint protegido sem token"""
    response = client.get("/admin/clients/")
    assert response.status_code == 401

def test_protected_endpoint_with_valid_token(client: TestClient, admin_token):
    """Testar endpoint protegido com token válido"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/clients/", headers=headers)
    assert response.status_code == 200

def test_protected_endpoint_with_invalid_token(client: TestClient):
    """Testar endpoint protegido com token inválido"""
    headers = {"Authorization": "Bearer token_invalido"}
    response = client.get("/admin/clients/", headers=headers)
    assert response.status_code == 401
import pytest
from fastapi.testclient import TestClient

def test_create_client_success(client: TestClient):
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

def test_create_client_duplicate_cpf(client: TestClient, sample_client):
    """Testar criação de cliente com CPF duplicado"""
    client_data = {
        "name": "Outro Nome",
        "cpf": sample_client.cpf,  # CPF já existente
        "phone": "11888888888",
        "email": "outro@teste.com"
    }
    
    response = client.post("/clients/", json=client_data)
    
    assert response.status_code == 400
    assert "CPF já cadastrado" in response.json()["detail"]

def test_create_client_duplicate_phone(client: TestClient, sample_client):
    """Testar criação de cliente com telefone duplicado"""
    client_data = {
        "name": "Outro Nome",
        "cpf": "98765432109",
        "phone": sample_client.phone,  # Telefone já existente
        "email": "outro@teste.com"
    }
    
    response = client.post("/clients/", json=client_data)
    
    assert response.status_code == 400
    assert "Telefone já cadastrado" in response.json()["detail"]

def test_create_client_invalid_cpf(client: TestClient):
    """Testar criação de cliente com CPF inválido"""
    client_data = {
        "name": "João Silva",
        "cpf": "123",  # CPF inválido
        "phone": "11999999999",
        "email": "joao@teste.com"
    }
    
    response = client.post("/clients/", json=client_data)
    
    assert response.status_code == 400
    assert "CPF inválido" in response.json()["detail"]

def test_create_client_invalid_phone(client: TestClient):
    """Testar criação de cliente com telefone inválido"""
    client_data = {
        "name": "João Silva",
        "cpf": "12345678901",
        "phone": "123",  # Telefone inválido
        "email": "joao@teste.com"
    }
    
    response = client.post("/clients/", json=client_data)
    
    assert response.status_code == 400
    assert "Telefone inválido" in response.json()["detail"]

def test_client_login_success(client: TestClient, sample_client):
    """Testar login de cliente com sucesso"""
    response = client.post("/clients/login", json={
        "identifier": sample_client.cpf
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_client.id
    assert data["name"] == sample_client.name

def test_client_login_by_phone(client: TestClient, sample_client):
    """Testar login de cliente por telefone"""
    response = client.post("/clients/login", json={
        "identifier": sample_client.phone
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_client.id
    assert data["name"] == sample_client.name

def test_client_login_not_found(client: TestClient):
    """Testar login de cliente inexistente"""
    response = client.post("/clients/login", json={
        "identifier": "99999999999"
    })
    
    assert response.status_code == 404
    assert "Cliente não encontrado" in response.json()["detail"]

def test_get_client_by_id(client: TestClient, sample_client):
    """Testar obtenção de cliente por ID"""
    response = client.get(f"/clients/{sample_client.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_client.id
    assert data["name"] == sample_client.name

def test_get_client_not_found(client: TestClient):
    """Testar obtenção de cliente inexistente"""
    response = client.get("/clients/999")
    
    assert response.status_code == 404
    assert "Cliente não encontrado" in response.json()["detail"]

def test_admin_list_clients(client: TestClient, admin_token, sample_client):
    """Testar listagem de clientes por admin"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/clients/", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(client["id"] == sample_client.id for client in data)

def test_admin_create_client(client: TestClient, admin_token):
    """Testar criação de cliente por admin"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    client_data = {
        "name": "Maria Santos",
        "cpf": "98765432109",
        "phone": "11888888888",
        "email": "maria@teste.com"
    }
    
    response = client.post("/admin/clients/", json=client_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == client_data["name"]
    assert data["cpf"] == client_data["cpf"]
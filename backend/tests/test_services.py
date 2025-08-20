import pytest
from fastapi.testclient import TestClient

def test_create_service_success(client: TestClient, admin_token):
    """Testar criação de serviço com sucesso"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    service_data = {
        "name": "Hidratação",
        "description": "Tratamento hidratante para cabelo",
        "price": 40.00,
        "duration_minutes": 25
    }
    
    response = client.post("/services/", json=service_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == service_data["name"]
    assert data["description"] == service_data["description"]
    assert data["price"] == service_data["price"]
    assert data["duration_minutes"] == service_data["duration_minutes"]
    assert data["is_active"] == True

def test_create_service_duplicate_name(client: TestClient, admin_token, sample_service):
    """Testar criação de serviço com nome duplicado"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    service_data = {
        "name": sample_service.name,  # Nome já existente
        "description": "Outra descrição",
        "price": 50.00,
        "duration_minutes": 30
    }
    
    response = client.post("/services/", json=service_data, headers=headers)
    
    assert response.status_code == 400
    assert "Serviço com este nome já existe" in response.json()["detail"]

def test_create_service_without_auth(client: TestClient):
    """Testar criação de serviço sem autenticação"""
    service_data = {
        "name": "Serviço Teste",
        "description": "Descrição teste",
        "price": 30.00,
        "duration_minutes": 20
    }
    
    response = client.post("/services/", json=service_data)
    
    assert response.status_code == 401

def test_list_services_public(client: TestClient, sample_service):
    """Testar listagem pública de serviços"""
    response = client.get("/services/")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(service["id"] == sample_service.id for service in data)

def test_list_services_only_active(client: TestClient, admin_token, sample_service):
    """Testar se apenas serviços ativos são listados"""
    # Primeiro, desativar o serviço de exemplo
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.delete(f"/services/{sample_service.id}", headers=headers)
    assert response.status_code == 200
    
    # Verificar se não aparece mais na listagem pública
    response = client.get("/services/")
    assert response.status_code == 200
    data = response.json()
    assert not any(service["id"] == sample_service.id for service in data)

def test_update_service_success(client: TestClient, admin_token, sample_service):
    """Testar atualização de serviço com sucesso"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    update_data = {
        "name": "Corte Masculino Atualizado",
        "description": "Descrição atualizada",
        "price": 40.00,
        "duration_minutes": 35
    }
    
    response = client.put(f"/services/{sample_service.id}", json=update_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]
    assert data["price"] == update_data["price"]
    assert data["duration_minutes"] == update_data["duration_minutes"]

def test_update_service_not_found(client: TestClient, admin_token):
    """Testar atualização de serviço inexistente"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    update_data = {
        "name": "Serviço Inexistente",
        "description": "Descrição",
        "price": 30.00,
        "duration_minutes": 20
    }
    
    response = client.put("/services/999", json=update_data, headers=headers)
    
    assert response.status_code == 404
    assert "Serviço não encontrado" in response.json()["detail"]

def test_delete_service_success(client: TestClient, admin_token, sample_service):
    """Testar exclusão (desativação) de serviço"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.delete(f"/services/{sample_service.id}", headers=headers)
    
    assert response.status_code == 200
    assert "Serviço inativado com sucesso" in response.json()["message"]

def test_delete_service_without_auth(client: TestClient, sample_service):
    """Testar exclusão de serviço sem autenticação"""
    response = client.delete(f"/services/{sample_service.id}")
    
    assert response.status_code == 401
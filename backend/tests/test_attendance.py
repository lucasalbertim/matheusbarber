import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

def test_create_attendance_success(client: TestClient, sample_client, sample_service):
    """Testar criação de atendimento com sucesso"""
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [sample_service.id],
        "payment_method": "cash",
        "notes": "Teste de atendimento"
    }
    
    response = client.post("/attendance/", json=attendance_data)
    
    assert response.status_code == 200
    data = response.json()
    assert data["client_id"] == sample_client.id
    assert data["status"] == "waiting"
    assert data["payment_status"] == "pending"
    assert len(data["services"]) == 1
    assert data["services"][0]["id"] == sample_service.id

def test_create_attendance_client_not_found(client: TestClient, sample_service):
    """Testar criação de atendimento com cliente inexistente"""
    attendance_data = {
        "client_id": 999,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [sample_service.id]
    }
    
    response = client.post("/attendance/", json=attendance_data)
    
    assert response.status_code == 404
    assert "Cliente não encontrado" in response.json()["detail"]

def test_create_attendance_invalid_service(client: TestClient, sample_client):
    """Testar criação de atendimento com serviço inválido"""
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [999]  # Serviço inexistente
    }
    
    response = client.post("/attendance/", json=attendance_data)
    
    assert response.status_code == 400
    assert "Um ou mais serviços inválidos/inativos" in response.json()["detail"]

def test_get_today_attendance(client: TestClient, sample_client, sample_service):
    """Testar obtenção de atendimentos do dia"""
    # Criar atendimento para hoje
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": datetime.now().isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Buscar atendimentos de hoje
    response = client.get("/attendance/today")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any(att["client_id"] == sample_client.id for att in data)

def test_update_attendance_status(client: TestClient, admin_token, sample_client, sample_service):
    """Testar atualização de status de atendimento"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    attendance_id = create_response.json()["id"]
    
    # Atualizar status
    headers = {"Authorization": f"Bearer {admin_token}"}
    update_data = {
        "status": "progress",
        "payment_method": "card"
    }
    
    response = client.put(f"/attendance/{attendance_id}", json=update_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "progress"
    assert data["payment_method"] == "card"

def test_update_attendance_finished_payment_paid(client: TestClient, admin_token, sample_client, sample_service):
    """Testar se atendimento finalizado marca pagamento como pago"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    attendance_id = create_response.json()["id"]
    
    # Finalizar atendimento
    headers = {"Authorization": f"Bearer {admin_token}"}
    update_data = {"status": "finished"}
    
    response = client.put(f"/attendance/{attendance_id}", json=update_data, headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "finished"
    assert data["payment_status"] == "paid"

def test_get_client_attendances(client: TestClient, sample_client, sample_service):
    """Testar obtenção de atendimentos de um cliente específico"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Buscar atendimentos do cliente
    response = client.get(f"/clients/{sample_client.id}/attendances")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(att["client_id"] == sample_client.id for att in data)

def test_delete_attendance(client: TestClient, admin_token, sample_client, sample_service):
    """Testar exclusão de atendimento"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    attendance_id = create_response.json()["id"]
    
    # Excluir atendimento
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.delete(f"/attendance/{attendance_id}", headers=headers)
    
    assert response.status_code == 200
    assert "Atendimento excluído com sucesso" in response.json()["message"]

def test_delete_attendance_without_auth(client: TestClient, sample_client, sample_service):
    """Testar exclusão de atendimento sem autenticação"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": (datetime.now() + timedelta(hours=1)).isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    attendance_id = create_response.json()["id"]
    
    # Tentar excluir sem autenticação
    response = client.delete(f"/attendance/{attendance_id}")
    
    assert response.status_code == 401
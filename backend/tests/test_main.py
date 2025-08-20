import pytest
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    """Testar endpoint de health check"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Metheus Barber API funcionando" in data["message"]

def test_frontend_serving(client: TestClient):
    """Testar se o frontend está sendo servido"""
    response = client.get("/")
    # Como estamos em teste sem build do frontend, deve retornar mensagem
    assert response.status_code == 200
    data = response.json()
    assert "Frontend não encontrado" in data["message"]

def test_manifest_endpoint(client: TestClient):
    """Testar endpoint do manifest.json"""
    response = client.get("/manifest.json")
    # Deve retornar 404 em ambiente de teste
    assert response.status_code == 404

def test_cors_headers(client: TestClient):
    """Testar se CORS está configurado corretamente"""
    response = client.options("/health")
    # Verificar se headers CORS estão presentes
    assert "access-control-allow-origin" in response.headers
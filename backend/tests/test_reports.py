import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

def test_reports_summary_without_auth(client: TestClient):
    """Testar relatório resumo sem autenticação"""
    response = client.get("/admin/reports/summary")
    assert response.status_code == 401

def test_reports_summary_with_auth(client: TestClient, admin_token, sample_client, sample_service):
    """Testar relatório resumo com autenticação"""
    # Criar atendimento para ter dados
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": datetime.now().isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Buscar relatório
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/reports/summary", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "totalClients" in data
    assert "totalAttendances" in data
    assert "totalRevenue" in data
    assert "todayAttendances" in data
    assert "pendingPayments" in data

def test_reports_summary_by_period(client: TestClient, admin_token, sample_client, sample_service):
    """Testar relatório por período"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": datetime.now().isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Buscar relatório por período
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/reports/summary-by-period?period=day", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "totalClients" in data
    assert "totalAttendances" in data
    assert "totalRevenue" in data
    assert "growthPercentages" in data

def test_top_clients_report(client: TestClient, admin_token, sample_client, sample_service):
    """Testar relatório de top clientes"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": datetime.now().isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Buscar top clientes
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/reports/top-clients", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "id" in data[0]
    assert "name" in data[0]
    assert "totalVisits" in data[0]
    assert "totalRevenue" in data[0]

def test_recent_activities_report(client: TestClient, admin_token, sample_client, sample_service):
    """Testar relatório de atividades recentes"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": datetime.now().isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Buscar atividades recentes
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/reports/recent-activities?limit=5", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "id" in data[0]
    assert "type" in data[0]
    assert "title" in data[0]
    assert "timestamp" in data[0]

def test_revenue_chart_data(client: TestClient, admin_token, sample_client, sample_service):
    """Testar dados de receita para gráfico"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": datetime.now().isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Buscar dados de receita
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/reports/revenue-chart?period=day", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert "date" in data[0]
    assert "revenue" in data[0]
    assert "label" in data[0]

def test_export_reports(client: TestClient, admin_token, sample_client, sample_service):
    """Testar exportação de relatórios"""
    # Criar atendimento
    attendance_data = {
        "client_id": sample_client.id,
        "appointment_date": datetime.now().isoformat(),
        "service_ids": [sample_service.id]
    }
    
    create_response = client.post("/attendance/", json=attendance_data)
    assert create_response.status_code == 200
    
    # Exportar relatórios
    headers = {"Authorization": f"Bearer {admin_token}"}
    response = client.get("/admin/reports/export", headers=headers)
    
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "top_clients" in data
    assert "export_date" in data
    assert "message" in data

def test_reports_with_different_periods(client: TestClient, admin_token):
    """Testar relatórios com diferentes períodos"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    periods = ["day", "week", "month", "quarter", "year"]
    
    for period in periods:
        response = client.get(f"/admin/reports/summary-by-period?period={period}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "period" in data
        assert data["period"]["current"]["start"] is not None
        assert data["period"]["current"]["end"] is not None

def test_reports_with_custom_date_range(client: TestClient, admin_token):
    """Testar relatórios com intervalo de datas customizado"""
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
    end_date = datetime.now().strftime("%Y-%m-%d")
    
    response = client.get(
        f"/admin/reports/summary-by-period?period=custom&start_date={start_date}&end_date={end_date}",
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "period" in data
    assert data["period"]["current"]["start"] == start_date
    assert data["period"]["current"]["end"] == end_date
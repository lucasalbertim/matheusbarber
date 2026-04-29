from datetime import datetime
from flask import Blueprint, jsonify, request

from ..auth import require_admin
from ..database import get_db
from ..schemas import ClientCreate, ClientResponse
from ..services.client_service import client_service
from ..errors import ApiError
from .utils import parse_body, serialize, serialize_list

admin_clients_bp = Blueprint("admin_clients", __name__)


@admin_clients_bp.get("/admin/clients/")
@require_admin
def list_clients():
    status_filter = request.args.get("status", "all")
    skip = int(request.args.get("skip", 0))
    limit = int(request.args.get("limit", 100))
    with get_db() as db:
        clients = client_service.get_clients_with_status(db, status_filter, skip, limit)
        return jsonify(serialize_list(ClientResponse, clients))


@admin_clients_bp.get("/admin/clients/<int:client_id>")
@require_admin
def get_client(client_id: int):
    with get_db() as db:
        client = client_service.get_client(db, client_id)
        return jsonify(serialize(ClientResponse, client))


@admin_clients_bp.post("/admin/clients/")
@require_admin
def create_client():
    client_data = parse_body(ClientCreate)
    with get_db() as db:
        client = client_service.create_client(db, client_data)
        return jsonify(serialize(ClientResponse, client))


@admin_clients_bp.put("/admin/clients/<int:client_id>")
@require_admin
def update_client(client_id: int):
    client_update = parse_body(ClientCreate)
    with get_db() as db:
        client = client_service.update_client(db, client_id, client_update)
        return jsonify(serialize(ClientResponse, client))


@admin_clients_bp.delete("/admin/clients/<int:client_id>")
@require_admin
def delete_client(client_id: int):
    with get_db() as db:
        client_service.delete_client(db, client_id)
        return jsonify({"message": "Cliente excluído com sucesso"})


@admin_clients_bp.post("/admin/clients/auto-inactivate")
@require_admin
def auto_inactivate_clients():
    days = int(request.args.get("days", 45))
    with get_db() as db:
        count = client_service.auto_inactivate_clients(db, days)
        return jsonify({"message": f"{count} clientes foram inativados automaticamente"})


@admin_clients_bp.post("/admin/clients/<int:client_id>/reactivate")
@require_admin
def reactivate_client(client_id: int):
    with get_db() as db:
        client = client_service.get_client(db, client_id)
        if client.is_active:
            raise ApiError("Cliente já está ativo", 400)
        client.is_active = True
        client.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(client)
        return jsonify({"message": "Cliente reativado com sucesso"})


@admin_clients_bp.post("/admin/clients/config")
@require_admin
def save_client_config():
    config = request.get_json(silent=True) or {}
    inactive_days = config.get("inactive_days", 45)
    return jsonify({"message": f"Configuração salva: {inactive_days} dias para inativação automática"})


@admin_clients_bp.get("/admin/clients/export/excel")
@require_admin
def export_clients_excel():
    from io import StringIO, BytesIO

    with get_db() as db:
        clients = client_service.get_all_clients(db)

    csv_data = "Nome,Data de Nascimento,Telefone,Email,Status,Data de Cadastro\n"
    for client in clients:
        status = "Ativo" if client.is_active else "Inativo"
        created_date = client.created_at.strftime("%d/%m/%Y") if client.created_at else ""
        nascimento = client.data_nascimento.strftime("%d/%m/%Y") if client.data_nascimento else ""
        csv_data += (
            f"\"{client.name}\",\"{nascimento}\",\"{client.phone}\",\"{client.email or ''}\","
            f"\"{status}\",\"{created_date}\"\n"
        )

    output = StringIO()
    output.write(csv_data)
    output.seek(0)

    return (
        BytesIO(output.getvalue().encode("utf-8")),
        200,
        {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": f"attachment; filename=clientes_{datetime.now().strftime('%Y-%m-%d')}.csv",
        },
    )


@admin_clients_bp.get("/admin/clients/export/pdf")
@require_admin
def export_clients_pdf():
    import json
    from io import BytesIO

    with get_db() as db:
        clients = client_service.get_all_clients(db)

    pdf_data = {
        "title": "Lista de Clientes",
        "date": datetime.now().strftime("%d/%m/%Y"),
        "total_clients": len(clients),
        "clients": [],
    }

    for client in clients:
        pdf_data["clients"].append(
            {
                "name": client.name,
                "data_nascimento": client.data_nascimento.strftime("%d/%m/%Y") if client.data_nascimento else "",
                "phone": client.phone,
                "email": client.email or "Não informado",
                "status": "Ativo" if client.is_active else "Inativo",
                "created_at": client.created_at.strftime("%d/%m/%Y") if client.created_at else "",
            }
        )

    json_content = json.dumps(pdf_data, indent=2, ensure_ascii=False)
    return (
        BytesIO(json_content.encode("utf-8")),
        200,
        {
            "Content-Type": "application/pdf",
            "Content-Disposition": f"attachment; filename=clientes_{datetime.now().strftime('%Y-%m-%d')}.json",
        },
    )

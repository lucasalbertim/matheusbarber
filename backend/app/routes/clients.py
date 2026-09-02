from flask import Blueprint, jsonify

from ..auth import require_client_self
from ..database import get_db
from ..rate_limit import rate_limit
from ..schemas import ClientCreate, ClientLogin, ClientResponse, AttendanceResponse, ClientProfileUpdate
from ..security import create_client_token
from ..services.client_service import client_service
from ..services.attendance_service import attendance_service
from .utils import parse_body, serialize, serialize_list

clients_bp = Blueprint("clients", __name__)


@clients_bp.post("/clients/")
@rate_limit("client_register", limit=5, window_seconds=900)
def create_client():
    client_data = parse_body(ClientCreate)
    with get_db() as db:
        client = client_service.create_client(db, client_data)
        payload = serialize(ClientResponse, client)
        payload["access_token"] = create_client_token(client.id)
        return jsonify(payload)


@clients_bp.post("/clients/login")
@rate_limit("client_login", limit=10, window_seconds=900)
def login_client():
    login_data = parse_body(ClientLogin)
    with get_db() as db:
        client = client_service.login_client(db, login_data)
        payload = serialize(ClientResponse, client)
        payload["access_token"] = create_client_token(client.id)
        return jsonify(payload)


@clients_bp.get("/clients/<int:client_id>")
@require_client_self
def get_client(client_id: int):
    with get_db() as db:
        client = client_service.get_client(db, client_id)
        return jsonify(serialize(ClientResponse, client))


@clients_bp.put("/clients/<int:client_id>")
@require_client_self
def update_client_profile(client_id: int):
    profile_update = parse_body(ClientProfileUpdate)
    if not profile_update.data_nascimento and profile_update.email is None:
        return jsonify({"detail": "Nada para atualizar"}), 400

    with get_db() as db:
        client = client_service.update_client_profile(
            db,
            client_id,
            data_nascimento=profile_update.data_nascimento,
            email=profile_update.email,
        )
        return jsonify(serialize(ClientResponse, client))


@clients_bp.get("/clients/<int:client_id>/attendances")
@require_client_self
def get_client_attendances(client_id: int):
    with get_db() as db:
        attendances = attendance_service.get_client_attendances(db, client_id)
        return jsonify(serialize_list(AttendanceResponse, attendances))

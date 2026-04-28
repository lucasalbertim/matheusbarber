from flask import Blueprint, jsonify

from ..database import get_db
from ..schemas import ClientCreate, ClientLogin, ClientResponse, AttendanceResponse, ClientProfileUpdate
from ..services.client_service import client_service
from ..services.attendance_service import attendance_service
from .utils import parse_body, serialize, serialize_list

clients_bp = Blueprint("clients", __name__)


@clients_bp.post("/clients/")
def create_client():
    client_data = parse_body(ClientCreate)
    with get_db() as db:
        client = client_service.create_client(db, client_data)
        return jsonify(serialize(ClientResponse, client))


@clients_bp.post("/clients/login")
def login_client():
    login_data = parse_body(ClientLogin)
    with get_db() as db:
        client = client_service.login_client(db, login_data)
        return jsonify(serialize(ClientResponse, client))


@clients_bp.get("/clients/<int:client_id>")
def get_client(client_id: int):
    with get_db() as db:
        client = client_service.get_client(db, client_id)
        return jsonify(serialize(ClientResponse, client))


@clients_bp.put("/clients/<int:client_id>")
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
def get_client_attendances(client_id: int):
    with get_db() as db:
        attendances = attendance_service.get_client_attendances(db, client_id)
        return jsonify(serialize_list(AttendanceResponse, attendances))

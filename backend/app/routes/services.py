from flask import Blueprint, jsonify

from ..auth import require_admin
from ..database import get_db
from ..schemas import ServiceCreate, ServiceResponse
from ..services.service_service import service_service
from .utils import parse_body, serialize, serialize_list

services_bp = Blueprint("services", __name__)


@services_bp.post("/services/")
@require_admin
def create_service():
    service_data = parse_body(ServiceCreate)
    with get_db() as db:
        service = service_service.create_service(db, service_data)
        return jsonify(serialize(ServiceResponse, service))


@services_bp.get("/services/")
def list_services():
    with get_db() as db:
        services = service_service.get_services(db)
        return jsonify(serialize_list(ServiceResponse, services))


@services_bp.put("/services/<int:service_id>")
@require_admin
def update_service(service_id: int):
    service_update = parse_body(ServiceCreate)
    with get_db() as db:
        service = service_service.update_service(db, service_id, service_update)
        return jsonify(serialize(ServiceResponse, service))


@services_bp.delete("/services/<int:service_id>")
@require_admin
def delete_service(service_id: int):
    with get_db() as db:
        service_service.delete_service(db, service_id)
        return jsonify({"message": "Serviço inativado com sucesso"})

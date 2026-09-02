from flask import Blueprint, jsonify, g

from ..auth import require_admin
from ..rate_limit import rate_limit
from ..database import get_db
from ..schemas import AdminCreate, AdminLogin, AdminUpdate, AdminResponse
from ..services.admin_service import admin_service
from .utils import parse_body, serialize

admins_bp = Blueprint("admins", __name__)


@admins_bp.post("/admins/")
@require_admin
def create_admin():
    # Antes, esta rota era publica: qualquer visitante criava uma conta de
    # administrador e passava a ter acesso total ao sistema. Era a falha mais grave
    # da auditoria.
    admin_data = parse_body(AdminCreate)
    with get_db() as db:
        admin = admin_service.create_admin(db, admin_data)
        return jsonify(serialize(AdminResponse, admin))


@admins_bp.post("/admins/login")
@rate_limit("admin_login", limit=5, window_seconds=900)
def login_admin():
    login_data = parse_body(AdminLogin)
    with get_db() as db:
        result = admin_service.login_admin(db, login_data)
        result["admin"] = serialize(AdminResponse, result["admin"])
        return jsonify(result)


@admins_bp.get("/admins/me")
@require_admin
def get_current_admin():
    return jsonify(serialize(AdminResponse, g.current_admin))


@admins_bp.put("/admins/first-login")
@require_admin
def update_first_login_admin():
    admin_update = parse_body(AdminUpdate)
    with get_db() as db:
        admin = admin_service.update_first_login_admin(db, g.current_admin.id, admin_update)
        return jsonify(serialize(AdminResponse, admin))

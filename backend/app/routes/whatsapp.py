from flask import Blueprint, jsonify, request

from ..auth import require_admin
from ..services.whatsapp_service import whatsapp_service

whatsapp_bp = Blueprint("whatsapp", __name__)


@whatsapp_bp.post("/whatsapp/send-message")
@require_admin
def send_whatsapp_message():
    payload = request.get_json(silent=True) or {}
    phone = payload.get("phone")
    message = payload.get("message")
    if not phone or not message:
        return jsonify({"detail": "phone e message são obrigatórios"}), 400

    result = whatsapp_service.send_message(phone, message)
    return jsonify(result)

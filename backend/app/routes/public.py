from flask import Blueprint, jsonify

public_bp = Blueprint("public", __name__)


@public_bp.get("/")
def root():
    return jsonify({"message": "Matheus Barber API"})


@public_bp.get("/health")
def health_check():
    return jsonify({"status": "healthy", "message": "Matheus Barber API funcionando"})

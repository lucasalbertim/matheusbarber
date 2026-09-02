from functools import wraps
from flask import request, g

from .errors import ApiError
from .security import verify_token, verify_client_token
from .services.admin_service import admin_service
from .database import get_db


def _bearer_token() -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ", 1)[1].strip()
    return token or None


def _load_admin():
    """Devolve o admin autenticado, ou None."""
    token = _bearer_token()
    if not token:
        return None

    username = verify_token(token)
    if not username:
        return None

    with get_db() as db:
        return admin_service.get_admin_by_username(db, username)


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        admin = _load_admin()
        if not admin:
            raise ApiError("Could not validate credentials", 401)

        g.current_admin = admin
        return fn(*args, **kwargs)

    return wrapper


def optional_admin(fn):
    """
    Não exige autenticação, mas identifica o admin quando houver token válido.

    Usado em endpoints que precisam servir tanto a área do cliente quanto o painel:
    sem token, a resposta é reduzida e sem dados pessoais.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        g.current_admin = _load_admin()
        return fn(*args, **kwargs)

    return wrapper


def require_client(fn):
    """Exige um token de cliente válido. Popula g.current_client_id."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _bearer_token()
        if not token:
            raise ApiError("Autenticação necessária", 401)

        client_id = verify_client_token(token)
        if client_id is None:
            raise ApiError("Sessão inválida ou expirada", 401)

        g.current_client_id = client_id
        return fn(*args, **kwargs)

    return wrapper


def require_client_self(fn):
    """
    Exige token de cliente E que o recurso pedido seja do próprio cliente.

    Fecha o IDOR: antes, GET/PUT /api/clients/<id> e /clients/<id>/attendances eram
    públicos com ID sequencial, então um laço de 1 a N extraía a base inteira —
    nome, telefone, email, data de nascimento e histórico de consumo.

    Responde 404 (e não 403) para recurso de outra pessoa: um 403 confirmaria que
    aquele ID existe, mantendo o oráculo de enumeração aberto.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        token = _bearer_token()
        if not token:
            raise ApiError("Autenticação necessária", 401)

        client_id = verify_client_token(token)
        if client_id is None:
            raise ApiError("Sessão inválida ou expirada", 401)

        requested_id = kwargs.get("client_id")
        if requested_id is not None and int(requested_id) != client_id:
            raise ApiError("Cliente não encontrado", 404)

        g.current_client_id = client_id
        return fn(*args, **kwargs)

    return wrapper

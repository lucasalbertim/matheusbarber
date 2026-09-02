from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from .settings import settings

ALGORITHM = "HS256"

# Tipos de token. O claim "typ" impede confusão de token: um token de cliente
# não pode ser apresentado onde se espera um token de administrador, e vice-versa.
TOKEN_TYPE_ADMIN = "admin"
TOKEN_TYPE_CLIENT = "client"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Token de administrador."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire, "typ": TOKEN_TYPE_ADMIN})
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)


def create_client_token(client_id: int, expires_delta: timedelta | None = None) -> str:
    """
    Token de cliente.

    Antes desta correção não existia token de cliente algum: a "sessão" era um JSON
    no localStorage e os endpoints de cliente eram públicos, o que permitia ler e
    alterar os dados de qualquer pessoa trocando o ID na URL.
    """
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=12))
    payload = {"sub": str(client_id), "exp": expire, "typ": TOKEN_TYPE_CLIENT}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def _decode(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    except Exception:
        return None


def verify_token(token: str) -> str | None:
    """Valida um token de administrador e devolve o username."""
    payload = _decode(token)
    if not payload:
        return None
    if payload.get("typ") != TOKEN_TYPE_ADMIN:
        return None
    return payload.get("sub")


def verify_client_token(token: str) -> int | None:
    """Valida um token de cliente e devolve o ID do cliente."""
    payload = _decode(token)
    if not payload:
        return None
    if payload.get("typ") != TOKEN_TYPE_CLIENT:
        return None
    try:
        return int(payload.get("sub"))
    except (TypeError, ValueError):
        return None

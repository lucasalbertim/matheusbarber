from functools import wraps
from flask import request, g

from .errors import ApiError
from .security import verify_token
from .services.admin_service import admin_service
from .database import get_db


def require_admin(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            raise ApiError("Could not validate credentials", 401)

        token = auth_header.split(" ", 1)[1].strip()
        username = verify_token(token)
        if not username:
            raise ApiError("Could not validate credentials", 401)

        with get_db() as db:
            admin = admin_service.get_admin_by_username(db, username)
            if not admin:
                raise ApiError("Could not validate credentials", 401)

        g.current_admin = admin
        return fn(*args, **kwargs)

    return wrapper

from .public import public_bp
from .clients import clients_bp
from .admins import admins_bp
from .admin_clients import admin_clients_bp
from .services import services_bp
from .attendance import attendance_bp
from .reports import reports_bp
from .config import config_bp
from .whatsapp import whatsapp_bp
from .scheduled_attendance import scheduled_bp


def register_routes(app):
    app.register_blueprint(public_bp)
    for blueprint in (
        clients_bp,
        admins_bp,
        admin_clients_bp,
        services_bp,
        attendance_bp,
        reports_bp,
        config_bp,
        whatsapp_bp,
        scheduled_bp,
    ):
        app.register_blueprint(blueprint, url_prefix="/api")

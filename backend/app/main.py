import logging

from flask import Flask
from flask_cors import CORS

from .settings import settings
from .errors import register_error_handlers
from .routes import register_routes

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}


def create_app() -> Flask:
    logging.basicConfig(level=logging.INFO)

    # Falha imediata em produção com segredo padrão, antes de servir qualquer request.
    settings.validate_runtime()

    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    cors_config = settings.get_cors_config()
    CORS(app, resources={r"/api/*": cors_config})

    register_error_handlers(app)
    register_routes(app)

    @app.after_request
    def apply_security_headers(response):
        """
        A API não definia nenhum cabeçalho de segurança — nem no Flask, nem no Nginx,
        nem na Vercel. A aplicação podia ser carregada em iframe.
        """
        for header, value in SECURITY_HEADERS.items():
            response.headers.setdefault(header, value)

        if settings.is_production:
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
            )

        return response

    return app

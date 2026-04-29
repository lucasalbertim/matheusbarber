from flask import Flask
from flask_cors import CORS

from .settings import settings
from .errors import register_error_handlers
from .routes import register_routes


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    # Configure CORS with support for CORS_ORIGINS and CORS_ORIGIN_REGEX
    cors_config = settings.get_cors_config()
    CORS(app, resources={r"/api/*": cors_config})
    
    register_error_handlers(app)
    register_routes(app)

    return app

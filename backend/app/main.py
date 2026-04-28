from flask import Flask
from flask_cors import CORS

from .settings import settings
from .errors import register_error_handlers
from .routes import register_routes


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JSON_SORT_KEYS"] = False

    CORS(app, resources={r"/api/*": {"origins": settings.cors_list()}})
    register_error_handlers(app)
    register_routes(app)

    return app

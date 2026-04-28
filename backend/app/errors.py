from flask import jsonify
from pydantic import ValidationError


class ApiError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def register_error_handlers(app):
    @app.errorhandler(ApiError)
    def handle_api_error(error: ApiError):
        return jsonify({"detail": error.message}), error.status_code

    @app.errorhandler(ValidationError)
    def handle_validation_error(error: ValidationError):
        return jsonify({"detail": error.errors()}), 422

    @app.errorhandler(404)
    def handle_not_found(_error):
        return jsonify({"detail": "Not Found"}), 404

    @app.errorhandler(405)
    def handle_not_allowed(_error):
        return jsonify({"detail": "Method Not Allowed"}), 405

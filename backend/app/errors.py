import logging

from flask import jsonify
from pydantic import ValidationError
from werkzeug.exceptions import HTTPException

logger = logging.getLogger(__name__)


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

    @app.errorhandler(HTTPException)
    def handle_http_exception(error: HTTPException):
        return jsonify({"detail": error.description}), error.code

    @app.errorhandler(Exception)
    def handle_unexpected(error: Exception):
        """
        Rede de segurança para qualquer exceção não prevista.

        Antes não existia este handler: entradas como `?limit=abc` (int() sem try)
        chegavam ao Werkzeug e devolviam HTML onde o cliente espera JSON, e as
        mensagens do SQLAlchemy podiam revelar nomes de tabela e coluna.

        O detalhe fica no log do servidor; o cliente recebe uma mensagem genérica.
        """
        logger.exception("Erro não tratado: %s", type(error).__name__)
        return jsonify({"detail": "Erro interno. Tente novamente."}), 500

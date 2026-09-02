"""
Limite de tentativas em memória.

Antes desta correção não havia limite algum: /admins/login aceitava tentativas
ilimitadas contra senhas que o backend nem exigia que fossem fortes, e
/clients/login permitia enumerar quais telefones estavam cadastrados.

Implementação deliberadamente simples: janela deslizante em memória do processo.
É suficiente porque o backend roda como um serviço único; com múltiplas instâncias
o limite passa a valer por instância, o que ainda reduz a força bruta em ordens de
grandeza. Não justifica adicionar Redis a este sistema legado.
"""

import time
from functools import wraps
from threading import Lock

from flask import request

from .errors import ApiError

_attempts: dict[tuple[str, str], list[float]] = {}
_lock = Lock()

# Evita crescimento indefinido do dicionário sob varredura de IPs.
_MAX_TRACKED_KEYS = 10_000


def _client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "desconhecido"


def _prune(now: float, window_seconds: int) -> None:
    """Remove janelas expiradas. Chamado com o lock já adquirido."""
    cutoff = now - window_seconds
    vazios = []
    for key, hits in _attempts.items():
        hits[:] = [t for t in hits if t > cutoff]
        if not hits:
            vazios.append(key)
    for key in vazios:
        del _attempts[key]


def rate_limit(bucket: str, limit: int, window_seconds: int):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = (bucket, _client_ip())
            now = time.time()

            with _lock:
                if len(_attempts) > _MAX_TRACKED_KEYS:
                    _prune(now, window_seconds)

                hits = _attempts.setdefault(key, [])
                cutoff = now - window_seconds
                hits[:] = [t for t in hits if t > cutoff]

                if len(hits) >= limit:
                    raise ApiError(
                        "Muitas tentativas. Aguarde alguns minutos e tente novamente.", 429
                    )

                hits.append(now)

            return fn(*args, **kwargs)

        return wrapper

    return decorator


def reset_rate_limits() -> None:
    """Apenas para testes e operação."""
    with _lock:
        _attempts.clear()

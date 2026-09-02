import os
import re

from pydantic_settings import BaseSettings

_INSECURE_SECRET = "change-me"


class Settings(BaseSettings):
    env: str = "development"
    environment: str = "development"
    database_url: str
    secret_key: str = _INSECURE_SECRET
    access_token_expire_minutes: int = 30
    cors_origins: str = "http://localhost:3000"
    cors_origin_regex: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"

    @property
    def is_production(self) -> bool:
        return (self.environment or self.env or "").lower() == "production"

    def validate_runtime(self) -> None:
        """
        Recusa iniciar em produção com o segredo padrão.

        Antes, `secret_key` tinha default "change-me" e a aplicação subia normalmente
        sem a variável definida — qualquer pessoa poderia forjar um token de
        administrador com uma chave publicada no repositório.
        """
        if self.is_production and (
            not self.secret_key or self.secret_key == _INSECURE_SECRET or len(self.secret_key) < 32
        ):
            raise RuntimeError(
                "SECRET_KEY ausente, padrão ou curta demais em produção. "
                "Defina uma chave de no mínimo 32 caracteres aleatórios."
            )

    def cors_list(self) -> list:
        """Converte CORS_ORIGINS em lista de origens."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def get_cors_config(self) -> dict:
        """
        Configuração de CORS.

        Duas correções em relação ao comportamento anterior:

        1. A regex SOMAVA-SE à allowlist em vez de substituí-la. Antes, definir
           CORS_ORIGIN_REGEX descartava silenciosamente CORS_ORIGINS — configurar a
           regex para os previews da Vercel derrubava a origem de produção.

        2. A regex agora é ancorada no fim. O valor sugerido no .env.example era
           `https://.*\\.vercel\\.app`, sem `$`; como o flask-cors avalia com
           re.match (que ancora só o início), um host como
           `https://x.vercel.app.dominio-do-atacante.com` casava e recebia
           Access-Control-Allow-Origin.
        """
        origins: list = list(self.cors_list())

        if self.cors_origin_regex:
            pattern = self.cors_origin_regex
            if not pattern.endswith("$"):
                pattern = pattern + "$"
            origins.append(re.compile(pattern))

        return {"origins": origins}


settings = Settings()

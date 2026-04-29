from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    env: str = "development"
    database_url: str
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 30
    cors_origins: str = "http://localhost:3000"
    cors_origin_regex: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False

    def cors_list(self) -> list:
        """Parse CORS_ORIGINS string into list of origins"""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    def get_cors_config(self) -> dict:
        """Return CORS configuration for flask-cors"""
        config = {"origins": self.cors_list()}
        if self.cors_origin_regex:
            config["origins"] = self.cors_origin_regex
        return config


settings = Settings()

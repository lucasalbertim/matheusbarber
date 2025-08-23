from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
import os
import time
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuração do banco de dados
DATABASE_URL = os.getenv("DATABASE_URL")

def wait_for_database(max_retries=30, delay=2):
    """Aguarda o banco de dados estar disponível"""
    logger.info("⏳ Aguardando banco de dados estar disponível...")
    
    for attempt in range(max_retries):
        try:
            # Tenta criar uma conexão temporária
            temp_engine = create_engine(DATABASE_URL, echo=False)
            with temp_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            temp_engine.dispose()
            logger.info("✅ Banco de dados conectado com sucesso!")
            return True
        except Exception as e:
            logger.warning(f"⚠️ Tentativa {attempt + 1}/{max_retries}: Banco não disponível ainda... ({e})")
            if attempt < max_retries - 1:
                time.sleep(delay)
            else:
                logger.error("❌ Falha ao conectar com o banco após todas as tentativas")
                raise e
    return False

# Cria o engine principal (sem tentar conectar ainda)
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
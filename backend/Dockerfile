FROM python:3.11-slim

WORKDIR /app

# Instala o cliente PostgreSQL para o script de inicialização
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Torna o script executável
RUN chmod +x start.sh

# Usa o script de inicialização
CMD ["./start.sh"]
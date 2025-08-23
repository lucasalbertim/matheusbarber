#!/bin/bash

echo "🚀 Iniciando Matheus Barber Backend..."

# Função para aguardar o banco estar pronto
wait_for_postgres() {
    echo "⏳ Aguardando PostgreSQL estar disponível..."
    
    until pg_isready -h postgres -U postgres -d metheus_barber; do
        echo "⚠️ PostgreSQL ainda não está pronto... aguardando 2 segundos"
        sleep 2
    done
    
    echo "✅ PostgreSQL está pronto!"
}

# Aguarda o banco estar disponível
wait_for_postgres

# Inicia a aplicação
echo "🚀 Iniciando FastAPI..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
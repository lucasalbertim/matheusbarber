#!/bin/bash

echo "🚀 Iniciando Matheus Barber Backend..."

# Função para aguardar o banco estar pronto
wait_for_postgres() {
    echo "⏳ Aguardando PostgreSQL estar disponível..."
    
    # Aguarda até 60 segundos (30 tentativas x 2 segundos)
    for i in {1..30}; do
        if pg_isready -h postgres -U postgres -d metheus_barber > /dev/null 2>&1; then
            echo "✅ PostgreSQL está pronto!"
            return 0
        fi
        echo "⚠️ Tentativa $i/30: PostgreSQL ainda não está pronto... aguardando 2 segundos"
        sleep 2
    done
    
    echo "❌ Timeout: PostgreSQL não ficou disponível em 60 segundos"
    return 1
}

# Aguarda o banco estar disponível
if wait_for_postgres; then
    # Inicia a aplicação
    echo "🚀 Iniciando FastAPI..."
    exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
else
    echo "❌ Falha ao aguardar PostgreSQL. Saindo..."
    exit 1
fi
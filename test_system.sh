#!/bin/bash

echo "🧪 TESTANDO SISTEMA METHEUS BARBER"
echo "=================================="

# Verificar se Docker está rodando
echo "📦 Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi
echo "✅ Docker está rodando"

# Verificar se docker-compose está disponível
echo "🐳 Verificando docker-compose..."
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não encontrado. Instale e tente novamente."
    exit 1
fi
echo "✅ docker-compose disponível"

# Testar build do frontend
echo "🎨 Testando build do frontend..."
cd frontend
if npm run build; then
    echo "✅ Frontend buildado com sucesso"
else
    echo "❌ Erro no build do frontend"
    exit 1
fi
cd ..

# Verificar se o build foi criado
if [ ! -d "frontend/build" ]; then
    echo "❌ Pasta build não foi criada"
    exit 1
fi

# Verificar se manifest.json existe
if [ ! -f "frontend/public/manifest.json" ]; then
    echo "❌ manifest.json não encontrado"
    exit 1
fi
echo "✅ manifest.json encontrado"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Construir e subir o sistema
echo "🚀 Construindo e subindo o sistema..."
docker-compose up --build -d

# Aguardar sistema subir
echo "⏳ Aguardando sistema subir..."
sleep 30

# Testar backend
echo "🔧 Testando backend..."
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ Backend respondendo na porta 8000"
else
    echo "❌ Backend não está respondendo"
    docker-compose logs backend
    exit 1
fi

# Testar frontend
echo "🎨 Testando frontend..."
if curl -s http://localhost:3000/ > /dev/null; then
    echo "✅ Frontend respondendo na porta 3000"
else
    echo "❌ Frontend não está respondendo"
    docker-compose logs frontend
    exit 1
fi

# Testar API
echo "🔌 Testando API..."
if curl -s http://localhost:8000/docs > /dev/null; then
    echo "✅ Documentação da API acessível"
else
    echo "❌ API não está funcionando corretamente"
fi

echo ""
echo "🎉 SISTEMA TESTADO COM SUCESSO!"
echo "================================"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Para ver os logs: docker-compose logs -f"
echo "Para parar: docker-compose down"
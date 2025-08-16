#!/bin/bash

echo "🚀 Configurando sistema Matheus Barber..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

echo "✅ Docker e Docker Compose encontrados"

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi

# Construir e iniciar os containers
echo "🐳 Construindo e iniciando containers..."
docker-compose up --build -d

# Aguardar os serviços estarem prontos
echo "⏳ Aguardando serviços estarem prontos..."
sleep 30

# Verificar se os serviços estão rodando
echo "🔍 Verificando status dos serviços..."
docker-compose ps

# Inicializar banco de dados
echo "🗄️  Inicializando banco de dados..."
docker-compose exec -T backend python init_db.py

echo ""
echo "🎉 Sistema Matheus Barber configurado com sucesso!"
echo ""
echo "📱 Acesse o sistema em:"
echo "   • Frontend: http://localhost:3000"
echo "   • Backend API: http://localhost:8000"
echo "   • Documentação API: http://localhost:8000/docs"
echo ""
echo "👨‍💻 Credenciais administrativas:"
echo "   • Username: admin"
echo "   • Senha: admin123"
echo ""
echo "⚠️  IMPORTANTE: Altere a senha do admin após o primeiro login!"
echo ""
echo "📚 Para mais informações, consulte o README.md"
echo ""
echo "🛑 Para parar o sistema: docker-compose down"
echo "🔄 Para reiniciar: docker-compose restart"
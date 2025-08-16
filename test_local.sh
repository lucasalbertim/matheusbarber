#!/bin/bash

echo "🧪 TESTANDO SISTEMA METHEUS BARBER (LOCAL)"
echo "=========================================="

# Verificar se Node.js está instalado
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ e tente novamente."
    exit 1
fi
echo "✅ Node.js encontrado: $(node --version)"

# Verificar se npm está instalado
echo "📦 Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm e tente novamente."
    exit 1
fi
echo "✅ npm encontrado: $(npm --version)"

# Verificar se Python está instalado
echo "🐍 Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale Python 3.11+ e tente novamente."
    exit 1
fi
echo "✅ Python encontrado: $(python3 --version)"

# Verificar se pip está instalado
echo "📦 Verificando pip..."
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 não encontrado. Instale pip3 e tente novamente."
    exit 1
fi
echo "✅ pip3 encontrado: $(pip3 --version)"

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

# Verificar se requirements.txt existe
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ requirements.txt não encontrado"
    exit 1
fi
echo "✅ requirements.txt encontrado"

# Verificar se pyjwt está nos requirements
if grep -q "pyjwt" backend/requirements.txt; then
    echo "✅ pyjwt encontrado nos requirements"
else
    echo "❌ pyjwt não encontrado nos requirements"
fi

# Verificar se pydantic[email] está nos requirements
if grep -q "pydantic\[email\]" backend/requirements.txt; then
    echo "✅ pydantic[email] encontrado nos requirements"
else
    echo "❌ pydantic[email] não encontrado nos requirements"
fi

echo ""
echo "🎉 TESTES LOCAIS CONCLUÍDOS!"
echo "============================="
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Instalar dependências do backend:"
echo "   cd backend && pip3 install -r requirements.txt"
echo ""
echo "2. Configurar banco de dados PostgreSQL"
echo "3. Executar backend:"
echo "   cd backend && python3 main.py"
echo ""
echo "4. Executar frontend (em outro terminal):"
echo "   cd frontend && npm start"
echo ""
echo "5. Acessar:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
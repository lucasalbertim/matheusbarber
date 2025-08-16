#!/bin/bash

echo "🚀 TESTE RÁPIDO - CORREÇÕES IMPLEMENTADAS"
echo "=========================================="

# Verificar se as correções foram aplicadas
echo "🔍 Verificando correções..."

# 1. Verificar se proxy foi removido do package.json
if grep -q '"proxy"' frontend/package.json; then
    echo "❌ Proxy ainda está no package.json"
else
    echo "✅ Proxy removido do package.json"
fi

# 2. Verificar se setupProxy.js foi criado
if [ -f "frontend/src/setupProxy.js" ]; then
    echo "✅ setupProxy.js criado"
else
    echo "❌ setupProxy.js não encontrado"
fi

# 3. Verificar se http-proxy-middleware foi instalado
if [ -d "frontend/node_modules/http-proxy-middleware" ]; then
    echo "✅ http-proxy-middleware instalado"
else
    echo "❌ http-proxy-middleware não instalado"
fi

# 4. Verificar se .env foi criado
if [ -f "frontend/.env" ]; then
    echo "✅ .env criado com REACT_APP_API_URL"
else
    echo "❌ .env não encontrado"
fi

# 5. Verificar se manifest.json existe
if [ -f "frontend/public/manifest.json" ]; then
    echo "✅ manifest.json existe"
else
    echo "❌ manifest.json não encontrado"
fi

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Parar frontend e backend (Ctrl+C)"
echo "2. Executar: cd frontend && npm start"
echo "3. Executar: cd backend && python3 main.py"
echo "4. Verificar se manifest.json carrega sem erro"
echo "5. Verificar se API funciona corretamente"
echo ""
echo "🎯 O manifest.json agora deve carregar do próprio frontend!"
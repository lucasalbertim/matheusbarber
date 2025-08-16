# 🧪 Testes do Sistema Metheus Barber

## 📋 Checklist de Testes

### ✅ **Backend - Testes Realizados:**
- [x] **Requirements atualizados**: `pyjwt` e `pydantic[email]` adicionados
- [x] **Configuração CORS**: Permitindo todas as origens para desenvolvimento
- [x] **Servir arquivos estáticos**: Configurado para servir o frontend build
- [x] **Rota raiz**: Configurada para servir o index.html do frontend
- [x] **Dockerfile atualizado**: Incluindo build do frontend

### ✅ **Frontend - Testes Realizados:**
- [x] **manifest.json**: Criado e configurado corretamente
- [x] **Build do projeto**: Executado com sucesso
- [x] **Pasta build**: Criada corretamente
- [x] **Arquivos estáticos**: Gerados e organizados

### 🔧 **Testes de Integração:**

#### **1. Teste do Backend:**
```bash
# Instalar dependências
cd backend
pip3 install -r requirements.txt

# Executar backend
python3 main.py
```

**Verificações:**
- [ ] Backend inicia sem erros
- [ ] API responde na porta 8000
- [ ] Documentação acessível em `/docs`
- [ ] CORS funcionando corretamente

#### **2. Teste do Frontend:**
```bash
# Em outro terminal
cd frontend
npm start
```

**Verificações:**
- [ ] Frontend inicia sem erros
- [ ] Tela inicial carrega corretamente
- [ ] Sem erros no console do navegador
- [ ] Rotas funcionando (login, cadastro, etc.)

#### **3. Teste de Build:**
```bash
cd frontend
npm run build
```

**Verificações:**
- [ ] Build executado com sucesso
- [ ] Pasta `build/` criada
- [ ] Arquivos estáticos gerados
- [ ] `manifest.json` incluído no build

#### **4. Teste de Integração Backend-Frontend:**
```bash
# Com backend rodando
curl http://localhost:8000/
# Deve retornar o index.html do frontend

curl http://localhost:8000/static/js/main.*.js
# Deve retornar o arquivo JavaScript principal
```

## 🐳 **Testes com Docker:**

### **1. Build e Execução:**
```bash
# Construir e executar
docker-compose up --build -d

# Verificar logs
docker-compose logs -f

# Testar endpoints
curl http://localhost:8000/
curl http://localhost:3000/
```

### **2. Verificações Docker:**
- [ ] Containers iniciando corretamente
- [ ] Backend respondendo na porta 8000
- [ ] Frontend respondendo na porta 3000
- [ ] Banco PostgreSQL funcionando
- [ ] Volumes montados corretamente

## 🚨 **Problemas Comuns e Soluções:**

### **Backend não inicia:**
```bash
# Verificar dependências
pip3 install -r requirements.txt

# Verificar variáveis de ambiente
cp .env.example .env
# Editar .env com valores corretos

# Verificar banco de dados
# PostgreSQL deve estar rodando
```

### **Frontend não carrega:**
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar build
npm run build

# Verificar console do navegador
# F12 -> Console -> Verificar erros
```

### **Erro de CORS:**
```bash
# Verificar configuração CORS no backend
# Verificar se frontend está rodando na porta correta
# Verificar se backend está permitindo a origem correta
```

### **Erro de manifest.json:**
```bash
# Verificar se arquivo existe
ls -la frontend/public/manifest.json

# Verificar se está referenciado no index.html
grep -n "manifest" frontend/public/index.html
```

## 📊 **Métricas de Teste:**

### **Performance:**
- [ ] Backend responde em < 500ms
- [ ] Frontend carrega em < 3s
- [ ] Build executa em < 2min
- [ ] API endpoints respondem em < 1s

### **Funcionalidade:**
- [ ] Login de cliente funcionando
- [ ] Login de admin funcionando
- [ ] Cadastro de cliente funcionando
- [ ] Navegação entre páginas funcionando
- [ ] Formulários validando corretamente

### **Segurança:**
- [ ] CORS configurado corretamente
- [ ] JWT funcionando para admin
- [ ] Validações de entrada funcionando
- [ ] Rotas protegidas funcionando

## 🎯 **Próximos Passos:**

1. **Executar testes de integração** com backend e frontend rodando
2. **Testar todas as funcionalidades** do sistema
3. **Verificar logs** para identificar possíveis problemas
4. **Testar em diferentes navegadores** para compatibilidade
5. **Testar responsividade** em diferentes tamanhos de tela

## 📞 **Suporte:**

Se encontrar problemas durante os testes:
1. Verificar logs do sistema
2. Consultar este documento
3. Verificar configurações de ambiente
4. Testar componentes individualmente
5. Verificar dependências e versões
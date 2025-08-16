# 🚀 Instruções de Execução - Matheus Barber

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Portas 3000, 8000 e 5432 disponíveis
- Git instalado

## 🛠️ Passo a Passo para Execução

### 1. Clone e Navegação
```bash
# Clone o repositório (se ainda não fez)
git clone <url-do-repositorio>
cd metheus-barber

# Verifique se está no diretório correto
ls -la
# Deve mostrar: backend/, frontend/, docker-compose.yml, README.md
```

### 2. Configuração do Ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as variáveis (opcional para desenvolvimento)
nano .env
```

**Para desenvolvimento, você pode deixar as variáveis padrão:**
```env
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/metheus_barber
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_PHONE_NUMBER=your-whatsapp-phone-number
REACT_APP_API_URL=http://localhost:8000
```

### 3. Execução com Docker
```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Aguarde a mensagem de sucesso:
# ✅ Backend rodando em http://localhost:8000
# ✅ Frontend rodando em http://localhost:3000
# ✅ PostgreSQL rodando em localhost:5432
```

**Se preferir executar em background:**
```bash
docker-compose up -d --build
```

### 4. Verificação dos Serviços
```bash
# Verificar status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 5. Inicialização do Banco de Dados
```bash
# Em um novo terminal, execute:
docker-compose exec backend python init_db.py

# Você deve ver:
# ✅ Administrador criado com sucesso!
# ✅ Serviços de exemplo criados com sucesso!
```

### 6. Acesso ao Sistema

#### 🌐 Frontend (Cliente)
- **URL**: http://localhost:3000
- **Funcionalidades**: 
  - Página inicial com opções
  - Login/Cadastro de clientes
  - Dashboard do cliente

#### 🔧 Backend (API)
- **URL**: http://localhost:8000
- **Documentação**: http://localhost:8000/docs
- **Funcionalidades**: Todas as APIs do sistema

#### 👨‍💻 Área Administrativa
- **URL**: http://localhost:3000/admin/login
- **Credenciais padrão**:
  - Username: `admin`
  - Senha: `admin123`

## 🧪 Testando o Sistema

### Teste 1: Fluxo do Cliente
1. Acesse http://localhost:3000
2. Clique em "Sou Cliente"
3. Clique em "Cadastro"
4. Preencha os dados:
   - Nome: João Silva
   - CPF: 123.456.789-00
   - Telefone: (11) 99999-9999
   - Email: joao@email.com
5. Clique em "Cadastrar"
6. Você será redirecionado para o dashboard do cliente

### Teste 2: Fluxo Administrativo
1. Acesse http://localhost:3000/admin/login
2. Use as credenciais:
   - Username: `admin`
   - Senha: `admin123`
3. Você será redirecionado para o dashboard administrativo
4. Explore as funcionalidades disponíveis

### Teste 3: API
1. Acesse http://localhost:8000/docs
2. Teste as APIs disponíveis
3. Use o token JWT retornado no login para autenticar

## 🔧 Desenvolvimento Local

### Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
```

## 🐛 Solução de Problemas

### Problema: Porta já em uso
```bash
# Verificar processos usando as portas
lsof -i :3000
lsof -i :8000
lsof -i :5432

# Parar processos se necessário
kill -9 <PID>
```

### Problema: Container não inicia
```bash
# Ver logs detalhados
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Reconstruir containers
docker-compose down
docker-compose up --build
```

### Problema: Banco não conecta
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Reiniciar apenas o PostgreSQL
docker-compose restart postgres
```

### Problema: Dependências não instalam
```bash
# Limpar cache do Docker
docker system prune -a

# Reconstruir sem cache
docker-compose build --no-cache
```

## 📱 Funcionalidades WhatsApp

### Para Desenvolvimento
- O sistema simula o envio de mensagens
- Verifique os logs do backend para ver as mensagens simuladas

### Para Produção
1. Configure uma conta WhatsApp Business API
2. Atualize as variáveis de ambiente
3. O sistema enviará mensagens reais

## 🚀 Deploy em Produção

### 1. Configuração de Produção
```bash
# Atualize o .env com valores de produção
SECRET_KEY=chave-super-secreta-producao
DATABASE_URL=postgresql://user:pass@host:5432/db
WHATSAPP_API_KEY=chave-whatsapp-producao
WHATSAPP_PHONE_NUMBER=numero-producao
```

### 2. Execução
```bash
# Em produção, use:
docker-compose -f docker-compose.prod.yml up -d
```

### 3. SSL/HTTPS
- Configure um proxy reverso (nginx)
- Configure certificados SSL
- Atualize as URLs no frontend

## 📊 Monitoramento

### Logs
```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
```

### Status dos Serviços
```bash
# Verificar saúde dos containers
docker-compose ps

# Ver uso de recursos
docker stats
```

## 🔒 Segurança

### Credenciais Padrão
- **IMPORTANTE**: Altere a senha do admin após o primeiro login
- Use senhas fortes em produção
- Configure HTTPS em produção

### Variáveis de Ambiente
- Nunca commite o arquivo `.env` no Git
- Use diferentes chaves para desenvolvimento e produção
- Rotacione as chaves regularmente

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `docker-compose logs`
2. Consulte a documentação da API: http://localhost:8000/docs
3. Abra uma issue no GitHub
4. Entre em contato com a equipe de desenvolvimento

---

**🎉 Sistema Matheus Barber executando com sucesso!**
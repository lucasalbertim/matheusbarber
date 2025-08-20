# 🪒 Matheus Barber - Sistema de Gerenciamento

Sistema web completo para gerenciamento de barbearia, desenvolvido com React (frontend) e FastAPI (backend), integrado com PostgreSQL e funcionalidades de WhatsApp.

## ✨ Funcionalidades

### 🧑‍💼 Área do Cliente
- **Login/Cadastro**: Identificação via CPF ou telefone (sem senha)
- **Dashboard**: Visualização de informações pessoais e histórico
- **Mensagens automáticas**: Recebimento de boas-vindas via WhatsApp
- **Interface responsiva**: Otimizada para mobile, tablet e desktop

### 👨‍💻 Área Administrativa
- **Autenticação segura**: Login com username e senha (JWT)
- **Gestão de Clientes**: Cadastro, edição, exclusão e listagem
- **Gestão de Serviços**: Controle de serviços oferecidos
- **Painel de Atendimentos**: Controle em tempo real dos agendamentos
- **Relatórios**: Métricas de clientes, receita e atendimentos
- **Integração WhatsApp**: Envio de mensagens automáticas

## 🏗️ Arquitetura

```
metheus-barber/
├── backend/                 # API FastAPI
│   ├── models.py           # Modelos SQLAlchemy
│   ├── schemas.py          # Schemas Pydantic
│   ├── services/           # Lógica de negócio
│   ├── auth.py             # Autenticação JWT
│   └── main.py             # Aplicação principal
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Contextos React
│   │   └── services/       # Serviços de API
│   └── public/             # Arquivos estáticos
└── docker-compose.yml      # Orquestração Docker
```

## 🚀 Tecnologias

### Backend
- **FastAPI**: Framework web moderno e rápido
- **PostgreSQL**: Banco de dados relacional
- **SQLAlchemy**: ORM para Python
- **Pydantic**: Validação de dados
- **JWT**: Autenticação segura
- **WhatsApp API**: Integração para mensagens

### Frontend
- **React 18**: Biblioteca para interfaces
- **Styled Components**: CSS-in-JS
- **React Router**: Navegação SPA
- **Axios**: Cliente HTTP
- **React Toastify**: Notificações

### DevOps
- **Docker**: Containerização
- **Docker Compose**: Orquestração de serviços

## 📋 Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Python 3.11+ (para desenvolvimento local)

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd metheus-barber
```

### 2. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as variáveis necessárias
nano .env
```

**Variáveis obrigatórias:**
```env
# Backend
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/metheus_barber

# WhatsApp (opcional para desenvolvimento)
WHATSAPP_API_KEY=sua-chave-api-whatsapp
WHATSAPP_PHONE_NUMBER=seu-numero-whatsapp
```

### 3. Execute com Docker
```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Ou em background
docker-compose up -d --build
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs

## 🔧 Desenvolvimento Local

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📱 Uso do Sistema

### Primeiro Acesso
1. **Criar Administrador**: Use a API para criar o primeiro admin
2. **Configurar Serviços**: Adicione os serviços da barbearia
3. **Cadastrar Clientes**: Os clientes podem se cadastrar ou fazer login

### Fluxo do Cliente
1. Acesse a página inicial
2. Clique em "Sou Cliente"
3. Faça login com CPF/telefone ou cadastre-se
4. Acesse seu dashboard pessoal

### Fluxo Administrativo
1. Acesse a página inicial
2. Clique em "Sou Administrador"
3. Faça login com suas credenciais
4. Gerencie clientes, serviços e atendimentos

## 🔐 Segurança

- **JWT**: Tokens de acesso para administradores
- **Validação**: Todos os dados são validados via Pydantic
- **CORS**: Configurado para permitir apenas origens autorizadas
- **Senhas**: Hash com bcrypt para administradores
- **Identificação**: Clientes identificados via CPF/telefone

## 📊 Banco de Dados

### Tabelas Principais
- **clients**: Cadastro de clientes
- **admins**: Usuários administrativos
- **services**: Serviços oferecidos
- **attendances**: Agendamentos e atendimentos

### Migrações
```bash
# Criar migração
alembic revision --autogenerate -m "descrição"

# Aplicar migrações
alembic upgrade head
```

## 📱 Integração WhatsApp

### Configuração
1. Obtenha uma conta WhatsApp Business API
2. Configure as variáveis de ambiente
3. O sistema enviará mensagens automáticas

### Mensagens Automáticas
- **Boas-vindas**: Para novos clientes
- **Retorno**: Para clientes que voltam
- **Marketing**: Para clientes inativos
- **Lembretes**: Para pagamentos pendentes

## 🧪 Testes

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## 📦 Deploy

### Produção
1. Configure variáveis de ambiente de produção
2. Use Docker Compose para deploy
3. Configure proxy reverso (nginx)
4. Configure SSL/HTTPS

### Variáveis de Produção
```env
SECRET_KEY=chave-super-secreta-producao
DATABASE_URL=postgresql://user:pass@host:5432/db
WHATSAPP_API_KEY=chave-whatsapp-producao
WHATSAPP_PHONE_NUMBER=numero-producao
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

## 🔄 Atualizações

### Versão 2.0.0
- ✅ Sistema básico de autenticação
- ✅ Gestão de clientes e administradores
- ✅ Painel de atendimentos
- ✅ Integração WhatsApp
- ✅ Interface responsiva

### Próximas Versões
- 📅 Sistema de agendamentos avançado
- 📅 Relatórios em tempo real
- 📅 App mobile
- 📅 Integração com sistemas de pagamento
- 📅 Analytics avançados

---

**Desenvolvido por [Albertim Tech Solution](https://github.com/lucasalbertim) para a Matheus Barber**

---

## 🏢 Desenvolvimento

**Albertim Tech Solution**  
Soluções tecnológicas personalizadas para seu negócio.

- 💻 Desenvolvimento Web e Mobile
- 🚀 Sistemas de Gestão Empresarial
- 🔧 Manutenção e Suporte Técnico
- 📱 Aplicações Personalizadas

**Contato:** [GitHub](https://github.com/lucasalbertim) | [LinkedIn](https://linkedin.com/in/lucasalbertim)

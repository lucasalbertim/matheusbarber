# 🪒 Matheus Barber - Sistema de Gerenciamento

**Versão 2.1.0** - Sistema web completo para gerenciamento de barbearia, desenvolvido com React (frontend) e FastAPI (backend), integrado com PostgreSQL e funcionalidades avançadas de gestão.

## ✨ Funcionalidades

### 🧑‍💼 Área do Cliente
- **Login/Cadastro**: Identificação via CPF ou telefone (sem senha)
- **Dashboard**: Visualização de informações pessoais e histórico
- **Criação de Atendimentos**: Seleção de serviços e forma de pagamento
- **Sistema de Fila**: Posição na fila de atendimento em tempo real
- **Mensagens automáticas**: Recebimento de boas-vindas via WhatsApp
- **Interface responsiva**: Otimizada para mobile, tablet e desktop

### 👨‍💻 Área Administrativa
- **Setup Inicial**: Primeiro login com configuração obrigatória
- **Autenticação segura**: Login com username e senha (JWT)
- **Gestão de Clientes**: 
  - Cadastro, edição, exclusão e listagem
  - Auto-inativação configurável
  - Exportação em Excel e PDF
  - Grid responsiva com filtros
- **Gestão de Serviços**: Controle de serviços oferecidos
- **Painel de Atendimentos**: 
  - Controle em tempo real dos atendimentos do dia
  - Sistema de cancelamento com motivo
  - Estatísticas precisas (apenas finalizados)
  - Filtros por status
- **Relatórios Avançados**: 
  - Métricas de clientes, receita e atendimentos
  - Gráficos de ganhos (diários, semanais, mensais, trimestrais, anuais)
  - Dashboard com crescimento percentual
  - Top clientes por atendimentos
- **Integração WhatsApp**: Envio de mensagens automáticas
- **Header Responsivo**: Menu hamburger para mobile e tablet

## 🏗️ Arquitetura

```
metheus-barber/
├── backend/                 # API FastAPI
│   ├── models.py           # Modelos SQLAlchemy
│   ├── schemas.py          # Schemas Pydantic
│   ├── services/           # Lógica de negócio
│   │   ├── admin_service.py
│   │   ├── client_service.py
│   │   ├── attendance_service.py
│   │   └── service_service.py
│   ├── auth.py             # Autenticação JWT
│   ├── main.py             # Aplicação principal
│   └── init_db.py          # Inicialização do banco
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Contextos React
│   │   ├── services/       # Serviços de API
│   │   └── utils/          # Utilitários
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

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
git clone https://github.com/lucasalbertim/matheusbarber.git
cd metheusbarber
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

### Primeiro Acesso - Administrador
1. **Credenciais Padrão**: 
   - **Login**: `admin`
   - **Senha**: `admin123`
2. **Setup Obrigatório**: Na primeira vez, você será redirecionado para configurar seus dados
3. **Atualização de Dados**: Altere username, email, nome e senha
4. **Configurar Serviços**: Adicione os serviços da barbearia

### Fluxo do Cliente
1. **Acesso**: Vá para a página inicial
2. **Login**: Clique em "Sou Cliente"
3. **Identificação**: Use CPF ou telefone (sem senha)
4. **Dashboard**: Acesse seu painel pessoal
5. **Novo Atendimento**: 
   - Selecione serviços
   - Escolha forma de pagamento
   - Veja sua posição na fila
   - Logout automático após 7 segundos

### Fluxo Administrativo
1. **Login**: Use suas credenciais de administrador
2. **Dashboard**: Visualize métricas em tempo real
3. **Gestão de Clientes**: 
   - Cadastre, edite ou exclua clientes
   - Configure auto-inativação
   - Exporte dados em Excel/PDF
4. **Gestão de Atendimentos**: 
   - Controle atendimentos do dia
   - Cancele atendimentos com motivo
   - Visualize estatísticas precisas
5. **Relatórios**: 
   - Analise ganhos por período
   - Visualize crescimento percentual
   - Identifique top clientes

## 🔐 Segurança

- **JWT**: Tokens de acesso para administradores
- **Validação**: Todos os dados são validados via Pydantic
- **CORS**: Configurado para permitir apenas origens autorizadas
- **Senhas**: Hash com bcrypt para administradores
- **Identificação**: Clientes identificados via CPF/telefone
- **Setup Seguro**: Primeiro login obrigatório para configuração

## 📊 Banco de Dados

### Tabelas Principais
- **clients**: Cadastro de clientes
- **admins**: Usuários administrativos (com is_first_login)
- **services**: Serviços oferecidos
- **attendances**: Agendamentos e atendimentos (com cancelamento)

### Migrações Automáticas
O sistema automaticamente:
- Cria as tabelas necessárias
- Adiciona colunas faltantes
- Cria administrador padrão
- Configura serviços iniciais

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

### Versão 2.1.0 (Atual)
- ✅ **Setup Inicial**: Primeiro login obrigatório para administrador
- ✅ **Sistema de Fila**: Posição na fila para clientes
- ✅ **Cancelamento**: Atendimentos com motivo obrigatório
- ✅ **Métricas Precisas**: Apenas atendimentos finalizados contam
- ✅ **Exportação**: Clientes em Excel e PDF
- ✅ **Auto-inativação**: Configurável por período
- ✅ **Header Responsivo**: Menu hamburger para mobile
- ✅ **Relatórios Avançados**: Gráficos de ganhos por período
- ✅ **Dashboard Melhorado**: Estatísticas em tempo real
- ✅ **Interface Otimizada**: Melhor experiência mobile

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

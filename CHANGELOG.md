# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Added
- Sistema completo de máscaras para CPF e telefone
- Validações robustas de CPF e telefone
- Tela de atendimento para clientes
- Sistema de gestão de atendimentos para administradores
- Controle de acesso e logout automático
- Redirecionamento inteligente baseado em autenticação

### Changed
- Refatoração completa do sistema de autenticação
- Atualização da interface de login e cadastro
- Melhorias na navegação e UX

### Fixed
- Correção de imports e dependências
- Resolução de warnings de ESLint
- Correção de ícones não disponíveis

## [1.1.1] - 2024-12-19

### Fixed
- **Proxy Error Resolvido**: Corrigido erro de proxy que causava falha no carregamento do manifest.json
- **Manifest.json**: Arquivo agora é servido corretamente pelo frontend
- **Proxy Seletivo**: Implementado proxy apenas para rotas da API, não para arquivos estáticos
- **CORS**: Configuração corrigida para desenvolvimento e produção
- **Integração Backend-Frontend**: Melhorada a comunicação entre os serviços

### Added
- **setupProxy.js**: Configuração de proxy seletivo para desenvolvimento
- **http-proxy-middleware**: Dependência para proxy inteligente
- **Arquivo .env**: Configuração de ambiente para URL da API
- **Rota /health**: Endpoint para verificar status da API

### Changed
- **package.json**: Removido proxy global, implementado proxy seletivo
- **Backend**: Configurado para servir apenas arquivos necessários
- **Docker**: Configuração atualizada para integração frontend-backend

## [1.1.0] - 2024-12-19

### Added
- Sistema completo de barbearia Metheus Barber
- Frontend React com design responsivo
- Backend FastAPI com PostgreSQL
- Sistema de autenticação JWT para administradores
- Sistema de identificação por CPF/telefone para clientes
- Gestão completa de clientes, serviços e atendimentos
- Integração com WhatsApp API
- Sistema de relatórios e métricas
- Docker e Docker Compose para desenvolvimento
- Migrações de banco com Alembic

### Features
- **Cliente**: Cadastro, login, seleção de serviços, agendamento
- **Administrador**: Dashboard, gestão de clientes, controle de atendimentos
- **Sistema**: Notificações, relatórios, métricas em tempo real

## [0.1.0] - 2024-12-19

### Added
- Estrutura inicial do projeto
- Configuração básica do ambiente
- Primeira implementação do frontend e backend
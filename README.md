# Matheus Barber

Sistema de gerenciamento para barbearia com **backend Flask** e **frontend React**. Suporta deploy em **VPS Ubuntu (Gunicorn + Nginx)** ou na nuvem com **Neon (PostgreSQL) + Render (Backend) + Vercel (Frontend)**. Cadastro de clientes via **telefone + data de nascimento**, com **email opcional**.

## Stack
- **Backend**: Flask, SQLAlchemy, Alembic, JWT
- **Frontend**: React 18 (CRA)
- **Banco**: PostgreSQL

## Estrutura
```
backend/
  app/
    main.py           # app factory
    models.py         # SQLAlchemy models
    schemas.py        # Pydantic schemas
    routes/           # Blueprints (API)
    services/         # Regras de negócio
    utils/            # Utilitários
  alembic/            # Migrações
  scripts/seed_db.py  # Seeds (admin, serviços, configs)
  wsgi.py             # Entrada Gunicorn
frontend/
  src/
deploy/
  nginx.conf
  gunicorn.conf.py
  matheusbarber.service
```

## Variáveis de Ambiente (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/matheus_barber
SECRET_KEY=troque-esta-chave
CORS_ORIGINS=http://localhost:3000
WHATSAPP_API_KEY=
WHATSAPP_PHONE_NUMBER=
REACT_APP_API_URL=/api
```

## Desenvolvimento Local

### Backend
```
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux
pip install -r requirements.txt

# Rodar migrações
alembic upgrade head

# Seed inicial (admin + serviços + configs)
python scripts/seed_db.py

# Servir API
flask --app app.main:create_app run --host 0.0.0.0 --port 8000
```

### Frontend
```
cd frontend
npm install
npm start
```

Frontend usa `/api` (proxy) e o backend responde em `/api/*`.

## Produção (VPS Ubuntu)

1. **Crie o venv e instale dependências**
```
python3 -m venv /var/www/matheusbarber/venv
source /var/www/matheusbarber/venv/bin/activate
pip install -r /var/www/matheusbarber/backend/requirements.txt
```

2. **Configure variáveis em /etc/matheusbarber/env**
```
DATABASE_URL=postgresql://user:pass@localhost:5432/matheus_barber
SECRET_KEY=chave-super-secreta
CORS_ORIGINS=https://matheusbarber.shop
WHATSAPP_API_KEY=...
WHATSAPP_PHONE_NUMBER=...
```

3. **Migrações + seed**
```
cd /var/www/matheusbarber/backend
/var/www/matheusbarber/venv/bin/alembic upgrade head
/var/www/matheusbarber/venv/bin/python scripts/seed_db.py
```

4. **Systemd + Nginx**
- `deploy/matheusbarber.service`
- `deploy/nginx.conf`

Habilite e reinicie:
```
sudo systemctl enable matheusbarber
sudo systemctl restart matheusbarber
sudo systemctl restart nginx
```

## Deploy Neon + Render + Vercel

### Backend (Render)
1. Fork o repositório para sua conta GitHub
2. Crie um novo **Web Service** no Render
3. Conecte ao repositório
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
   - **Environment Variables** (from .env.example):
      - `DATABASE_URL`: URL completa do Neon
      - `SECRET_KEY`: Chave segura
      - `CORS_ORIGINS`: URL do seu frontend Vercel
      - `CORS_ORIGIN_REGEX`: opcional (preview do Vercel), ex: `https://.*\.vercel\.app`
      - `ENVIRONMENT`: production
5. Deploy automático no push

### Banco (Neon)
1. Crie projeto no [neon.tech](https://neon.tech)
2. Copie a `CONNECTION_STRING` do Neon
3. Use como `DATABASE_URL` no Render

### Frontend (Vercel)
1. Crie novo projeto no Vercel
2. Conecte ao repositório
3. Configure:
   - **Framework**: Create React App
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: build
   - **Environment Variables**:
     - `REACT_APP_API_URL`: URL do backend Render (ex: `https://seu-backend.onrender.com/api`)
4. Deploy automático no push

### Checklist
- [ ] `render.yaml` presente (config da build)
- [ ] `frontend/vercel.json` presente (rewrite SPA)
- [ ] `backend/runtime.txt` com Python 3.11+
- [ ] `.env.example` atualizado com variáveis deploy
- [ ] Neon DB criado e testado
- [ ] Render Web Service criado
- [ ] Vercel projeto criado
- [ ] Variáveis de ambiente configuradas em cada plataforma

## Checklist de Produção (VPS Ubuntu)
1. SECRET_KEY forte e única
2. Banco com backup habilitado
3. SSL ativo no Nginx
4. Logs de Gunicorn/Nginx monitorados
5. Variáveis de ambiente protegidas

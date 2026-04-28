# Matheus Barber

Sistema de gerenciamento para barbearia com **backend Flask** e **frontend React**, pronto para VPS Ubuntu com **Gunicorn + Nginx + PostgreSQL**. Cadastro de clientes via **telefone + data de nascimento**, com **email opcional**.

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

## Checklist de Produção
1. SECRET_KEY forte e única
2. Banco com backup habilitado
3. SSL ativo no Nginx
4. Logs de Gunicorn/Nginx monitorados
5. Variáveis de ambiente protegidas

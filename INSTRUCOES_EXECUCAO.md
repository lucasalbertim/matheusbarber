# Instruções de Execução (Sem Docker)

## Pré-requisitos
- Python 3.11+
- PostgreSQL 14+
- Node.js 18+

## 1. Backend (Flask)
```
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux

pip install -r requirements.txt

alembic upgrade head
python scripts/seed_db.py

flask --app app.main:create_app run --host 0.0.0.0 --port 8000
```

## 2. Frontend (React)
```
cd frontend
npm install
npm start
```

## 3. Variáveis (.env)
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/matheus_barber
SECRET_KEY=troque-esta-chave
CORS_ORIGINS=http://localhost:3000
REACT_APP_API_URL=/api
```

## 4. Produção (VPS)
Use os arquivos em `deploy/` para Systemd e Nginx:
- `deploy/matheusbarber.service`
- `deploy/nginx.conf`

Execute migrações e seed antes de subir o serviço:
```
alembic upgrade head
python scripts/seed_db.py
```

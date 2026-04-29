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

## Deploy em Produção

### Opção 1: Neon + Render + Vercel (Recomendado - Serverless)

#### Backend (Render)
1. Crie um Web Service no Render (https://render.com)
2. Conecte seu repositório GitHub
3. Configure:
   - **Build Command**: `pip install -r requirements.txt && cd backend && alembic upgrade head && python scripts/seed_db.py`
   - **Start Command**: `gunicorn --chdir backend wsgi:app`
4. Defina variáveis de ambiente (copie de `.env.example`)
5. Deploy automático quando fizer push

#### Banco (Neon)
1. Crie conta em https://neon.tech
2. Crie novo projeto
3. Copie a `CONNECTION_STRING` completa
4. Configure como `DATABASE_URL` no Render

#### Frontend (Vercel)
1. Deploy em https://vercel.com
2. Selecione repositório GitHub
3. Configure Root Directory como `frontend`
4. Defina `REACT_APP_API_URL` apontando para seu backend Render
5. Deploy automático quando fizer push

**Arquivo de configuração**: `render.yaml` (já presente no repositório)

### Opção 2: VPS Ubuntu Tradicional (Gunicorn + Nginx + PostgreSQL)

Use os arquivos em `deploy/` para Systemd e Nginx:
- `deploy/matheusbarber.service`
- `deploy/nginx.conf`
- `deploy/gunicorn.conf.py`

Passos:
```
# 1. Criar estrutura de diretórios
sudo mkdir -p /var/www/matheusbarber
sudo chown $USER:$USER /var/www/matheusbarber

# 2. Clonar e instalar
git clone seu-repo /var/www/matheusbarber
cd /var/www/matheusbarber/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Configurar banco de dados
# Editar .env com DATABASE_URL do seu PostgreSQL

# 4. Rodar migrações
alembic upgrade head
python scripts/seed_db.py

# 5. Copiar arquivos de deploy
sudo cp deploy/matheusbarber.service /etc/systemd/system/
sudo cp deploy/nginx.conf /etc/nginx/sites-available/matheusbarber

# 6. Habilitar e iniciar
sudo systemctl daemon-reload
sudo systemctl enable matheusbarber
sudo systemctl start matheusbarber
sudo systemctl restart nginx
```

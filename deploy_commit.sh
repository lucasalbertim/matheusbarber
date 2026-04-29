#!/bin/bash
cd "C:\Users\Lucas\Documents\PROJETOS\matheusbarber"

# Stage all deploy-related files
git add render.yaml
git add backend/runtime.txt
git add backend/requirements.txt
git add frontend/vercel.json
git add backend/.env.example
git add frontend/.env.example
git add .env.example
git add README.md
git add INSTRUCOES_EXECUCAO.md
git add backend/app/settings.py
git add backend/app/main.py

# Check status
echo "=== Git Status ==="
git status

# Commit with the required message and trailer
git commit -m "chore: preparar deploy neon render vercel

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Show the commit hash
echo "=== Commit Created ==="
git log --oneline -1

# Show files in commit
echo "=== Files in Commit ==="
git diff --name-only HEAD~1 HEAD

# Push to origin main
echo "=== Pushing to origin main ==="
git push origin main

echo "=== Push Complete ==="

#!/usr/bin/env bash

set -euo pipefail

DEV_BRANCH="cursor/criar-sistema-web-para-barbearia-metheus-barber-a96d"
TARGET_BRANCH="novaversao"
REBASE=false

for arg in "$@"; do
  case "$arg" in
    --rebase) REBASE=true ;;
  esac
done

echo "🚀 Sincronizando '$TARGET_BRANCH' com '$DEV_BRANCH'..."
echo "🔄 Buscando últimas referências remotas..."
git fetch --all --prune

current_branch=$(git rev-parse --abbrev-ref HEAD || echo "")
if [ "$current_branch" != "$TARGET_BRANCH" ]; then
  echo "🔁 Alternando para a branch '$TARGET_BRANCH'..."
  git checkout "$TARGET_BRANCH"
fi

if $REBASE; then
  echo "📌 Rebase: aplicando '$TARGET_BRANCH' sobre 'origin/$DEV_BRANCH'..."
  git rebase "origin/$DEV_BRANCH"
else
  echo "📌 Merge: mesclando 'origin/$DEV_BRANCH' em '$TARGET_BRANCH'..."
  git merge --no-ff --no-edit "origin/$DEV_BRANCH" || {
    echo "❗ Conflitos de merge detectados. Resolva-os e finalize com:"
    echo "   git add -A && git commit"
    exit 1
  }
fi

echo "⬆️  Enviando atualizações para o remoto..."
git push -u origin "$TARGET_BRANCH"

echo "✅ Sincronização concluída."
echo "   Branch: $TARGET_BRANCH -> origin/$TARGET_BRANCH"
echo "   Estratégia: $([ "$REBASE" = true ] && echo rebase || echo merge)"


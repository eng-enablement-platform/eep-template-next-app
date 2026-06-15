#!/usr/bin/env bash
# Runs every time the devcontainer starts (including rebuild).
set -euo pipefail

WORKSPACE="/workspaces/eep-template-next-app"

echo "▶ Starting Postgres..."
sudo service postgresql start 2>/dev/null || true

echo "▶ Marking workspace as git safe directory..."
git config --global --add safe.directory "$WORKSPACE"

# Auto-source .env.local when the terminal opens, if it exists.
# DATABASE_URL is set via containerEnv in devcontainer.json (localhost:5432)
# and intentionally skipped here so the devcontainer value always wins.
if ! grep -q "EEP_DEVCONTAINER_ENV" "$HOME/.zshrc" 2>/dev/null; then
  cat >> "$HOME/.zshrc" << 'EOF'

# EEP_DEVCONTAINER_ENV
# Auto-export .env.local vars when present (Clerk keys, LOG_LEVEL, etc.).
# DATABASE_URL is intentionally skipped — containerEnv in devcontainer.json wins.
if [ -f /workspaces/eep-template-next-app/.env.local ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    [[ "$line" =~ ^DATABASE_URL= ]] && continue
    export "${line?}"
  done < /workspaces/eep-template-next-app/.env.local
fi
EOF
fi

echo "✅ post-start complete."

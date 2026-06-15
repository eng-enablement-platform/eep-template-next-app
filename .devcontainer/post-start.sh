#!/usr/bin/env bash
# Runs every time the devcontainer starts (including rebuild).
set -euo pipefail

WORKSPACE="/workspaces/eep-template-next-app"

echo "▶ Marking workspace as git safe directory..."
git config --global --add safe.directory "$WORKSPACE"

# Auto-source .env.local when the terminal opens, if it exists.
# DATABASE_URL is already set in the container environment (docker-compose.extend.yml)
# pointing at the postgres service — no need to override it from the file.
if ! grep -q "EEP_DEVCONTAINER_ENV" "$HOME/.zshrc" 2>/dev/null; then
  cat >> "$HOME/.zshrc" << 'EOF'

# EEP_DEVCONTAINER_ENV
# Auto-export .env.local vars when present (Clerk keys, LOG_LEVEL, etc.).
# DATABASE_URL is intentionally skipped — the compose service override wins.
if [ -f /workspaces/eep-template-next-app/.env.local ]; then
  set -a
  # Source everything except DATABASE_URL (compose network handles it)
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    [[ "$line" =~ ^DATABASE_URL= ]] && continue
    export "${line?}"
  done < /workspaces/eep-template-next-app/.env.local
  set +a
fi
EOF
fi

echo "✅ post-start complete."

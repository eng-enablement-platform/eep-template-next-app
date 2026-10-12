#!/usr/bin/env bash
# Runs every time the devcontainer starts (including rebuild).
set -euo pipefail

# The workspace is mounted at /workspaces/<folder name>, and this script runs
# from it - so use the real path rather than hard-coding the template's name
# (projects created with create-eep have their own folder name).
WORKSPACE="$PWD"

echo "▶ Starting Postgres..."
sudo service postgresql start 2>/dev/null || true

# Wait (up to ~15s) for Postgres to accept connections before migrating.
for _ in $(seq 1 15); do
  pg_isready -h localhost -p 5432 -q && break
  sleep 1
done

# Apply database migrations so the app works straight away - the container
# otherwise starts with an empty database. Safe to re-run: applied migrations
# are skipped. Non-fatal so a broken migration can't stop the container
# starting; run `pnpm db:migrate` to see the error.
echo "▶ Applying database migrations..."
pnpm db:migrate || echo "⚠️  Migrations failed - run 'pnpm db:migrate' to see why."

echo "▶ Marking workspace as git safe directory..."
# Only add it once - this script runs on every container start.
git config --global --get-all safe.directory | grep -qxF "$WORKSPACE" \
  || git config --global --add safe.directory "$WORKSPACE"

# Auto-source .env.local when the terminal opens, if it exists.
# DATABASE_URL is set via containerEnv in devcontainer.json (localhost:5432)
# and intentionally skipped here so the devcontainer value always wins.
if ! grep -q "EEP_DEVCONTAINER_ENV" "$HOME/.zshrc" 2>/dev/null; then
  # Record the workspace path first (expanded now), then the loader (literal).
  printf '\n# EEP_DEVCONTAINER_ENV\nexport EEP_WORKSPACE="%s"\n' "$WORKSPACE" >> "$HOME/.zshrc"
  cat >> "$HOME/.zshrc" << 'EOF'
# Auto-export .env.local vars when present (Clerk keys, LOG_LEVEL, etc.).
# DATABASE_URL is intentionally skipped — containerEnv in devcontainer.json wins.
if [ -f "$EEP_WORKSPACE/.env.local" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue
    [[ "$line" =~ ^DATABASE_URL= ]] && continue
    export "${line?}"
  done < "$EEP_WORKSPACE/.env.local"
fi
EOF
fi

echo "✅ post-start complete."

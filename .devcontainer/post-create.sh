#!/usr/bin/env zsh
# Runs once when the devcontainer is first created.
# Must run as zsh so the Oh My Zsh environment is available for plugin wiring.
# Keep this idempotent — it may be re-run manually.
set -euo pipefail

echo "▶ Installing project dependencies..."
pnpm install

echo "▶ Installing Postgres 17..."
sudo apt-get update -qq
sudo apt-get install -y -qq gnupg curl
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list > /dev/null
sudo apt-get update -qq
sudo apt-get install -y -qq postgresql-17

# Configure Postgres: create the app user + database matching DATABASE_URL
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE app;" 2>/dev/null || true

# Start Postgres and enable on boot
sudo service postgresql start

echo "▶ Installing Graphviz (required by diagrams/ Python lib)..."
sudo apt-get update -qq && sudo apt-get install -y -qq graphviz

echo "▶ Installing uv (Python package manager for diagrams/)..."
pip install -U pip uv --quiet

echo "▶ Installing diagram dependencies via uv..."
cd diagrams && uv sync && cd ..

echo "▶ Installing Zsh plugins..."
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"

if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
  git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
fi
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting" ]; then
  git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting "$ZSH_CUSTOM/plugins/zsh-syntax-highlighting"
fi
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-history-substring-search" ]; then
  git clone --depth=1 https://github.com/zsh-users/zsh-history-substring-search "$ZSH_CUSTOM/plugins/zsh-history-substring-search"
fi

# Wire the plugins into .zshrc
if grep -q "^plugins=" "$HOME/.zshrc" 2>/dev/null; then
  sed -i 's/^plugins=.*/plugins=(git zsh-autosuggestions zsh-syntax-highlighting history-substring-search)/' "$HOME/.zshrc"
else
  echo 'plugins=(git zsh-autosuggestions zsh-syntax-highlighting history-substring-search)' >> "$HOME/.zshrc"
fi

echo "✅ post-create complete."

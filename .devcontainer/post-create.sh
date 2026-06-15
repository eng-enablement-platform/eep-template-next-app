#!/usr/bin/env zsh
# Runs once when the devcontainer is first created.
# Must run as zsh so the Oh My Zsh environment is available for plugin wiring.
# Keep this idempotent — it may be re-run manually.
set -euo pipefail

echo "▶ Installing project dependencies..."
pnpm install

# Postgres 17 and Graphviz are pre-installed in the Dockerfile as root.
# post-create only handles user-level setup that needs the workspace mounted.

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

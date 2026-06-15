#!/usr/bin/env bash
# Runs once when the devcontainer is first created.
# Keep this idempotent — it may be re-run manually.
set -euo pipefail

echo "▶ Installing project dependencies..."
pnpm install

echo "▶ Installing Graphviz (required by diagrams/ Python lib)..."
sudo apt-get update -qq && sudo apt-get install -y -qq graphviz

echo "▶ Installing uv (Python package manager for diagrams/)..."
pip install -U pip uv --quiet

echo "▶ Installing diagram dependencies via uv..."
cd diagrams && uv sync && cd ..

echo "▶ Installing Zsh plugins..."
ZSH_CUSTOM="${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}"

install_plugin() {
  local repo="$1" dir="$2"
  if [ ! -d "$ZSH_CUSTOM/plugins/$dir" ]; then
    git clone --depth=1 "https://github.com/zsh-users/$repo" "$ZSH_CUSTOM/plugins/$dir"
  fi
}

install_plugin zsh-autosuggestions         zsh-autosuggestions
install_plugin zsh-syntax-highlighting     zsh-syntax-highlighting
install_plugin zsh-history-substring-search zsh-history-substring-search

# Wire the plugins into .zshrc
if grep -q "^plugins=" "$HOME/.zshrc" 2>/dev/null; then
  sed -i 's/^plugins=.*/plugins=(git zsh-autosuggestions zsh-syntax-highlighting history-substring-search)/' "$HOME/.zshrc"
else
  echo 'plugins=(git zsh-autosuggestions zsh-syntax-highlighting history-substring-search)' >> "$HOME/.zshrc"
fi

echo "✅ post-create complete."

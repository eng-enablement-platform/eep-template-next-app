#!/usr/bin/env zsh
# Runs once when the devcontainer is first created, after VS Code attaches
# (in the background). Dependencies are installed earlier, in on-create.sh.
# Must run as zsh so the Oh My Zsh environment is available for plugin wiring.
# Keep this idempotent — it may be re-run manually.
set -euo pipefail

# Postgres 17 and Graphviz are pre-installed in the Dockerfile as root.
# post-create only handles user-level setup that needs the workspace mounted.

# diagrams/ is optional - create-eep can scaffold a project without it.
# uv is in the image (Dockerfile); `uv sync` downloads the Python version
# diagrams/pyproject.toml asks for, so no system Python is needed.
if [ -d diagrams ]; then
  echo "▶ Installing diagram dependencies (and Python) via uv..."
  cd diagrams && uv sync && cd ..
fi

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

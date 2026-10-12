#!/usr/bin/env bash
# Runs once when the devcontainer is first created, BEFORE VS Code attaches.
#
# VS Code waits for onCreateCommand to finish before starting extensions, so
# installing dependencies here means extensions (Vitest, ESLint, TypeScript,
# Playwright) find node_modules on first load. Installing in postCreateCommand
# instead races them - e.g. the Vitest extension reports "Vitest not found"
# and doesn't retry until the window is reloaded.
#
# Keep this idempotent - it may be re-run manually.
set -euo pipefail

# node_modules is a Docker volume (see "mounts" in devcontainer.json), created
# root-owned - hand it to the vscode user before installing into it.
sudo chown vscode:vscode node_modules

echo "▶ Installing project dependencies..."
pnpm install

echo "✅ on-create complete."

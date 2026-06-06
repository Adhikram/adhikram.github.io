#!/bin/bash
# Install BasicTeX and required LaTeX packages for resume PDF generation.
# Requires sudo (macOS installer + tlmgr).

set -euo pipefail

echo "==> Installing BasicTeX (will prompt for your password)..."
brew install --cask basictex

echo "==> Refreshing PATH for TeX binaries..."
eval "$(/usr/libexec/path_helper)"

if ! command -v tlmgr &>/dev/null; then
  echo "tlmgr not found. Open a new terminal and re-run this script."
  exit 1
fi

echo "==> Installing LaTeX packages (will prompt for your password again)..."
sudo tlmgr update --self
sudo tlmgr install enumitem fontawesome luacode marvosym mathdesign \
                   pdfcomment preprint titlesec luatex85 datetime2 \
                   zref marginnote soulpos

echo ""
echo "Done. Verify with: lualatex --version"
lualatex --version | head -1

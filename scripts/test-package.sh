#!/usr/bin/env bash
set -euo pipefail
PACKAGE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRATCH_DIR="$(mktemp -d "${TMPDIR:-/tmp}/flow-ui-package.XXXXXX")"
trap 'rm -rf "$SCRATCH_DIR"' EXIT
cd "$PACKAGE_DIR"
npm pack --pack-destination "$SCRATCH_DIR" --json > "$SCRATCH_DIR/pack.json"
TARBALL="$(bun -e 'console.log(require(process.argv[1])[0].filename)' "$SCRATCH_DIR/pack.json")"
for REACT_VERSION in 19.0.0 19.2.3; do
  CONSUMER_DIR="$SCRATCH_DIR/react-$REACT_VERSION"
  mkdir "$CONSUMER_DIR"
  cp "$PACKAGE_DIR"/scripts/package-consumer/* "$CONSUMER_DIR/"
  cd "$CONSUMER_DIR"
  printf '%s\n' '{"name":"ui-consumer-check","private":true,"type":"module"}' > package.json
  bun add "$SCRATCH_DIR/$TARBALL" "react@$REACT_VERSION" "react-dom@$REACT_VERSION" react-router@7.8.2 tailwindcss@4.1.18 vite@7.2.7 @vitejs/plugin-react@5.1.2 @tailwindcss/vite@4.1.18 @playwright/test@1.62.1
  bun ssr.tsx
  bunx vite build
  bunx playwright test
  cp node_modules/@flow-industries/ui/package.json package-original.json
  bun -e 'const p = "node_modules/@flow-industries/ui/package.json"; const data = await Bun.file(p).json(); delete data.exports["./components"]; await Bun.write(p, JSON.stringify(data));'
  if bunx vite build > removed-export.log 2>&1; then
    echo "Removed component export unexpectedly passed" >&2
    exit 1
  fi
  mv package-original.json node_modules/@flow-industries/ui/package.json
  mv node_modules/@flow-industries/ui/src/styles/tokens.css tokens-original.css
  if bunx vite build > removed-style.log 2>&1; then
    echo "Removed token stylesheet unexpectedly passed" >&2
    exit 1
  fi
  mv tokens-original.css node_modules/@flow-industries/ui/src/styles/tokens.css
  bunx vite build
  bunx playwright test
done

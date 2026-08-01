#!/usr/bin/env bash
# Re-renders the committed visual baselines inside the same Playwright/Linux
# image that CI uses, pinned to linux/amd64 so Apple Silicon hosts produce the
# exact pixels the amd64 CI runner compares against.
# Usage: ./scripts/update-snapshots.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PW_VERSION=$(bun -e "console.log(require('@playwright/test/package.json').version)")
IMAGE="mcr.microsoft.com/playwright:v${PW_VERSION}-noble"
echo "Rendering baselines in ${IMAGE} (linux/amd64)"

docker run --rm --platform linux/amd64 -v "$PWD":/host "$IMAGE" bash -c '
  set -euo pipefail
  npm install -g bun >/dev/null
  mkdir /work
  tar -C /host --exclude node_modules --exclude dist --exclude .git \
    --exclude test-results --exclude playwright-report -cf - . | tar -xf - -C /work
  cd /work
  bun install --frozen-lockfile
  bun run build
  CI=1 bunx playwright test tests/visual.spec.ts --update-snapshots
  rm -rf /host/tests/visual.spec.ts-snapshots
  cp -r tests/visual.spec.ts-snapshots /host/tests/
'
echo "Baselines updated under tests/visual.spec.ts-snapshots/ — review and commit."

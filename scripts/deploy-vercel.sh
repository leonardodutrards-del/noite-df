#!/usr/bin/env bash
set -euo pipefail
npm ci
npm run check
if ! command -v vercel >/dev/null 2>&1; then npm install -g vercel; fi
vercel --prod

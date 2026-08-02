#!/usr/bin/env bash
set -euo pipefail
cp -n .env.example .env.local || true
npm install
npm run lint
npm test
npm run build
echo "Base validada. Configure .env.local e execute: npm run dev"

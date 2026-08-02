# ADR 0001 — Monólito modular em Next.js

**Status:** aceito para o MVP.

## Contexto
O produto ainda valida operação, qualidade dos dados e aderência de usuários e parceiros. Microserviços aumentariam custo e complexidade sem benefício comprovado.

## Decisão
Manter site, API, administração e área do parceiro no mesmo projeto Next.js, separando regras por módulos e acessando persistência por contratos de repositório.

## Consequências
- Entrega e deploy simples.
- Regras compartilhadas entre as interfaces.
- Possibilidade de substituir seeds por PostgreSQL sem reescrever a camada pública.

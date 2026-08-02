# Instruções para o Codex — Noite DF

## Missão do produto
Construir uma plataforma confiável para responder: **onde vale a pena ir hoje no Distrito Federal?**

## Protocolo
Sempre trabalhar em: diagnóstico → plano → aprovação → lote pequeno → testes → revisão.

## Restrições atuais
- Não reescrever a interface pública.
- Não adicionar IA generativa, Google Places, scraping, PostGIS ou microserviços sem decisão explícita.
- Não misturar seeds com dados operacionais.
- Não permitir publicação irrestrita de parceiros.
- Preservar fonte, autoria, verificação e histórico das informações.

## Próximo lote recomendado
Conectar PostgreSQL a partir dos contratos em `modules/*/repository.ts`, criar migrações e uma administração CRUD mínima com revisão de publicação.

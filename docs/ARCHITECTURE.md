# Arquitetura inicial — Noite DF

## Objetivo
Responder com informação local confiável: **onde vale a pena ir hoje no Distrito Federal?**

## Estratégia
O sistema começa como monólito modular em Next.js. A interface pública, a área do parceiro, a administração e a API compartilham as mesmas regras e o mesmo banco.

## Módulos
- `modules/establishments`: tipos, regras e contrato de repositório de estabelecimentos.
- `modules/events`: tipos e contrato de repositório de eventos.
- `modules/shared`: conceitos comuns, como fonte e status de publicação.
- `infrastructure/repositories`: implementações concretas. Hoje usa seeds em memória; futuramente PostgreSQL.
- `data/seeds`: dados exclusivamente demonstrativos.
- `app/admin`: entrada do operador/administrador.
- `app/parceiro`: entrada do estabelecimento parceiro.

## Fluxo de publicação
Importação ou cadastro → rascunho → revisão → publicação → verificação periódica → expiração/suspensão.

## Decisões adiadas
Autenticação, provedor PostgreSQL, PostGIS, integrações externas e IA não fazem parte deste lote.

# Publicação na nuvem — Noite DF

## Stack de produção

- Vercel para aplicação Next.js;
- Supabase para Auth e PostgreSQL;
- Mercado Pago para assinaturas e pagamentos.

## Preparação

1. Crie/configure o projeto Supabase.
2. Execute `database/schema.sql` em um banco novo ou aplique as migrations em ordem.
3. Importe este repositório na Vercel.
4. Cadastre as variáveis de ambiente sem expor secrets no Git.
5. Configure `NEXT_PUBLIC_APP_URL` com o domínio final.
6. Configure `MASTER_ADMIN_EMAIL` somente no ambiente privado com o e-mail do único Master Admin.
7. Crie esse usuário diretamente no Supabase Auth e mantenha o perfil com `role='admin'`.
8. Mantenha `PAYMENTS_ENABLED=false` até terminar testes reais de cobrança.

## Variáveis críticas

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `MASTER_ADMIN_EMAIL`
- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`
- `SHOWCASE_MODE`
- `PAYMENTS_ENABLED`

## Banco e migrations

Para um banco existente, aplique as migrations de `database/migrations` na ordem.
A migration 003 aborta intencionalmente se detectar dados legados que exigem reconciliação manual.

O script `scripts/migrate-places-to-supabase.ts` deve ser usado apenas para uma carga inicial
em ambiente compatível com o schema atual.

## Mercado Pago

Cadastre o webhook:

`https://SEU-DOMINIO/api/payments/webhook`

Antes de cobrar:

- validar `x-signature`;
- consultar o recurso diretamente na API do Mercado Pago;
- persistir eventos de forma idempotente;
- vincular assinatura ao estabelecimento autenticado;
- testar assinatura, cancelamento, falha de cobrança e reembolso;
- só então definir `SHOWCASE_MODE=false` e `PAYMENTS_ENABLED=true`.

## Segurança

Além das proteções no código, configure o WAF/firewall da Vercel para as rotas sensíveis:

- `/admin/*`
- `/api/admin/*`
- `/api/auth/login`
- `/api/payments/*`

Recomendações:

- rate limiting na borda para login e APIs administrativas;
- regras gerenciadas de WAF;
- challenge/bloqueio para tráfego anômalo;
- monitoramento de respostas 401, 403, 429 e 5xx;
- rotação periódica dos secrets.

## Validação antes de cada release

```bash
pnpm run check
```

O pipeline também executa testes, lint e build em Pull Requests.

# Noite DF

Plataforma de descoberta de experiências locais em Brasília/DF: bares, restaurantes, eventos, agenda, Radar da Cidade, recomendações e ferramentas para estabelecimentos.

## Estado atual

O projeto já possui uma base operacional de produção:

- site público responsivo e catálogo curado;
- busca, Radar da Cidade, agenda, SEO, sitemap e PWA;
- autenticação persistente via Supabase Auth;
- cadastro público sempre como `visitor`;
- promoção para `partner` somente após reivindicação e aprovação administrativa;
- Painel Master protegido por papel `admin` + allowlist privada `MASTER_ADMIN_EMAIL`;
- painel do parceiro com persistência no Supabase;
- analytics reais por estabelecimento;
- fila de reivindicações e moderação;
- auditoria persistente;
- integração Mercado Pago com validação de webhook, idempotência e sincronização;
- reembolso real em produção quando existe `provider_payment_id`;
- headers de segurança e rate limiting de login;
- deploy automatizado na Vercel.

Pagamentos continuam condicionados a `PAYMENTS_ENABLED=true` e `SHOWCASE_MODE=false`.

## Rodar localmente

```bash
cp .env.example .env.local
pnpm install
pnpm run check
pnpm run dev
```

Acesse `http://localhost:3000`.

## Segurança

Nunca inclua credenciais ou valores reais de secrets no Git.

Variáveis sensíveis como `SUPABASE_SERVICE_ROLE_KEY`, `MERCADO_PAGO_ACCESS_TOKEN`,
`MERCADO_PAGO_WEBHOOK_SECRET` e `MASTER_ADMIN_EMAIL` devem ser configuradas apenas
no ambiente de execução.

O Painel Master em `/admin` retorna 404 para qualquer sessão que não corresponda ao
usuário Master configurado.

## Produção

Leia [DEPLOY.md](./DEPLOY.md) antes de ativar pagamentos ou migrar dados.

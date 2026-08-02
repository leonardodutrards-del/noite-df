# Noite DF

Plataforma de descoberta de experiências locais: bares, restaurantes, eventos, agenda semanal, radar da cidade, ranking e ferramentas para estabelecimentos.

## Estado desta entrega

> **Nota:** esta versão está em modo demonstração (`SHOWCASE_MODE=true`), com dados mockados e pagamentos desativados. Ainda não há Supabase, Mercado Pago ou autenticação real configurados — isso está previsto para o próximo lote de trabalho.

- site público responsivo em modo demonstração;
- Radar, Índice Noite DF, perfil rápido, ranking, timeline, agenda e roteiro turístico;
- páginas de planos e painel parceiro demonstrativo;
- API inicial de analytics com persistência opcional no Supabase;
- criação inicial de assinaturas Mercado Pago;
- esquema PostgreSQL para operação, moderação, avaliações, parceiros, auditoria e pagamentos;
- SEO, sitemap, robots, manifest PWA, termos e privacidade provisórios;
- configuração de deploy para Vercel na região de São Paulo.

## Rodar localmente

```bash
cp .env.example .env.local
pnpm install
pnpm run check
pnpm run dev
```

Acesse `http://localhost:3000`.

## Modo demonstração

Sem Supabase, o catálogo usa seeds e analytics responde com `persisted: false`. Sem Mercado Pago, a API de assinatura retorna 503 com uma mensagem de configuração.

## Produção

Leia [DEPLOY.md](./DEPLOY.md). Credenciais nunca devem ser incluídas no Git ou no ZIP.

## Próximos lotes

1. autenticação e autorização por papéis;
2. repositórios PostgreSQL reais para catálogo e agenda;
3. painel administrativo com revisão e publicação;
4. reivindicação e painel do parceiro;
5. webhook Mercado Pago com validação e idempotência;
6. avaliações, denúncias, reputação e métricas reais.

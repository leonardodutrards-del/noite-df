# Fases 9–12 — Noite DF

## Fase 9 — Growth e mensuração
- GA4 carregado por variável de ambiente.
- Search Console por meta de verificação.
- Eventos próprios continuam persistidos no Supabase.
- Eventos comerciais: início de trial e checkout de assinatura.

## Fase 10 — Operação
- CRM por estabelecimento em `partner_pipeline`.
- Etapas: não contatado, contato, resposta, trial, parceiro, pausado e perdido.
- Score de completude para priorizar cadastros incompletos.
- Painel Master em `/admin/operacao`.

## Fase 11 — Retenção
- Favoritos persistentes.
- Preferências de região, música, vibe e orçamento.
- Roteiros/listas pessoais.
- Esses dados formam a base futura de personalização e IA.

## Fase 12 — Monetização
- Mercado Pago continua como provedor de cobrança.
- Trial é exibido somente quando `TRIAL_ENABLED=true`.
- O plano do Mercado Pago deve estar configurado com teste grátis de 30 dias antes de habilitar essa flag.
- O Noite DF registra o funil e o CRM; o Mercado Pago continua responsável pela autorização e cobrança recorrente.

## Gate de produção
Executar testes, lint e build. Publicar somente com CI e Vercel verdes.

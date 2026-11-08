# Noite DF — prontidão operacional antes da publicação

## Regra de release
Nenhuma alteração desta frente pode ser mesclada na `main`, promovida para produção ou publicada antes de todos os gates abaixo estarem concluídos e aprovados. O trabalho ocorre nesta branch isolada: `work/complete-readiness-before-release`.

## Premissas confirmadas pelo proprietário
- Pix e cartão foram testados pelo proprietário; os links de pagamento estão funcionando.
- Não reabrir a validação manual dos links/checkout como pendência.
- Manter uma verificação técnica separada de webhook, confirmação idempotente e concessão/revogação de entitlement, sem executar cobrança real ou alterar dados de produção.
- Preservar o deploy atual e os dados existentes.
- Se alguma fonte de eventos não oferecer API/feed/acesso autorizado, documentar o fluxo alternativo (envio pelo parceiro ou revisão humana); não contornar controles de acesso nem publicar dados não confirmados.

## Estado de baseline observado
- Produção: deploy Vercel identificado como READY na auditoria anterior; não realizar deploy durante esta frente.
- Supabase: projeto ACTIVE_HEALTHY.
- Tabelas observadas: 109 estabelecimentos; 41 eventos; 73 fontes; 12 verificações de fontes; 2.382 interações; 4 contas de assinatura; 0 eventos em `payment_webhook_events`.
- `events`, `data_sources`, `agenda_source_checks`, `interactions`, `subscription_accounts` e `payment_webhook_events` têm RLS habilitado no snapshot consultado.
- O cron atual `/api/cron/agenda-sources` roda diariamente às 10:00 UTC (07:00 em Brasília), verifica até 12 fontes por execução e compara hashes. Ele detecta mudanças, mas não extrai nem publica eventos.
- A agenda pública combina registros editoriais do banco com eventos locais versionados em código; isso precisa ser consolidado sem perder os eventos verificados já publicados.
- PR #101 (security hardening) continua draft; a migration 011 não foi aplicada. Revisar contra o estado real antes de qualquer execução.
- O proprietário confirma checkout Pix/cartão e links funcionais. O estado da integração webhook/entitlements precisa ser comprovado com logs/testes controlados, não inferido pela existência do checkout.

## Fases e critérios de aceite

### Fase 0 — baseline e proteção
- [x] Criar branch de trabalho isolada.
- [x] Registrar regra de não publicar até todos os gates.
- [ ] Congelar escopo e inventariar PRs/branches antigas para evitar regressões.
- [ ] Confirmar testes, build e deploy atual sem promover nenhuma alteração.
- [ ] Definir inventário de funcionalidades e evidências por fluxo.

### Fase 1 — segurança e contas
- [ ] Revisar PR #101 e migration 011 linha a linha.
- [ ] Comparar schema/migrations com o estado real do Supabase.
- [ ] Preparar testes e instruções de homologação; não aplicar SQL em produção sem backup, plano de rollback e autorização explícita.
- [ ] Validar Master Admin, parceiro, isolamento por estabelecimento, claims e auditoria.
- [ ] Validar proteção de rotas e rate limits.
- [ ] Resolver findings de segurança e repetir suíte completa.

### Fase 2 — cobrança e acesso (sem reabrir links)
- [x] Checkout/links Pix e cartão testados pelo proprietário.
- [ ] Validar webhook com eventos de teste/sandbox, assinatura/autenticidade, idempotência e persistência.
- [ ] Validar concessão, renovação, atraso, cancelamento, reembolso e expiração de entitlement.
- [ ] Validar reconciliação e observabilidade sem expor dados financeiros.
- [ ] Documentar evidências; não gerar cobranças reais durante testes.

### Fase 3 — agenda automática
- [ ] Mapear as 73 fontes por tipo, domínio, região, acesso, frequência e confiabilidade.
- [ ] Priorizar APIs, RSS, calendários e integrações autorizadas; não fazer scraping de redes sociais com login/bypass.
- [ ] Criar pipeline candidato -> normalização -> deduplicação -> revisão/confiança -> publicação.
- [ ] Criar fila com retries, idempotência, dead-letter, histórico e alertas.
- [ ] Integrar atualizações/cancelamentos e expiração automática.
- [ ] Preservar eventos editoriais existentes e migrar fontes de fallback com reconciliação.
- [ ] Criar painel de fontes, candidatos, falhas e aprovação.
- [ ] Testar fontes representativas e documentar alternativas manuais onde não houver integração legítima.
- [ ] Definir SLA realista por conector; webhooks/APIs em minutos, páginas públicas em polling configurável.

### Fase 4 — operação de parceiros e admin
- [ ] Testar cadastro, reivindicação, aprovação e transferência de ficha.
- [ ] Testar atualização de perfil, cardápio, horários, promoções e eventos.
- [ ] Testar permissões e auditoria em todas as ações.
- [ ] Testar analytics, exportação e limites por plano.
- [ ] Testar onboarding e trial sem duplicar cobranças/contas.

### Fase 5 — layout e experiência
- [ ] Auditoria visual de home, listagens, fichas, agenda, parceiro e admin.
- [ ] Implementar sistema visual consistente e responsivo, mantendo identidade Noite DF.
- [ ] Melhorar navegação, busca, filtros, cards, hierarquia, estados vazios/erro/carregamento e acessibilidade.
- [ ] Validar desktop, tablet e mobile, teclado e reduced-motion.
- [ ] Não alterar conteúdo factual nem esconder avisos de fonte/verificação.

### Fase 6 — SEO, performance e observabilidade
- [ ] Validar canonical, metadata, sitemap, robots, OG, favicon e páginas indexáveis.
- [ ] Verificar Core Web Vitals, imagens, cache e páginas lentas.
- [ ] Testar erros de runtime e alertas de cron/filas.
- [ ] Atualizar documentação operacional e plano de rollback.

### Fase 7 — QA e gate final
- [ ] Testes unitários, integração, contratos e segurança.
- [ ] Lint, typecheck e build.
- [ ] Smoke tests de rotas públicas, autenticação, painel, agenda e billing.
- [ ] Revisão de diff, dependências, segredos e migrations.
- [ ] Aprovação final do proprietário.
- [ ] Somente após aprovação: merge controlado e deploy de produção.

## Arquitetura alvo de eventos
1. **Conectores de fonte:** APIs oficiais, RSS/Atom, iCal/ICS, webhooks e páginas públicas permitidas.
2. **Ingestão:** execução agendada e/ou webhook, timeout, limites de bytes, allowlist de host, User-Agent identificado e respeito a termos/robots aplicáveis.
3. **Snapshots:** guardar origem, URL, hash, data de captura e trecho mínimo necessário para auditoria; evitar armazenar conteúdo protegido desnecessário.
4. **Normalização:** título, estabelecimento, local, início/fim com timezone, preço, categoria, atrações, URL oficial, imagem/crédito e confiança.
5. **Deduplicação:** chave estável por fonte + comparação de estabelecimento/título/horário; alterações atualizam o candidato/evento existente.
6. **Revisão:** publicar automaticamente apenas conectores estruturados e confiáveis com campos obrigatórios e regras aprovadas; flyer, OCR, ambiguidade, divergência e baixa confiança ficam pendentes.
7. **Publicação:** gravação idempotente no registro editorial existente, com trilha de auditoria e status.
8. **Ciclo de vida:** alterações/cancelamentos geram revisão; eventos expirados saem da agenda futura; falhas vão para dead-letter e alerta.
9. **Distribuição:** páginas públicas, agenda semanal e notificações/canais autorizados.

## Política de publicação automática
- Publicação automática: somente API/feed/calendário oficial com mapeamento testado, dados obrigatórios completos, fonte permitida, sem conflito e confiança alta.
- Revisão humana: imagem/flyer, texto livre, fonte social sem integração autorizada, dados incompletos ou conflitantes.
- Bloqueio: fonte não autorizada, URL insegura, duplicidade ambígua, evento vencido, cancelamento não confirmado ou informação sem procedência.
- Cada evento público mantém fonte, última verificação e histórico.

## Atualização de status
Este documento é o registro de trabalho. Marcar itens como concluídos somente com evidência verificável (teste, PR, log ou estado consultado). A confirmação do proprietário sobre links Pix/cartão está registrada como tal e não deve ser apresentada como teste técnico do webhook.

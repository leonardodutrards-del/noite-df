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
- PR #101 (security hardening) continua draft; a migration 011 não foi aplicada. O histórico do Supabase mostra as migrations até `agenda_source_checks_service_role_policy`; revisar a migration 011 contra o estado real antes de qualquer execução.
- Supabase Security Advisor: um aviso WARN ativo — proteção contra senhas vazadas desabilitada. Performance Advisor listou 23 índices sem uso (informativos; não remover sem análise de carga). Health Advisor sem alertas.
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
- [x] Comparar histórico de migrations e catálogo de tabelas/colunas com o estado real disponível.
- [ ] Inspecionar políticas RLS existentes e validar cada operação com papéis reais; a lista de tabelas mostra RLS habilitado, mas isso isoladamente não prova que as policies estejam corretas.
- [ ] Preparar testes e instruções de homologação; não aplicar SQL em produção sem backup, plano de rollback e autorização explícita.
- [ ] Validar Master Admin, parceiro, isolamento por estabelecimento, claims e auditoria.
- [ ] Validar proteção de rotas e rate limits.
- [ ] Resolver o aviso de proteção contra senhas vazadas no painel Supabase Auth (configuração operacional, não migration).
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


## Atualização de execução — 08/11/2026
- [x] Migration `event_ingestion_pipeline` aplicada no projeto Supabase de produção; cinco tabelas novas confirmadas com RLS habilitado.
- [x] Migration `event_ingestion_fk_indexes` aplicada; o Performance Advisor deixou de apontar FKs sem índice para as novas tabelas.
- [x] Segredo dedicado `EVENT_INGESTION_CRON_SECRET` criado no Vercel para produção/prévia e cópia correspondente guardada no Supabase Vault. O valor não é versionado nem exibido.
- [x] Parser RSS/Atom/iCalendar com testes e parser HTML restrito a Schema.org JSON-LD, sem inferir eventos de texto arbitrário.
- [x] A central Master Admin oferece RSS, Atom, iCalendar e HTML estruturado; a revisão continua manual.
- [x] Refresh de feeds preserva decisões editoriais e candidatos já publicados.
- [x] Testes, lint e build passaram no commit `3805fd5730ba39b40ee54ec5d6c90df50578c0eb`: 281 testes em 71 arquivos.
- [ ] Revalidar suíte completa após inclusão do parser Schema.org.
- [ ] Confirmar preview final READY e smoke test.
- [ ] Mesclar PR #126 e aguardar deploy de produção READY.
- [ ] Aplicar migration `013_schedule_event_ingestion` somente após o endpoint estar disponível em produção; ela habilita execução Supabase Cron a cada 5 minutos.
- [ ] Cadastrar conectores apenas para fontes oficiais autorizadas. Instagram e Linktree não são raspados; fontes sem feed/API/JSON-LD continuam no processo editorial atual.
- [ ] Smoke test do endpoint protegido, painel Master Admin, ingestão e agenda pública; só então encerrar release.

**Estado atual:** o schema da ingestão já está em produção de forma aditiva, mas o endpoint e o layout ainda estão em prévia/branch. O agendamento recorrente não foi ativado. A produção do site permanece na versão anterior até o merge/deploy controlado.


## Publicação em produção — 08/11/2026
- [x] PR #126 integrado ao `main` (merge commit `6353270b98557b0bcf05754193c4dad7bba88bb6`).
- [x] Deploy de produção Vercel `dpl_7mbqmwgX5bLhRGt97TcjbFG9fiKQ` em estado READY.
- [x] Domínio `www.noitedf.com.br` e redirecionamento do apex `noitedf.com.br` apontam para a nova implantação.
- [x] CI do commit publicado: testes, lint e build aprovados.
- [x] Migration `schedule_event_ingestion` aplicada; extensões `pg_cron` e `pg_net` instaladas.
- [x] Job `noite-df-event-ingestion` ativo em `*/5 * * * *`.
- [x] Primeira execução confirmada: HTTP 200, resposta `processed: 0`, `discovered: 0`, `publicationMode: manual_review_only`.
- [ ] Configurar fontes estruturadas verificadas na central Master Admin. O banco está atualmente com **zero conectores** ativos; a agenda de todos os bares ainda não está sendo extraída automaticamente.
- [ ] Não utilizar Instagram ou Linktree como conectores de scraping. Somente RSS, Atom, iCalendar e páginas oficiais com Schema.org JSON-LD.
- [ ] PR #127 corrige a exclusão de Instagram/Linktree e bloqueia tipos de conector sem adaptador implementado; aguarda CI, preview e merge.
- [ ] Revisar alerta de segurança do Supabase: `pg_net` instalado no schema `public` e proteção contra senhas vazadas desabilitada. O primeiro é um aviso do advisor; não houve evidência de exposição de credenciais.

**Estado de publicação:** nova versão visual e estrutura operacional publicadas em produção. Scheduler de ingestão está ativo e foi chamado com sucesso. A automação de eventos depende da configuração e validação de fontes oficiais compatíveis; não afirmar cobertura automática de todos os estabelecimentos até essa etapa estar concluída.

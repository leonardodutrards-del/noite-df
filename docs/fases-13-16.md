# Fases 13–16 — Evolução comercial do Noite DF

## Fase 13 — Automação de vendas
- Todo novo estabelecimento entra automaticamente em `partner_pipeline`.
- Início de trial é registrado como evento comercial.
- Início de checkout é registrado como evento comercial.
- Assinatura ativa move automaticamente o estabelecimento para `partner`.
- CRM do Master Admin possui filtros por região e etapa e atalhos para visita presencial.
- Follow-up pode ser agendado diretamente no CRM.

## Fase 14 — Master Admin em tempo quase real
- Visão geral é atualizada automaticamente em intervalos curtos.
- Métricas incluem interações, visualizações, cliques, trials e checkouts.
- MRR e assinaturas ativas continuam calculados a partir do banco real.
- O CRM operacional também se atualiza automaticamente.

## Fase 15 — Agenda e divulgação
- Próxima etapa após estabilização das Fases 13 e 14.
- Atualização de agenda deve continuar exigindo fonte oficial e data verificável.
- Prioridade comercial inicial: Sobradinho e regiões visitadas presencialmente.

## Fase 16 — Retenção
- Follow-ups de renovação e recuperação.
- Indicadores de churn e clientes em risco.
- Automação de reativação e relacionamento.

## Gate
Nenhuma alteração de pagamento é publicada sem testes, lint, build e deploy verdes.

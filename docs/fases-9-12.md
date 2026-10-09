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

## Revisão operacional — 09/10/2026
A fase 12 possui cobrança recorrente e Pix avulso por 30 dias implementados. O usuário confirmou o recebimento do pagamento teste e a assinatura exibida no painel. Isso não comprova, por si só, renovação, cancelamento ou todas as permissões em produção.

### Critérios para fechar a fase 12
- [ ] Validar em sessão autenticada o vínculo do parceiro, plano, prazo e recursos liberados após pagamento.
- [ ] Confirmar cancelamento recorrente e expiração do Pix sem cobrança automática.
- [ ] Completar o contato oficial de privacidade/atendimento e a revisão dos termos operacionais. A página aceita NEXT_PUBLIC_SUPPORT_EMAIL; só configurar com um endereço oficial verificado.
- [ ] Validar operação de um parceiro real e leitura dos indicadores de conversão.

### Próximo avanço proposto — agenda operada pelo painel
As agendas públicas hoje, semanal, mensal e fim de semana leem `data/events`, enquanto a agenda do parceiro persiste `weeklySchedule` no cadastro do estabelecimento. São caminhos distintos: editar o painel não alimenta automaticamente o calendário de eventos datados.

O primeiro avanço operacional conecta a tabela existente `events` ao calendário público e à home. A tela `/admin/agenda` permite ao Master Admin cadastrar, corrigir, revisar, publicar e suspender eventos, com fonte oficial, início/encerramento em Brasília, autoria, auditoria e proteção contra sobrescrita de outra sessão. Alterações editoriais feitas nessa tela dispensam deploy e aparecem na próxima consulta à agenda. As seeds ficam como base de desenvolvimento; produção usa o banco, sem reintroduzir conteúdo suspenso a partir das seeds.

A programação atual deve ser transferida para `events` antes da ativação em produção. Rascunhos, pendentes, locais suspensos e eventos encerrados não entram nos calendários públicos. O `weeklySchedule` do parceiro continua sendo a programação geral do perfil; o envio de eventos datados pelo parceiro para aprovação é um próximo lote, sem permissão de autopublicação. Mudanças de código continuam com testes, lint, build e Vercel verdes. Isso não fecha automaticamente a fase 12 nem constitui uma fase 13 já acordada.

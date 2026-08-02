# Prompt para o Codex — consolidação Noite DF

Você está trabalhando no projeto Noite DF, um monólito modular em Next.js. Preserve o visual e as funcionalidades existentes. Antes de alterar qualquer arquivo, execute `npm ci`, `npm run lint`, `npm test` e `npm run build` e registre os resultados.

## Objetivo
Transformar o MVP em um produto operacional que responde “onde vale a pena ir hoje no Distrito Federal?”, com três atores: usuário, parceiro e administrador.

## Já implementado no pacote
- Radar da Cidade, Índice Noite DF, ranking, perfil rápido, timeline, agenda e turismo inteligente.
- Página de planos e endpoint de assinatura recorrente Mercado Pago.
- Webhook inicial, retorno de pagamento e endpoint de analytics.
- Painel parceiro demonstrativo com indicadores de visibilidade.

## Próximo lote obrigatório
1. Corrigir qualquer erro de build, lint ou tipagem sem reescrever a interface.
2. Conectar PostgreSQL/Supabase por migrações versionadas.
3. Persistir estabelecimentos, horários, eventos, promoções, avaliações, fontes, auditoria e interações.
4. Implementar autenticação e papéis visitor, partner, operator e admin.
5. Proteger `/admin` e `/parceiro` no servidor.
6. Implementar reivindicação de estabelecimento e aprovação administrativa.
7. Transformar métricas demonstrativas em consultas reais agregadas por estabelecimento e período.
8. Validar webhook Mercado Pago por assinatura, consultar a assinatura na API e persistir idempotentemente.
9. Liberar recursos pagos somente após status confirmado pela API/webhook.
10. Criar testes para permissões, status de publicação, eventos vencidos, horários após meia-noite, pagamentos e idempotência.

## Segurança
- Nunca commitar tokens, CPF, CNPJ, conta bancária ou segredos.
- O recebedor Mercado Pago é determinado pelo Access Token de produção.
- Não confiar em status vindo apenas da URL de retorno.
- Não publicar rascunhos ou conteúdo pendente.
- Toda alteração sensível deve gerar auditoria.

## Entrega
Apresente diagnóstico, arquivos alterados, migrações, testes executados, riscos remanescentes e instruções de rollback. Pare antes de deploy de produção ou ativação de credenciais reais.

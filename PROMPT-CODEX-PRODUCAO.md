# Missão Codex — Noite DF produção

Trabalhe neste projeto sem reescrever a interface pública. Execute em lotes pequenos, sempre com lint, testes e build.

## Objetivo imediato

Transformar o modo demonstração em operação real usando Vercel + Supabase + Mercado Pago.

## Ordem obrigatória

1. Instalar dependências e corrigir qualquer erro de lint/build.
2. Aplicar `database/schema.sql` em um projeto Supabase de desenvolvimento.
3. Implementar autenticação e papéis: visitor, partner, operator, admin.
4. Criar repositórios PostgreSQL para estabelecimentos, eventos, promoções e avaliações.
5. Manter seeds apenas para desenvolvimento.
6. Proteger `/admin` e `/parceiro` no servidor.
7. Implementar fluxo de reivindicação e aprovação.
8. Implementar CRUD administrativo com draft → pending_review → published → expired/suspended.
9. Persistir analytics e criar agregações por estabelecimento.
10. Finalizar Mercado Pago: validação de x-signature, consulta à API, idempotência e atualização de assinatura.
11. Testar cobrança somente em ambiente de teste.
12. Publicar na Vercel e executar smoke tests.

## Restrições

- Nunca gravar tokens no código, logs ou commits.
- Nunca ativar plano por parâmetro de retorno do navegador.
- Conteúdo draft/pending não pode aparecer publicamente.
- Parceiro só altera estabelecimento com claim aprovado.
- Alterações sensíveis devem passar por revisão.
- Não adicionar IA antes de catálogo, agenda, governança e métricas estarem operacionais.

## Entrega esperada

- URL de preview;
- relatório de migrations;
- contas de teste por papel;
- checklist de pagamentos em sandbox;
- resultados de lint/test/build;
- riscos pendentes e rollback.

# Operação diária Noite DF — 20/11/2026

## Resumo da rodada

- Base Supabase ativa: **104 estabelecimentos publicados em 22 regiões**; **288 fontes** cadastradas.
- Auditoria rotativa dos últimos 7 dias: ao menos uma fonte verificada para **53 dos 104 estabelecimentos publicados**; 51 ainda sem verificação registrada nesse intervalo. Foram 172 verificações de fonte em 54 estabelecimentos distintos (incluindo rascunhos).
- Verificações registradas hoje: **12** — 8 `ok`, 2 `changed`, 1 `blocked`, 1 `baseline`.
- Lotes de fontes do Pontão consultados com HTTP 200: Café e Um Chêro, Chard by Chicago Prime, Castalia, Soho, Wine Garden, Sallva, Gran Bier e Fausto & Manoel.
- Alterações que exigem conferência manual: Savassi Carne de Sol (Valparaíso) e Na Banca (Sobradinho). Quintal da Tia Sandra: redirecionamento não autorizado; não contornar a restrição. Porks Sobradinho: baseline da fonte oficial, sem mudança de conteúdo detectada.
- A auditoria manual dos 104 estabelecimentos não foi concluída. Não classificar perfis de Instagram como privados ou inexistentes com base em erro de fetch/429/robots.

## Eventos confirmados preparados para revisão

1. **Domingo do CPX — 22/11**, Complexo Fora do Eixo, SAAN, domingo 20h–04h (23/11), line-up conforme página oficial: Gustavo Machado, Nyka, Youssef, Kaio Vinnicius, Uchoa e Rios e Kaca. Fonte: https://www.sympla.com.br/evento/lgc/3656762
2. **Conexão Delas**, Oscarito Brasília, SIG, domingo 22/11, 09h–12h. Encontro Gym Rats com café da manhã, Fit Dance, welcome drink e atividades esportivas. Fonte: https://www.sympla.com.br/evento/conexao-delas/3654214

**Correção preparada:** Sextanejada no Oscarito, 20/11, mantém 19h–02h e passa a refletir o line-up atual da página oficial: DJ MJay às 19h, 22h30 e 01h; Violada Original às 20h30; Henrique & Ruan às 23h. Fonte: https://www.sympla.com.br/evento/sextanejada-no-oscarito/3655650

## Pendências editoriais

- **Perto de Casa — Gravação Audiovisual do Jotapê**, P10 Gastrobar, 22/11: a página apresenta 15h–23h30 no cabeçalho, mas descreve abertura às 16h e encerramento às 22h30. Mantido pendente por conflito de horário; não publicar. Fonte: https://www.sympla.com.br/evento/perto-de-casa-gravacao-audiovisual-do-jotape/3653975
- **B DAY SEM DISTINÇÃO**, Arena P10, 21/11: cabeçalho indica 16h e descrição indica início às 17h. Mantido pendente. Fonte: https://www.sympla.com.br/evento/lgc/3650152
- A busca encontrou eventos em Villa Lounge e Bar, Minas Brasília Tênis Clube e Orla do Clube de Engenharia; não criar fichas sem validação de identidade permanente e aderência ao catálogo.
- Rota do Piseiro/Bar LG: nenhuma publicação oficial atual acessível confirmou a associação; não associar. Galpão dos Brutos permanece sem programação atual.

## Estado técnico e decisão de publicação

- A página pública `/fim-de-semana` respondeu HTTP 200 e apresentou 30 cards no snapshot consultado antes desta proposta. A tabela `events` do Supabase tem 49 registros, mas somente 5 publicados; a agenda editorial pública ainda depende principalmente de seeds locais/fallback.
- As últimas 8 execuções de ingestão consultadas: 7 `succeeded` com zero eventos descobertos/criados/atualizados; 1 falhou com `REDIRECT_BLOCKED`. A descoberta manual por páginas oficiais encontrou os eventos acima.
- As duas novas entradas e a correção do line-up foram preparadas em branch/PR com testes, mas **não serão mergeadas/publicadas nesta rodada**: a cobertura rotativa ainda não alcançou todos os 104 estabelecimentos e a instrução operacional proíbe publicar agenda parcial enquanto a varredura geral estiver em andamento.
- Nenhum evento ou estabelecimento foi gravado diretamente nas tabelas de conteúdo do Supabase. Nenhuma publicação social ou contato com estabelecimentos foi realizado.

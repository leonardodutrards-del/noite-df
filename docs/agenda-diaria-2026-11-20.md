# Operação diária Noite DF — 20/11/2026

## Resumo da rodada

- Base Supabase ativa: **104 estabelecimentos publicados em 22 regiões**; **298 fontes** cadastradas.
- Auditoria rotativa dos últimos 7 dias: ao menos uma fonte verificada para **63 dos 104 estabelecimentos publicados**; 41 ainda sem verificação registrada nesse intervalo. Foram 182 verificações de fonte em 64 estabelecimentos distintos (incluindo rascunhos).
- Verificações registradas hoje: **22** — 16 `ok`, 2 `changed`, 1 `blocked`, 1 `baseline`, 1 `error` e 1 `http_error`.
- Lotes de fontes do Pontão consultados com HTTP 200: Café e Um Chêro, Chard by Chicago Prime, Castalia, Soho, Wine Garden, Sallva, Gran Bier e Fausto & Manoel.
- Alterações que exigem conferência manual: Savassi Carne de Sol (Valparaíso) e Na Banca (Sobradinho). Quintal da Tia Sandra: redirecionamento não autorizado; não contornar a restrição. Porks Sobradinho: baseline da fonte oficial, sem mudança de conteúdo detectada.
- **Dez fontes oficiais adicionais** foram registradas: quatro unidades Jotaká (endereço e funcionamento diário 11h–00h), duas unidades Outback (endereço/horários), página oficial do Infinu na Shotgun (três eventos já presentes no site) e página do evento Jean Tassy no ām.bar (abertura da casa às 19h; show às 20h; evento 19h–03h). Essas quatro unidades Jotaká já existem na base; nenhum perfil novo foi criado.
- Ordinário Bar: site oficial retornou HTTP 502; há divulgação secundária de agenda 20–22/11, mas não houve confirmação oficial acessível. Deboche! respondeu HTTP 200, porém só foi extraído o iframe da página de bio, sem agenda.
- A auditoria manual dos 104 estabelecimentos não foi concluída. Não classificar perfis de Instagram como privados ou inexistentes com base em erro de fetch/429/robots.

## Eventos confirmados preparados para revisão

1. **Domingo do CPX — 22/11**, Complexo Fora do Eixo, SAAN, domingo 20h–04h (23/11), line-up conforme página oficial: Gustavo Machado, Nyka, Youssef, Kaio Vinnicius, Uchoa e Rios e Kaca. Fonte: https://www.sympla.com.br/evento/lgc/3656762
2. **Conexão Delas**, Oscarito Brasília, SIG, domingo 22/11, 09h–12h. Encontro Gym Rats com café da manhã, Fit Dance, welcome drink e atividades esportivas. Fonte: https://www.sympla.com.br/evento/conexao-delas/3654214

**Correção preparada:** Sextanejada no Oscarito, 20/11, mantém 19h–02h e passa a refletir o line-up atual da página oficial: DJ MJay às 19h, 22h30 e 01h; Violada Original às 20h30; Henrique & Ruan às 23h. Fonte: https://www.sympla.com.br/evento/sextanejada-no-oscarito/3655650

## Pendências editoriais

- **Perto de Casa — Gravação Audiovisual do Jotapê**, P10 Gastrobar, 22/11: a página apresenta 15h–23h30 no cabeçalho, mas descreve abertura às 16h e encerramento às 22h30. Mantido pendente por conflito de horário; não publicar. Fonte: https://www.sympla.com.br/evento/perto-de-casa-gravacao-audiovisual-do-jotape/3653975
- **B DAY SEM DISTINÇÃO**, Arena P10, 21/11: cabeçalho indica 16h e descrição indica início às 17h. Mantido pendente. Fonte: https://www.sympla.com.br/evento/lgc/3650152
- **FeijoADA com Amor de Aluguel**, Contexto, 21/11: página alternativa tem o mesmo local e janela de 11h–04h do Sábado Mágico, mas o corpo ainda informa a data antiga 14/11. Tratada como possível duplicata com conteúdo desatualizado; não criar um segundo evento nem copiar preço/promoção sem validação. Fontes: https://www.sympla.com.br/evento/lgc/3626134 e https://www.sympla.com.br/evento/sabado-magico-21-11-varanda-contexto-bar/3626209
- A busca encontrou eventos em Villa Lounge e Bar, Minas Brasília Tênis Clube e Orla do Clube de Engenharia; não criar fichas sem validação de identidade permanente e aderência ao catálogo.
- Rota do Piseiro/Bar LG: nenhuma publicação oficial atual acessível confirmou a associação; não associar. Galpão dos Brutos permanece sem programação atual.

## Estado técnico e decisão de publicação

- A página pública `/fim-de-semana` respondeu HTTP 200 e apresentou 30 cards no snapshot consultado antes desta proposta. A tabela `events` do Supabase tem 49 registros, mas somente 5 publicados; a agenda editorial pública ainda depende principalmente de seeds locais/fallback.
- As 28 execuções de ingestão registradas hoje: 26 `succeeded` e 2 `failed` com `REDIRECT_BLOCKED`; todas registraram zero eventos descobertos/criados/atualizados. Há 14 conectores ativos e 3 em `needs_attention` (dois `FEED_TOO_LARGE` no Alfredo's e um `HTTP_404` no Sauz). A descoberta manual por páginas oficiais encontrou os eventos acima.
- As duas novas entradas e a correção do line-up foram preparadas em branch/PR. O primeiro CI apontou uma falha de expectativa no teste de datas de verificação (o whitelist ainda não incluía 20/11); a expectativa foi corrigida e o CI está sendo reexecutado. A PR permanece draft e **não será mergeada/publicada nesta rodada**: a cobertura rotativa ainda não alcançou todos os 104 estabelecimentos e a instrução operacional proíbe publicar agenda parcial enquanto a varredura geral estiver em andamento.
- Nenhum evento ou estabelecimento foi gravado diretamente nas tabelas de conteúdo do Supabase. Nenhuma publicação social ou contato com estabelecimentos foi realizado.

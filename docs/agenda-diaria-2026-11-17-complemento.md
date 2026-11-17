# Complemento operacional — Noite DF — 17/11/2026

**Rodada complementar:** terça-feira, 17/11/2026, manhã (Brasília).  
**Escopo:** Brasília/DF e Entorno.  
**Este documento complementa** `agenda-diaria-2026-11-17.md`; o relatório anterior registra o estado no momento em que a PR #157 ainda estava pendente.

## 1. Correção pós-deploy e verificação pública

- A **PR #157** foi mergeada em `main` no commit `a09d562861593877434020a5b6933539ff7aef09`.
- O CI **#614** concluiu com sucesso: testes, lint e build aprovados.
- A implantação de produção da Vercel ficou **READY** no commit acima, com os aliases de produção do Noite DF.
- A leitura direta da implantação retornou HTTP 200 para `/agenda-semanal` e `/agenda-mensal`. O HTML entregue contém **43 eventos na semana** e **56 eventos em novembro**.
- Foram confirmados no HTML público os dois novos eventos da PR #156 — Consciência Negra na Babylon Delicatessen e Noite na Skina — e as correções de **A Sertajenada convida + Cardápio em Dobro** e **Festa Toma — Edição Agrobaile** (encerramento às 09h de 22/11).
- O índice do buscador ainda pode exibir o snapshot anterior (41 semanais/54 mensais); a verificação direta da implantação é a evidência atual de publicação.

Links: [PR #156](https://github.com/leonardodutrards-del/noite-df/pull/156) · [PR #157](https://github.com/leonardodutrards-del/noite-df/pull/157) · [Agenda semanal](https://www.noitedf.com.br/agenda-semanal) · [Agenda mensal](https://www.noitedf.com.br/agenda-mensal)

## 2. Base e verificações de fontes

Snapshot consultado no Supabase:
- **104 estabelecimentos publicados**, distribuídos em **22 regiões**.
- **288 fontes** em `data_sources` após registrar a fonte oficial do Porks Sobradinho.
- **32 registros de fontes do Instagram** (30 URLs distintas); **73 estabelecimentos publicados sem URL de Instagram** no campo principal.
- Na rodada, foram verificados **22 URLs distintas** (25 registros de verificação): 8 `ok`, 3 fontes distintas com alteração (6 linhas de verificação, por revisões repetidas), 1 `blocked` e 9 `error`.
- A auditoria manual de todos os 104 estabelecimentos não foi concluída. Não declarar cobertura integral; fontes e estabelecimentos restantes permanecem na rotação.

### Instagram

Nove perfis prioritários foram tentados diretamente nesta rodada: Rancho do Vaqueiro, Eita Lounge Bar, P10 Gastrobar, Palahop, Complexo Fora do Eixo, Oscarito Brasília, Galpão Zero 8, Narguimania e Decky Bar. As nove tentativas retornaram `DisabledError` da ferramenta de navegação. Isso **não** comprova conta privada, inexistente ou bloqueada. Nenhum post foi tratado como visualizado e não houve tentativa de contornar login, CAPTCHA ou controles da plataforma.

## 3. Alteração detectada — Porks Sobradinho

A página oficial [Porks Sobradinho](https://sobradinhoporks.com.br/) passou a exibir, no conteúdo indexado:
- Banda R5 — quinta-feira, 19/11, sem horário no cartão;
- Bella — sexta-feira, 20/11, às 16h;
- Sonoise — sábado, 21/11, às 16h.

O mesmo conteúdo informa que a música ao vivo de sexta e sábado começa a partir das 20h. Há, portanto, conflito entre os cartões de 16h e a informação geral de início às 20h. Além disso, o Noite DF ainda apresenta **Almost Unplugged — 20/11 às 21h**, que não aparece mais na agenda oficial indexada. A abertura direta do site não expôs o calendário completo.

**Decisão:** não substituir, cancelar nem publicar os novos horários sem confirmação oficial inequívoca. A fonte oficial foi registrada em `data_sources` e a alteração/limitação foi gravada em `agenda_source_checks`. O item existente fica pendente de revalidação; ausência na agenda indexada não foi tratada como cancelamento.

## 4. Novo estabelecimento candidato

**Hop Capital Beer — Guará/SIA**
- Site oficial confirma brewpub na fábrica, endereço SIA Trecho 17, Rua 3, Lote 160, telefone (61) 3234-1720 e WhatsApp (61) 99679-8837.
- A página oficial informa funcionamento do brewpub: quarta e quinta 16h–00h, sexta 16h–01h e sábado 12h–02h.
- Fonte: [O Brewpub — Hop Capital Beer](https://hopcapital.com.br/brewpub).

Foi preparado um **rascunho não publicado** no repositório, com fonte e data de verificação. O campo Instagram foi omitido porque não foi confirmado na página oficial consultada. Nenhum registro de estabelecimento foi inserido diretamente no Supabase; o perfil não aparece no catálogo público.

Outros candidatos já existentes como rascunhos no Supabase: Abençoado Bar — Asa Norte, Boteco Sabiá, Vikings Pub Brasília e Boteco Boa Praça. Não foram duplicados. Toinha Brasil Show permanece pendente: a página oficial não abriu e as fontes acessíveis nesta rodada eram diretórios, insuficientes para criar perfil.

## 5. Agenda e limites desta rodada

- As duas novas entradas e as duas correções da PR #156 estão publicadas e visíveis no HTML direto de produção.
- O catálogo `events` do Supabase ainda tem **25 eventos publicados, dos quais 1 com início futuro**; a agenda pública também usa seeds editoriais locais/fallback. Não houve escrita direta de conteúdo de eventos ou estabelecimentos no Supabase.
- Busca atual em Sympla não encontrou nova programação futura publicável para P10 Gastrobar, Bar Stilo 10 ou Telebar; os resultados encontrados eram eventos encerrados. Para perfis cuja principal fonte é Instagram, a indisponibilidade da navegação impede concluir que não haverá programação.
- Quarta-feira fica reservada a varredura reforçada de flyers e agendas de quinta a domingo e início da semana seguinte.

Nenhum post foi publicado nas redes sociais do Noite DF e nenhum estabelecimento foi contatado.

# Operação diária Noite DF — 22/11/2026

## Base e checkpoints

- Supabase: **104 estabelecimentos publicados** em **22 regiões**.
- **101/104 estabelecimentos (97,1%)** tiveram ao menos uma fonte verificada nos últimos 7 dias; **3 permanecem sem fonte verificada**.
- **398 fontes** e **556 verificações** em `data_sources` / `agenda_source_checks`.
- Foram acrescentados **33 pares de fonte/verificação** nesta execução.
- 30 estabelecimentos possuem `agenda_url`; 74 ainda não possuem.
- 65 verificações nas últimas 24h: 36 baseline, 19 ok, 7 changed e 3 error.
- Regiões com fontes de estabelecimentos verificadas nas últimas 24h: Asa Sul, Ceilândia, Granja do Torto, Guará, Lago Sul, Planaltina, Plano Piloto, Samambaia, Sobradinho, Sudoeste e Taguatinga.
- Pendentes sem fonte verificada: Circuito de Comitivas de Planaltina-GO; Chácara BWR; Santa Aldeia Bar.
- Instagram: 32 fontes cadastradas; último status registrado: 30 error, 1 blocked e 1 http_error. Isso não comprova perfil privado ou inexistente.

## Estabelecimentos verificados / revisões

- Galpão 17: Sympla oficial confirma evento futuro em 27/11, endereço SMAS Área Especial G, Conjunto A, Lotes 16 e 17.
  - https://www.sympla.com.br/evento/lgc/3563529
- Pontão do Lago Sul: site oficial confirma centro de lazer, restaurantes, bares, eventos, endereço e horário.
  - https://www.pontao.com.br/o-pontao/o-pontao/
- Bar do Batata: cadastro empresarial público confirma situação ativa e endereço Rodovia DF-230, 1, Planaltina/DF.
  - https://www.econodata.com.br/consulta-empresa/26910820000104-welton-lopes-da-silva-bar-e-lanchonete
- Vila Madalena: ficha pública confirma Vila Madalena Bar Etc, EQ 03/04 Loja 02, Planaltina/DF.
  - https://www.sluurpy.com/pt/planaltina/restaurant/8857866/vila-madalena-bar-etc
- Parque de Exposições Granja do Torto: página da OAB/DF confirma o espaço como local de evento.
  - https://oabdf.org.br/?eventDisplay=venue&post_type=tribe_venue&tribe_venue=parque-de-exposicoes-granja-do-torto
- Abençoado Bar: site oficial confirma a unidade Sudoeste e uma segunda unidade independente na CLN 207, Asa Norte.
  - https://www.abencoadobar.com.br/
  - https://www.abencoadobar.com.br/sudoeste
- Horus Eventus: site do próprio espaço confirma casa de festas, eventos abertos/privados, capacidade informada de até 500 pessoas e endereço Quadra 08, Conjunto A, Lote 17, Sobradinho.
  - https://horuseventus.wordpress.com/
- CB7: página oficial da Sympla confirma evento anterior no endereço Quadra 7, Conjunto C, Sobradinho; nenhuma agenda futura foi encontrada.
  - https://www.sympla.com.br/evento/lgc/3606899
- Fiel Bar e Distribuidora: ficha pública atualizada recentemente confirma QND 43, Lote 01, Loja, Taguatinga Norte, telefone e horários.
  - https://es.restaurantguru.com/FIEL-BAR-E-DISTRIBUIDORA-Brasilia
- SHOT Rock Bar: Comida di Buteco confirma QNF 23, Lote 39, Loja 1A; TocaOnde registra show em 19/11, descoberto em publicação pública de 18/11.
  - https://comidadibuteco.com.br/buteco/shot-rock-bar/
  - https://tocaonde.com.br/events/299288-bruno-z-shot-rock-bar-brasilia
- Fogão Goiano: fonte local identifica o nome atual como **Restaurante Fogão**, anteriormente Fogão Goiano, no mesmo endereço Quadra 06 CL 16. Recomendação de revisão de nome, sem alteração automática.
  - https://www.cliquesobradinho.com.br/empresas/restaurante-fogao-goiano.html
- Club 904, UK Music Hall, Bar do Chaguinha, Bar do Luis e Bardot Music Bar foram pesquisados, mas continuam com divergências de endereço/identidade ou sinais de cadastro antigo. Não alterar endereço/status sem confirmação adicional.

## Eventos novos preparados no seed

Cinco novos eventos foram acrescentados a `data/seeds/events-2026-11-20.ts`:

1. **Texxas Bar — Domingo Top 1**, domingo 22/11, 20h–05h; Ta na Medida, Gala do Piseiro e DJ Eddy Viana.
   - https://www.sympla.com.br/evento/lgc/3656778
2. **A Night To Remember — HSM vs Camp Rock**, sexta 27/11, 21h–04h, Anexo BZ, SAAN Quadra 2, Lote 45; pista a partir de R$ 30.
   - https://www.sympla.com.br/evento/lgc/3594013
3. **Vértice — House**, sábado 28/11, 22h–06h, Complexo Fora do Eixo; sete artistas anunciados.
   - https://www.sympla.com.br/evento/lgc/3657195
4. **Dexcomplica — Edição Beira Lago**, sábado 28/11, 20h–06h, Clube de Engenharia de Brasília, SCES Trecho 2. Mantido distinto da Orla do Pier 21.
   - https://www.sympla.com.br/evento/lgc/3634141
5. **Réveillon Texxas Prime**, 31/12, 19h–06h; open bar/food das 19h às 21h30, Wilian Dias confirmado e demais atrações ainda a confirmar.
   - https://www.sympla.com.br/evento/lgc/3578484

Eventos já existentes nos seeds anteriores e não duplicados: Dominguinho da Club (22/11), Surra de Modão + Cardápio em Dobro (25/11), We The Funk (26/11), Biu do Piseiro (27/11) e Marília Tavares (28/11) no Texxas/Amsterdam conforme os locais já registrados.

Surra de Modão foi revalidado na página oficial: quarta 25/11, 18h–02h, Varanda do Contexto; Marlon, Melão, Júnior Ferreira, A Sertanejada e Dalmi; promoção de cardápio em dobro das 18h às 21h.
- https://www.sympla.com.br/evento/lgc/3626412

## Candidatos em draft

Quatro novos perfis foram adicionados nesta rodada, sem publicação:

- Anexo BZ — SAAN, Quadra 2, Lote 45.
- Club Gastrobar — Valparaíso de Goiás; lote exato ainda precisa de conciliação.
- New Khoder Lounge & Bar — SHCN CLN 210, Bloco D, Loja 60.
- Abençoado Bar — Asa Norte, CLN 207, Bloco A; segunda unidade confirmada pelo site oficial, separada da unidade Sudoeste.

O perfil Texxas Bar existente em draft teve a fonte oficial atualizada para 22/11. O arquivo `data/seeds/places-2026-11-20.ts` agora contém **11 candidatos em draft**. Nenhum novo perfil foi inserido diretamente em `establishments`.

## Pendências de eventos

- Paparico / Anexo BZ (28/11, 21h–04h): resultado oficial da Sympla e fontes locais indicam data e local, mas a abertura direta retornou 404. Mantido pendente.
  - https://www.sympla.com.br/evento/lgc/3644294
- Beleléu no Lago / Estação Beira Lago (28/11, 15h–23h): resultado oficial da Sympla e agregadores corroboram, mas a abertura direta retornou 404. Mantido pendente.
  - https://www.sympla.com.br/evento/lgc/3653094
- Inauguração Complexo do Povo (28/11, 21h–04h): descrição aponta Águas Lindas/GO, enquanto cabeçalho e bloco Local da Sympla indicam Brasília/DF.
  - https://www.sympla.com.br/evento/inauguracao-complexo-do-povo/3646495
- Nenhuma associação nova da Rota do Piseiro ao Bar LG: não foi localizada publicação/flyer oficial atual que confirme esse vínculo.
- Galpão dos Brutos continua sem programação atual confirmada.

## Estado Supabase, GitHub e publicação

- A tabela `events` tem 49 registros: 45 expired, 3 draft e 1 pending_review; **zero eventos futuros com status published** e um evento futuro em draft.
- Os eventos desta rodada foram preparados apenas no seed da branch/PR; não houve insert direto em `events`.
- PR #163 permanece aberta em draft:
  - https://github.com/leonardodutrards-del/noite-df/pull/163
- `events-2026-11-20.ts` contém 23 objetos; `places-2026-11-20.ts` contém 11 candidatos em draft.
- CI #685: **81 arquivos de teste e 322 testes aprovados**, lint aprovado com quatro avisos e build aprovado.
- Os logs do CI exibem `SUPABASE_ADMIN_REQUEST_FAILED_401` no ambiente de teste, com fallback para agenda local verificada; isso não foi tratado como prova de falha de produção.
- Preview Vercel: **READY** no commit `c64d484b054152bd63ed782293337638a0f83349`.
  - https://noite-5okiv3xpu-leonardodutrards-dels-projects.vercel.app
- O crawler externo não conseguiu abrir o Preview protegido; READY confirma o deployment, mas não uma validação visual independente.
- Produção permanece READY no deployment anterior. A página pública consultada ainda mostra o fim de semana 20–22/11 (20 eventos) e 32 eventos válidos em novembro; os cinco eventos desta rodada ainda não estão publicados em produção.
  - https://www.noitedf.com.br/fim-de-semana
  - https://www.noitedf.com.br/agenda-mensal
- Nenhum merge ou deploy de produção foi feito. Não publicar no Instagram/feed/Stories e não contatar estabelecimentos.


## Complemento de 22/11/2026 — nova verificação de eventos e candidatos

### Base e checkpoint
- Supabase: **104 estabelecimentos publicados em 22 regiões**; **101/104** tiveram ao menos uma fonte verificada nos últimos sete dias; **3 permanecem pendentes**: Circuito de Comitivas de Planaltina-GO, Chácara BWR e Santa Aldeia Bar.
- **407 fontes e 565 verificações** em data_sources / agenda_source_checks.
- 74 verificações nas últimas 24h, distribuídas em 36 estabelecimentos distintos e nove páginas de eventos/candidatos: 37 baseline, 27 ok, 7 changed e 3 error.
- 30 estabelecimentos têm agenda_url; 74 não têm. Há 31 estabelecimentos com Instagram preenchido; 32 registros de fonte Instagram (30 URLs distintas), com últimos status 30 error, 1 blocked e 1 http_error. Não classificar como privado/inexistente sem evidência.
- Não há tabela dedicada de checkpoint identificada. O progresso verificável ficou persistido em data_sources / agenda_source_checks; os três estabelecimentos sem fonte permanecem explicitamente pendentes.

### Cinco novos eventos preparados no seed
- **Forró na Varanda**, terça 24/11, 18h–01h, Contexto Bar. Página oficial do produtor confirma endereço e horário. [Sympla](https://www.sympla.com.br/evento/lgc/3625162)
- **Deu Mó Love**, sexta 27/11, 18h–04h, Contexto Bar; Grupo Doze Por Oito e DJs residentes. [Sympla](https://www.sympla.com.br/evento/deu-mo-love-27-11-varanda-do-contexto/3628685)
- **BAILÃO 2000**, sexta 27/11, 22h–05h, EXTERNA, Centro Comercial Amazonas; LXKS, DJ A, New Nay, Ketlen e Ursula. Cortesias limitadas aos 500 primeiros até meia-noite; entrada fácil paga a partir de R$40. [Sympla](https://www.sympla.com.br/evento/lgc/3652711)
- **Texxas Bar — Domingo Top 1**, domingo 29/11, 20h–05h, Núcleo Bandeirante; Violada Original, Gala do Piseiro e DJ Eddy Viana. Couvert artístico e classificação 18+. [Sympla](https://www.sympla.com.br/evento/texxas-bar-domingo-top-1-vespera-de-feriado-violada-original-gala-do-piseiro-dj-eddy-viana/3660509)
- **Réveillon VBQ 2027**, 31/12, 20h–04h (01/01/2027), Villa Butiquim — Samambaia Sul; DJ Santini, Luiz Marcelo e Matheus, DJ Vinny, open food e queima de fogos. [Sympla](https://www.sympla.com.br/evento/reveillon-vbq-2027/3660940)

Surra de Modão (25/11), We The Funk (26/11), Rock 90 (27/11) e Chrigor (29/11) já existiam em seeds anteriores; foram revalidados e não duplicados. Foram registrados oito novos pares de fonte/verificação para páginas oficiais já abertas, além de um registro baseline para a pendência abaixo.

### Candidatos adicionados em draft
- **Saguari Gastro House — Samambaia:** site oficial confirma QS 310, Conjunto 5, Lote 7, telefone, horários, cardápio, coquetelaria e estrutura para eventos. [Site oficial](https://www.saguarigastrohouse.com.br/)
- **EXTERNA — Asa Sul:** Sympla identifica o local e o produtor no Centro Comercial Amazonas; endereço completo SCS Q.5 Bloco B Lote 74 é corroborado por diretórios públicos. [Evento oficial](https://www.sympla.com.br/evento/lgc/3652711)

O seed de candidatos passa a conter **13 perfis em draft**. Nenhum perfil foi inserido diretamente em establishments.

### Pendências de evento
- **Sábado Mágico — 28/11, Contexto:** cabeçalho e campo Data/Horário da Sympla indicam 11h, mas a descrição diz que a programação começa às 12h. Fonte registrada como baseline com conflito; evento não incluído no seed até conciliação. [Sympla](https://www.sympla.com.br/evento/sabado-magico-28-11-varanda-contexto-bar/3626211)
- Paparico / Anexo BZ e Beleléu no Lago / Estação Beira Lago continuam pendentes por erro 404 na abertura direta das páginas oficiais.
- Inauguração Complexo do Povo permanece pendente por divergência entre Águas Lindas/GO e Brasília/DF.
- Rota do Piseiro continua sem flyer atual que confirme vínculo com Bar LG; Galpão dos Brutos permanece sem programação atual confirmada.

### Supabase, GitHub e publicação
- events contém 49 registros: 45 expired, 3 draft e 1 pending_review; **zero eventos futuros com status published** e um draft futuro. Os cinco eventos novos estão somente no seed da PR.
- events-2026-11-20.ts passa a conter **28 objetos**; places-2026-11-20.ts, **13 candidatos**.
- PR #163 permanece em draft: https://github.com/leonardodutrards-del/noite-df/pull/163
- CI #686 e Preview Vercel estavam aprovados/READY no head anterior 9d598748; os novos arquivos e testes desta atualização precisam de nova execução de CI e novo Preview.
- Nenhum merge ou deploy de produção foi feito. Nenhum conteúdo foi publicado em Instagram/feed/Stories e nenhum estabelecimento foi contatado.


## Fechamento complementar — 22/11/2026, 09h09–09h30 (Brasília)

### Base, cobertura e checkpoint
- Supabase consultado diretamente: **104 estabelecimentos publicados em 22 regiões**.
- **101/104** tiveram ao menos uma fonte verificada nos últimos sete dias; permanecem **3 pendentes**: Circuito de Comitivas de Planaltina-GO, Chácara BWR e Santa Aldeia Bar.
- **410 data_sources e 568 agenda_source_checks** após esta rodada. Foram gravados três novos pares fonte/verificação: evento Biu do Piseiro na Arena Adega, fonte de estabelecimento Arena Adega e evento VOA Festival.
- Nas últimas 24h: **75 verificações** — 36 baseline, 29 ok, 7 changed e 3 error.
- **74 estabelecimentos publicados não têm agenda_url**.
- 31 estabelecimentos têm Instagram preenchido. Há 30 URLs distintas de Instagram com status mais recente: 28 error, 1 blocked e 1 http_error. Não interpretar falhas de fetch/bloqueios como perfil privado ou inexistente.
- Não foi identificada tabela dedicada de checkpoint; o progresso durável está em data_sources / agenda_source_checks. Os três estabelecimentos sem fonte permanecem explicitamente pendentes.

### Dois eventos oficiais adicionais preparados
1. **Biu do Piseiro na Adega dos Amigos** — sábado 28/11, 20h–04h (29/11), Arena Adega dos Amigos, EQNN 2/4 Bloco C Loja 5, Ceilândia Sul. A página oficial confirma Biu do Piseiro, DJ Juninho Sem Rumo, Biah Souza, Renan Diniz, local e produtor Arena Adega Eventos. [Sympla](https://www.sympla.com.br/evento/lgc/3646093)
   - A consulta de duplicidade por nome/endereço confirmou que **Arena Adega dos Amigos já é estabelecimento publicado** no Supabase (id `arena-adega-dos-amigos`). Não foi criado novo perfil.
2. **VOA Festival 4ª Edição** — 27 a 29/11, CAIXA Cultural Brasília, área externa/estacionamento, SBS Quadra 4, lotes 3/4, Asa Sul. Programação oficial: 27/11 a partir das 19h; 28/11 a partir das 19h; 29/11 a partir das 18h. Atrações incluem Duda Beat, Gaby Amarantos, Arnaldo Antunes, Melly, Pratanes, Gabriel Grossi Trio convida Dora Sanches, Kirá, Seu Pereira e Coletivo 401, Guiss Guiss Bou Bess e Mari Coelho. [Sympla](https://www.sympla.com.br/evento/voa-festival-4-edicao/3635345)
   - O evento foi incluído como item de agenda com o local textual. Nenhum perfil de CAIXA Cultural foi criado nesta rodada.

### Eventos e candidatos que permanecem pendentes
- **Paparico / Anexo BZ:** a busca indexada da Sympla apresenta data 28/11, 21h–04h e endereço SAAN Q2 Lote 45, mas a abertura direta retornou 404 nesta rodada. Mantido pendente, sem publicação. [Sympla](https://www.sympla.com.br/evento/lgc/3644294)
- **Beleléu no Lago / Estação Beira Lago:** a página oficial voltou a aparecer acessível em resultado de busca com data 28/11, 15h–23h, local Estação Beira Lago e atrações Béli & Leozinho; contudo, a verificação direta anterior retornou 404. A página ainda precisa ser reaberta/validada em fonte oficial acessível antes de sair de pendente. [Sympla](https://www.sympla.com.br/evento/lgc/3653094)
- **Circuito de Comitivas de Planaltina-GO, Chácara BWR e Santa Aldeia Bar:** buscas públicas adicionais não localizaram fonte oficial atual suficiente; continuam na lista dos três estabelecimentos sem fonte verificada nesta janela.
- **Rota do Piseiro / Bar LG:** nenhuma associação sem flyer/post atual confirmando o local. **Galpão dos Brutos** segue sem programação atual confirmada.
- **PAPARICO** não foi incorporado ao seed; **VOA Festival** e **Biu do Piseiro na Adega** foram incorporados após validação direta da página oficial.

### GitHub, testes e publicação
- `data/seeds/events-2026-11-20.ts` recebeu dois objetos novos; o seed passa de **28 para 30 eventos**.
- `data/seeds/places-2026-11-20.ts` permanece com **13 candidatos em draft**; nenhum perfil foi inserido diretamente na tabela `establishments`.
- A tabela `events` do Supabase permanece com 49 registros: 45 expired, 3 draft e 1 pending_review; **zero eventos futuros publicados**. Os eventos novos continuam somente no seed/PR.
- PR #163 permanece em draft: https://github.com/leonardodutrards-del/noite-df/pull/163
- O commit `d63155338a67b15b0be19d0b4f03b3e8aa7a2cd8` contém os dois eventos novos. A execução de CI e o Preview correspondentes precisam ser conferidos antes de qualquer merge.
- Produção não foi alterada nesta rodada. Não houve publicação em Instagram/feed/Stories nem contato com estabelecimentos.

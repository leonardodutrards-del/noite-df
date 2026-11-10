# Cobertura diária e agenda — 10 a 16/11/2026

**Verificação:** 10/11/2026, 08:07–08:30 (America/Sao_Paulo)  
**Escopo:** Brasília/DF e Entorno; base dinâmica do Supabase; fontes oficiais e páginas oficiais de ingresso.  
**Branch:** `agenda/2026-11-10-daily`

## Resumo executivo

- **104 estabelecimentos publicados** carregados diretamente do Supabase; **22 regiões** cobertas.
- **10 estabelecimentos já cadastrados** têm programação datada confirmada para o período; **94 não tiveram agenda datada localizada** nas fontes oficiais consultadas.
- **23 eventos novos** preparados neste PR; somados aos 12 eventos já publicados da rodada anterior, a agenda do período passa a ter **35 eventos** em 11 locais (inclui uma ocorrência em Estação Beira Lago, cujo perfil permanece em rascunho).
- **0 novos perfis publicados; 1 candidato em rascunho:** Estação Beira Lago. O perfil permanece draft no branch e não foi inserido no Supabase.
- **6 ocorrências candidatas/pendentes** não foram publicadas por falta de confirmação oficial ou por divergência de data, horário, endereço ou identidade.
- Nenhum estabelecimento foi despublicado por falta de post recente. Nenhuma mensagem foi enviada a estabelecimentos. Nenhum feed ou Story do Noite DF foi publicado.

## Base, cobertura e Instagram

### Cobertura

As 22 regiões presentes no banco foram carregadas e cobertas: Águas Claras, Asa Norte, Asa Sul, Brasilinha · Entorno, Ceilândia, Cidade Ocidental · Entorno, Gama, Granja do Torto, Guará, Jardim Ingá · Entorno, Lago Sul, Park Way, Planaltina, Plano Piloto, SAAN, Samambaia, Setor de Clubes Sul, SIG, Sobradinho, Sudoeste, Taguatinga e Valparaíso · Entorno.

### Instagram cadastrado

- 30 campos de Instagram foram encontrados nos 104 perfis; 28 URLs distintas.
- 27 URLs distintas apontam para perfis; uma URL cadastrada aponta para um Reel, não para um perfil.
- Há dois handles repetidos entre unidades: Figueiredo Cozinha e Bar (Planaltina/Valparaíso) e Palorama Burguer (Quadra 8/Sobradinho II). Mantidos como unidades separadas; não houve fusão automática.
- Foram feitas tentativas diretas de acesso sem login, sem CAPTCHA e sem contornar controles. O coletor retornou bloqueio/limitação, 429, erro de fetch ou cache miss. O log de verificação foi registrado em `agenda_source_checks` no Supabase: **29 bloqueados/limitados e 1 erro de tipo de URL**.
- Não foi possível concluir que algum perfil é privado, inexistente ou publicamente acessível. A classificação correta para os perfis inacessíveis é **acesso limitado pela ferramenta; status público/privado não determinável**. A URL de Reel foi marcada como erro/identidade não confirmada.
- Três perfis adicionais foram identificados por links em sites oficiais e preparados para atualização cadastral: `@porks_sobradinho`, `@dudubaroficial` e `@ticianawerner`. As páginas diretas também foram limitadas pela ferramenta; a identidade foi confirmada pelo site oficial que as aponta.
- `@estacaobeiralago` aparece no identificador do Linktree, mas o link direto do Instagram não foi confirmado; o campo Instagram do novo perfil ficará vazio até confirmação.
- `@surrademodao` e a tentativa de `@rotadopiseiro` não puderam ser confirmados por acesso direto. O evento Surra de Modão foi confirmado pela página oficial de ingresso, não pela leitura do feed.

## Agenda consolidada — 10 a 16/11

### Terça-feira, 10/11

1. **18h–01h — Forró na Varanda**, Contexto Bar e Restaurante (Setor de Clubes Sul). Forró ao vivo. [Sympla](https://www.sympla.com.br/evento/forro-na-varanda-10-11-varanda-do-contexto/3625147)
2. **19h–23h30 — Dia do Vinho / Rosana Brown ao vivo**, Ticiana Werner Wine Bar (Asa Sul). Evento especial com degustação e música; a página oficial informa vagas esgotadas. [Programação oficial](https://www.ticianawerner.com.br/musica.php)
3. **20h–23h59 — Independence Day 22**, Infinu Comunidade Criativa (Asa Sul). Antena Rock, Illinois, Verônica e Misfortune; rock. [Shotgun](https://shotgun.live/fr/festivals/independence-day-22)

### Quarta-feira, 11/11

1. **18h–02h — Surra de Modão + Cardápio em Dobro**, Contexto Bar e Restaurante (Setor de Clubes Sul). Sertanejo/modão; Marlon, Melão e Júnior Ferreira, com convidados anunciados. [Sympla](https://www.sympla.com.br/evento/surra-de-modao-cardapio-em-dobro-11-11-varanda-do-contexto/3626358)
2. **19h30–23h — PJ Camargo**, Ticiana Werner Wine Bar (Asa Sul). Jazz lounge; couvert anunciado de R$18 nas áreas indicadas pela casa. [Programação oficial](https://www.ticianawerner.com.br/musica.php)
3. **20h15–23h — Isso é Jazz?! — Marlene Souza Lima**, Infinu (Asa Sul). MSL Trio; jazz, bossa nova e MPB. [Shotgun](https://shotgun.live/es/events/isso-e-jazz-57)

### Quinta-feira, 12/11

1. **18h — Quinta MPB — Ben Brasileiro**, ām.bar (Asa Sul). Entrada gratuita; encerramento não informado na agenda oficial. [Agenda oficial do ām.bar](https://shotgun.live/pt-br/venues/am-bar)
2. **19h–23h50 — Plug & Play — jam aberta**, Porks Sobradinho. Jam recorrente toda quinta; 12/11 é a ocorrência correspondente à quinta-feira desta semana. Entrada e couvert anunciados como gratuitos. [Agenda oficial do Porks](https://sobradinhoporks.com.br/#agenda)
3. **19h–23h — Tranquilo Apresenta Lamparina**, Infinu (Asa Sul). Show ao vivo; a casa abre às 19h. [Shotgun](https://shotgun.live/pt-pt/events/tranquilobrasilia-2026-11-12)
4. **19h30–23h — Regina Sartori**, Ticiana Werner Wine Bar (Asa Sul). Bossa nova, pop e repertório internacional; couvert R$18 nas áreas indicadas. [Programação oficial](https://www.ticianawerner.com.br/musica.php)
5. **21h–04h — We The Funk**, Contexto Bar e Restaurante (Setor de Clubes Sul). Funk. [Sympla](https://www.sympla.com.br/evento/we-the-funk-12-11-varanda-do-contexto-o-funk-e-nosso/3625196)

### Sexta-feira, 13/11 — destaque

1. **18h–04h — Deu Mó Love**, Contexto Bar e Restaurante (Setor de Clubes Sul). Pagode e DJs de funk. [Sympla](https://www.sympla.com.br/evento/deu-mo-love-13-11-varanda-do-contexto/3628678)
2. **19h–03h — Reconvexa em Casa Nova**, ām.bar (Asa Sul). Samba, MPB, forró e pop; cortesia até 21h e lote promocional a partir de R$15, conforme agenda do local. [Agenda oficial do ām.bar](https://shotgun.live/pt-br/venues/am-bar)
3. **19h30–23h — Marrí**, Ticiana Werner Wine Bar (Asa Sul). Soul/pop; couvert R$18 nas áreas indicadas. [Programação oficial](https://www.ticianawerner.com.br/musica.php)
4. **20h — Rádio Capital**, Porks Sobradinho. Rock ao vivo; encerramento não informado. [Agenda oficial do Porks](https://sobradinhoporks.com.br/#agenda)
5. **20h–02h — Rock da Sorte**, Galpão 17 (SMAS/Guará). Macacos Hidráulicos, 4 Santos e DJ Wellington; rock. [Sympla](https://www.sympla.com.br/evento/rock-da-sorte-no-galpao-17/3631237)
6. **21h–05h — Festa do Pisa**, Complexo Fora do Eixo (SAAN). Festa com DJs e atrações anunciadas pelo organizador. [Sympla](https://www.sympla.com.br/evento/festa-do-pisa-13-de-novembro/3632580)
7. **22h–06h — BRIME!!**, Birosca do Conic (Setor Comercial Sul). A agenda oficial lista o evento; a página do local não detalha atrações individuais nesta listagem. Lote listado a partir de R$40. [Agenda oficial do Birosca](https://shotgun.live/pt-br/venues/birosca)

### Sábado, 14/11 — destaque

1. **11h–04h — Sábado Mágico**, Contexto Bar e Restaurante (Setor de Clubes Sul). Feijoada, happy hour, pagode e DJs. [Sympla](https://www.sympla.com.br/evento/sabado-magico-14-11-varanda-contexto-bar/3626205)
2. **16h–20h — Bella e o Olmo da Bruxa**, Infinu (Asa Sul). Rock alternativo. [Shotgun](https://shotgun.live/en/events/bella-e-o-olmo-da-bruxa-em-brasilia)
3. **19h–03h — Pequila 12 Anos**, ām.bar (Asa Sul). Música latina, salsa, reggaeton, pop, bachata e merengue; lote listado a partir de R$15. [Agenda oficial do ām.bar](https://shotgun.live/pt-br/venues/am-bar)
4. **19h30–23h — Alysson Takaki**, Ticiana Werner Wine Bar (Asa Sul). Love songs/pop; couvert R$18 nas áreas indicadas. [Programação oficial](https://www.ticianawerner.com.br/musica.php)
5. **20h–01h — Noite de Tributos**, Trends Pub (Gama; anúncio chama o local de Trend’s Bar). BKD Guns e Bon Jovi Experience. [Sympla](https://www.sympla.com.br/evento/noite-de-tributos/3631271)
6. **20h–02h — Flashback 80s — Disco**, Galpão 17 (SMAS/Guará). Disco, pop e rock. [Sympla](https://www.sympla.com.br/evento/flashback-80s-galpao-17/3632239)
7. **20h — Velho Olho Vermelho**, Porks Sobradinho. Rock ao vivo; encerramento não informado. [Agenda oficial do Porks](https://sobradinhoporks.com.br/#agenda)
8. **20h — BSB Punk Fest — Bullet Bane**, Infinu (Asa Sul). Punk/hardcore; a agenda oficial do Infinu lista o evento para 20h, sem horário final na listagem. [Agenda oficial do Infinu](https://shotgun.live/pt-br/venues/infinu-comunidade-criativa)
9. **21h–05h — Toca da Bruxa**, Complexo Fora do Eixo (SAAN). Funk bruxaria e festa temática. [Sympla](https://www.sympla.com.br/evento/toca-da-bruxa-14-de-novembro/3637835)
10. **22h–06h — Sambay BSB**, Birosca do Conic (Setor Comercial Sul). Samba, pagode e pop; lote listado a partir de R$25. [Agenda oficial do Birosca](https://shotgun.live/pt-br/venues/birosca)
11. **23h–03h — Seasons — Bailão**, Infinu (Asa Sul). DJs Klap, Bo e Rios; a página não define um gênero único. [Shotgun](https://shotgun.live/fr/events/seasons)

### Domingo, 15/11 — destaque

1. **15h–23h59 — Chama no Pagode**, Estação Beira Lago (Setor de Clubes Sul). Sudário (MG), Lucas Alves e DJs. [Sympla](https://www.sympla.com.br/evento/lgc/3631552)
2. **18h–23h59 — Cabaré Noturno — Plastique Noir**, Infinu (Asa Sul). Darkwave, coldwave, post-punk, gothic rock e dark synth; DJs Moa e Fernoca. Preço/lotes não visíveis no conteúdo acessível. [Shotgun](https://shotgun.live/pt-br/events/cabare-noturno-plastique-noir).
3. **19h–23h — 3ª Dream Factory**, Galpão 17 (SMAS/Guará). Festival de pole dance e linguagens da dança, mais de 30 apresentações; classificação 18+. [Sympla](https://www.sympla.com.br/evento/3a-dream-factory/3597505)
4. **21h–23h59 — Papangu**, Infinu (Asa Sul). Rock progressivo/experimental. [Shotgun](https://shtgn.live/pt-br/events/papanguembsb-2)
5. **22h–05h — Os Meninos de Barão no Telebar**, Telebar (Ceilândia). Show ao vivo; o gênero não é especificado na página do organizador. [Sympla](https://www.sympla.com.br/evento/os-meninos-de-barao-no-telebar-15-11/3632223)

### Segunda-feira, 16/11

1. **19h30–23h — PJ Camargo**, Ticiana Werner Wine Bar (Asa Sul). Jazz lounge; couvert R$18 nas áreas indicadas. [Programação oficial](https://www.ticianawerner.com.br/musica.php)

## Estabelecimentos sem agenda datada localizada

**94 dos 104 perfis publicados** não tiveram agenda datada e confirmada para 10–16/11 nas fontes oficiais consultadas. Isso não indica fechamento. Lista por região:

- **Águas Claras:** Jotaká Cozinha e Bar — Águas Claras; Macaco Velho Chopp Bar; Outback Steakhouse — DF Plaza; Pipa Drinks Águas Claras.
- **Asa Norte:** Alfredo’s Pizzaria — Asa Norte; Bar Godofredo; Deboche! Bar; IVV Swinebar; Outback Steakhouse — Conjunto Nacional; Xique Xique — Asa Norte.
- **Asa Sul:** Alfredo’s Pizzaria — Asa Sul; Bar Responsa; Club 904; Dudu Bar; Jotaká Cozinha e Bar — Asa Sul; Ordinário Bar e Música; Outback Steakhouse — Shopping Venâncio; UK Music Hall; Xique Xique — Asa Sul.
- **Brasilinha · Entorno:** Circuito de Comitivas de Planaltina-GO.
- **Ceilândia:** Arena Adega dos Amigos; Bar do Chaguinha; Bar do Luis; Frango no Pote — Ceilândia; Jotaká Cozinha e Bar — Ceilândia.
- **Cidade Ocidental · Entorno:** Clube AQUA.
- **Gama:** Bar do Buchada; Dom ManJu Restaurante Bar — Gama.
- **Granja do Torto:** Parque de Exposições Granja do Torto.
- **Guará:** Bar do Galego; Mangút Restaurante — Guará; Sauz Restaurante; Savassi Carne de Sol — Guará.
- **Jardim Ingá · Entorno:** Chácara BWR.
- **Lago Sul:** Café e um Chêro — Pontão; Castália — Pontão; Chard by Chicago Prime; Fausto & Manoel — Pontão; Gran Bier; Manzuá — Pontão; Mormaii Surf Bar; Pontão do Lago Sul; Sallva Bar & Ristorante; Same Same — Pontão; Soho — Pontão; Temporâneo (AABB); Wine Garden — Pontão.
- **Park Way:** Patú Anú — Park Way.
- **Planaltina:** Bar do Batata; Bendito Bar; Figueiredo Cozinha e Bar — Planaltina; Moema Pizzaria — Planaltina; Rancho do Vaqueiro; Vila Madalena.
- **Plano Piloto:** Arena Mané Garrincha.
- **Samambaia:** SamamBar.
- **SIG:** Oscarito Brasília; P.Ovo — SIG; Quintal da Tia Sandra.
- **Sobradinho:** Arena P10; Bar Stilo 10; Brasileirinho Bar e Restaurante; CB7; Chopp Brasília Bier Sobradinho; Clube 27 Bar; Decky Bar; Eita Lounge Bar; Fogão Goiano; Galpão dos Brutos; Galpão Zero 8; Horus Eventus; Latinos Bar; Na Banca; Narguimania Show Bar; Oito Gastrobar; P10 Gastrobar; Palahop; Palorama Burguer — Quadra 8; Palorama Burguer — Sobradinho II; Pança Cheia; Santa Aldeia Bar.
- **Sudoeste:** Abençoado Bar; Meatz Burger — Sudoeste.
- **Taguatinga:** Bar do Assis; Bardot Music Bar; Boteco da Madá; Fiel Bar e Distribuidora; Jotaká Cozinha e Bar — Taguatinga; Olinda Bar e Restaurante; Outback Steakhouse — JK Shopping; SHOT Rock Bar.
- **Valparaíso · Entorno:** Bahrein Cozinha e Bar; Figueiredo Cozinha e Bar; Savassi Carne de Sol — Valparaíso.

## Novos estabelecimentos e candidatos

### Candidato em rascunho — não publicado

**Estação Beira Lago** — candidato de bar no SCES Trecho 1, Conjunto 3, Setor de Clubes Sul, entre AABR e ASEEL. Linktree público associado ao nome: https://linktr.ee/estacaobeiralago. Telefone/WhatsApp divulgado: (61) 99958-1311. A página oficial de ingresso do evento Chama no Pagode confirma o local e o endereço; o Linktree oferece cardápio, reservas e localização, mas o vínculo institucional do Linktree e o Instagram oficial não foram confirmados de forma independente. Por cautela, o perfil permanece em `draft`, com `verified=false`, não é publicado e não será inserido no Supabase nesta rodada. O destino do cardápio em Drive não foi aberto pelo coletor.

### Candidatos/eventos pendentes — não publicados

- **SofTown / The Pitch Pub — Blues and Burguer, 13/11:** página de ingresso indica 19h, mas a descrição chama 13/11 de quinta-feira (a data cai numa sexta). A identidade do espaço como clube privado também exige confirmação de acesso público.
- **ARUC / Complexo Kiosque Jeito Carioca — SeXtOu no Jeito Carioca, 13/11:** página Sympla indica 16h no cabeçalho e 19h na descrição; não publicar até resolver o horário e a relação entre associação e quiosque.
- **Vitrinni Lounge Club — Depois das Nove É Funk, 14/11:** divergência de endereço entre QS 405 e QS 406 e sinal de situação cadastral conflitante em fonte pública; manter pendente.
- **Espaço Contra Urbano Liberta — Rock Nation Fest, 14/11:** página de ingresso indica 19h no cabeçalho e 20h na descrição; estabelecimento ainda sem perfil oficial inequívoco no banco.
- **Quintal da Tia Sandra — Quarta Delas, 11/11:** apareceu em fonte secundária, mas a página oficial consultada não apresentou data, horário e atração verificáveis.
- **Queen Bar — Maldita Sexta, 13/11:** não foi localizada página oficial do estabelecimento ou página oficial de ingresso verificável; não publicar.

### Prioridades sem confirmação suficiente

- **Rota do Piseiro / Bar LG:** não foi localizado perfil oficial inequívoco nem flyer atual que confirme o Bar LG como local. Não associar ao Galpão dos Brutos.
- **Espaço LG Sobradinho:** manter exatamente esse nome até identificação oficial inequívoca; não consta como perfil publicado.
- **Galpão dos Brutos:** mantido separado e sem agenda atual; respeitada a informação de que está parado há algum tempo.
- **Surra de Modão:** evento confirmado no Contexto em 11/11; não foi associado ao Bar LG.
- **Arena P10 / P10 Gastrobar:** fontes públicas apontam para o mesmo endereço/operação, mas a relação entre os dois perfis ainda precisa de revisão humana; não houve fusão.
- **Oito Gastrobar:** fontes públicas divergem em telefone e complemento de endereço; nenhum dado foi sobrescrito sem confirmação oficial.

## Correções cadastrais preparadas para aplicar após aprovação técnica

- Dudu Bar: site oficial aponta para `@dudubaroficial`; endereço oficial SCLS 303, Bloco A, Via W3 Sul. Não há agenda pública datada para esta semana.
- Ticiana Werner Wine Bar: agenda oficial em `/musica.php`, Instagram apontado pelo próprio site (`@ticianawerner`) e endereço CLS 201, Bloco C, lojas 05–11.
- Porks Sobradinho: site oficial aponta para `@porks_sobradinho`; programação confirma Plug & Play semanal às quintas e shows em 13 e 14/11.
- Infinu: agenda oficial Shotgun e endereço completo CRS 506, Bloco A, Loja 67.
- ām.bar: agenda oficial Shotgun com três eventos nesta semana.
- Birosca do Conic: agenda oficial Shotgun com dois eventos nesta semana.
- Trends Pub: página Sympla confirma endereço Quadra 05, Lote 20, Setor Industrial do Gama.

## Qualidade, pendências e segurança

- A rotina carregou os 104 perfis publicados dinamicamente; não usou lista fixa.
- Nenhum perfil foi despublicado por falta de post recente.
- Eventos sem data/hora/local completos, com divergência ou sem fonte primária foram mantidos fora da agenda pública.
- Nenhuma tentativa de login, scraping proibido, CAPTCHA ou bypass foi realizada.
- Nenhuma mensagem foi enviada a estabelecimentos; nenhum feed ou Story do Noite DF foi publicado.
- A rodada é de terça-feira. A varredura reforçada de flyers está prevista para a próxima execução de quarta-feira, 11/11.
- **Status técnico no momento da preparação:** conteúdo em branch/PR; publicação em produção depende de testes, lint, build, Vercel Preview READY e merge.

# Operação diária de cobertura e agenda — 13/11/2026

Rodada executada em 13/11/2026, horário local America/Sao_Paulo. Escopo: Brasília/DF e Entorno. A base foi carregada do Supabase no início da rodada; alterações de conteúdo ficaram restritas à branch/PR.

## 1. Base e cobertura

- **104 estabelecimentos publicados** consultados; **22 regiões** cobertas.
- **31 registros com Instagram**, correspondentes a **29 URLs distintas** (28 perfis e uma URL de Reel).
- **47 estabelecimentos com site** e **30 com agenda_url**.
- **80 estabelecimentos** têm ao menos uma fonte registrada em data_sources; **24 publicados** ainda não têm fonte registrada.
- A base inclui Sobradinho (23), Lago Sul (13), Asa Sul (13), Taguatinga (8), Planaltina (6), Ceilândia (6), Asa Norte (6), Guará (5), Águas Claras (4), Gama (3), Valparaíso (3), Sudoeste (2), e as demais regiões listadas abaixo.

### Distribuição por região

| Região | Publicados |
|---|---:|
| Águas Claras | 4 |
| Asa Norte | 6 |
| Asa Sul | 13 |
| Brasilinha · Entorno | 1 |
| Ceilândia | 6 |
| Cidade Ocidental · Entorno | 1 |
| Gama | 3 |
| Granja do Torto | 1 |
| Guará | 5 |
| Jardim Ingá · Entorno | 1 |
| Lago Sul | 13 |
| Park Way | 1 |
| Planaltina | 6 |
| Plano Piloto | 1 |
| SAAN | 1 |
| Samambaia | 1 |
| Setor de Clubes Sul | 1 |
| SIG | 3 |
| Sobradinho | 23 |
| Sudoeste | 2 |
| Taguatinga | 8 |
| Valparaíso · Entorno | 3 |
| **Total** | **104** |

## 2. Instagram — checagem direta

Foram abertas as 29 URLs distintas cadastradas. Resultado observado nesta rodada:

| Classificação | Quantidade |
|---|---:|
| Público e acessível sem login | 0 |
| Bloqueio explícito HTTP 429 | 4 |
| Bloqueio por robots.txt | 2 |
| Perfil com erro/cache miss | 22 |
| URL cadastrada que aponta para Reel, não perfil | 1 |
| Privado confirmado | 0 |
| Inexistente confirmado | 0 |
| Sem Instagram cadastrado | 73 |

As 31 verificações foram registradas em public.agenda_source_checks com source_id, data/hora, URL recuperável por data_sources, status HTTP e evidência. As duas URLs repetidas entre unidades/listagens são Figueiredo Cozinha e Bar e Palorama; a identidade específica de cada unidade permanece sem confirmação. Não foi possível inspecionar posts, Reels ou Stories de perfis nesta rodada. Nenhuma tentativa de contornar login, CAPTCHA, robots.txt ou limite da plataforma foi feita.

### URLs diretas e evidência

| Perfil cadastrado | URL | Evidência |
|---|---|---|
| Arena Adega dos Amigos | https://www.instagram.com/arenaadega/ | robots.txt |
| Bahrein Cozinha e Bar | https://www.instagram.com/bahreincozinhabar/ | cache miss |
| Bar do Assis | https://www.instagram.com/bar.assis/ | erro de fetch |
| Bar Godofredo | https://www.instagram.com/godofredo408norte/ | erro de fetch |
| Bar Stilo 10 | https://www.instagram.com/barstilo10/ | cache miss |
| Bendito Bar | https://www.instagram.com/benditobar_planaltina/ | erro de fetch |
| Birosca do Conic | https://www.instagram.com/biroscadoconic/ | erro de fetch |
| Boteco da Madá | https://www.instagram.com/botecodamadabsb/ | HTTP 429 |
| Brasileirinho Bar e Restaurante | https://www.instagram.com/brasileirinhoqd08/ | HTTP 429 |
| Chopp Brasília Bier Sobradinho | https://www.instagram.com/choppbrasiliabiersobradinho/ | erro de fetch |
| Clube 27 Bar | https://www.instagram.com/clube27bar/ | HTTP 429 |
| Clube AQUA | https://www.instagram.com/aquaplays1/ | erro de fetch |
| Complexo Fora do Eixo | https://www.instagram.com/complexoforadoeixo/ | robots.txt |
| Contexto Bar | https://www.instagram.com/contextobar/ | erro de fetch |
| Decky Bar | https://www.instagram.com/decky_barsobradinho/ | cache miss |
| Eita Lounge Bar | https://www.instagram.com/eitaloungebar/ | erro de fetch |
| Figueiredo Cozinha e Bar (duas listagens) | https://www.instagram.com/figueiredocozinhaebar/ | erro de fetch; unidade não distinguida |
| Galpão dos Brutos | https://www.instagram.com/osbrutosdopiseiro1/ | cache miss; local mantido como parado conforme informação do responsável |
| Galpão Zero 8 | https://www.instagram.com/galpao.zero8/ | cache miss |
| IVV Swinebar | https://www.instagram.com/ivvswinebar/ | erro de fetch |
| Latinos Bar | https://www.instagram.com/reel/C-0GBRRu65s/ | URL é Reel, não perfil |
| Narguimania Show Bar | https://www.instagram.com/narguimaniashowbar_eventos/ | cache miss |
| Oscarito Brasília | https://www.instagram.com/oscaritobrasilia/ | HTTP 429 |
| P10 Gastrobar | https://www.instagram.com/p10gastrobar/ | erro de fetch |
| Palahop | https://www.instagram.com/palahopoficial/ | cache miss |
| Palorama Burguer (duas unidades) | https://www.instagram.com/palorama.oficial/ | erro de fetch; unidade não distinguida |
| Pipa Drinks Águas Claras | https://www.instagram.com/pipa.drinks/ | erro de fetch |
| Rancho do Vaqueiro | https://www.instagram.com/ranchodovaqueirobsb/ | erro de fetch |
| Trends Pub | https://www.instagram.com/trendsbar/ | erro de fetch |

### Outras fontes registradas

Doze fontes não-Instagram tiveram verificação automática no início da manhã: 7 responderam HTTP 200 sem mudança relevante, 2 responderam HTTP 200 com conteúdo alterado (Savassi Carne de Sol e Na Banca) e 3 não puderam ser processadas por PAGE_TOO_LARGE (Caminito Parrilla e as duas unidades de Alfredo’s Pizzaria). O site da Quintal da Tia Sandra abre, mas a seção de programação acessível não informa datas/atrações; o Linktree do Contexto ainda lista links de outubro; o Linktree do Complexo Fora do Eixo está acessível, mas não expõe a agenda completa por data.

## 3. Agenda confirmada — 13 a 15/11

As entradas abaixo têm data, início e local confirmados em página oficial do estabelecimento/organizador ou de ingresso. A agenda do PR #154 mantém também os eventos já confirmados nas rodadas anteriores.

### Sexta-feira, 13/11

| Horário | Evento | Local / região | Estilo | Fonte |
|---|---|---|---|---|
| 19h–02h | Sextanejada no Oscarito | Oscarito Brasília · SIG | Sertanejo / DJs | https://www.sympla.com.br/evento/sextanejada-no-oscarito/3648813 |
| 20h–03h | Sereníssima — Tributo Legião Urbana + Léo Martine | London Music Bar — Asa Sul | Pop rock / tributo | https://www.sympla.com.br/evento/sexta-13-11-serenissima-tributo-legiao-urbana-leo-martine-uma-noite-emocionante-celebrando/3651423 |
| 20h–03h | Noite dos Solteiros | Worlld Brasília · SIA | Festa / DJs | https://www.sympla.com.br/evento/lgc/3642160 |
| 20h–05h | Os Meninos de Barão + DJ Eddy Viana — Gala do Piseiro | Texxas Bar · Núcleo Bandeirante | Piseiro | https://www.sympla.com.br/evento/lgc/3586903 |
| 19h | Sóxodó apresenta Forró Cobogó + Legal | Infinu · Asa Sul | Forró | https://shotgun.live/pt-br/venues/infinu-comunidade-criativa |
| 19h | Reconvexa em Casa Nova | ām.bar · Asa Sul | Samba / MPB / Forró / Pop | https://shotgun.live/pt-br/venues/am-bar |
| 22h–06h | BRIME!! | Birosca do Conic · Asa Sul | Grime / Rap / Funk | https://shotgun.live/pt-br/venues/birosca |
| 18h–04h | Deu Mó Love | Contexto · Setor de Clubes Sul | Pagode / DJs | https://www.sympla.com.br/evento/lgc/362? |
| 21h–05h | Festa do Pisa | Complexo Fora do Eixo · SAAN | Festa / DJs | https://www.sympla.com.br/evento/festa-do-pisa/ |

### Sábado, 14/11

| Horário | Evento | Local / região | Estilo | Fonte |
|---|---|---|---|---|
| 09h–16h | Corona Day no Osca | Oscarito Brasília · SIG | Samba / esporte / lazer | https://www.sympla.com.br/evento/corona-day-no-osca/3648831 |
| 17h–01h | Butecada Sertaneja | New Mercadito · Asa Sul | Sertanejo | https://www.sympla.com.br/evento/butecada-sertaneja-14-11-new-mercadito/3651288 |
| 18h–02h | Sábadô no Oscarito | Oscarito Brasília · SIG | Samba / sertanejo | https://www.sympla.com.br/evento/sabado-no-oscarito/3648839 |
| 21h–05h | Thiago Jhonathan | Worlld Brasília · SIA | Música ao vivo / DJs | https://www.sympla.com.br/evento/thiago-jhonathan-worlld-brasilia/3645006 |
| 19h–23h45 | Encontro Alternativo Zepelim | Zepelim Rock Bar · Asa Norte | Rock alternativo | https://www.sympla.com.br/evento/encontro-alternativo-zepelim/3638134 |
| 21h–04h | 5º Piseiro Mistura Louca | Rancho do João Paulin · Novo Gama/GO | Piseiro | https://www.sympla.com.br/evento/5o-piseiro-mistura-louca/3548228 |
| 18h–04h | Toca da Bruxa | Complexo Fora do Eixo · SAAN | Funk / festa temática | https://www.sympla.com.br/evento/toca-da-bruxa/ |
| 11h–04h | Sábado Mágico | Contexto · Setor de Clubes Sul | Pagode / DJs | https://www.sympla.com.br/evento/sabado-magico/ |
| 22h–06h | Sambay BSB | Birosca do Conic · Asa Sul | Samba / pagode / pop | https://shotgun.live/pt-br/venues/birosca |
| 20h–01h | Noite de Tributos | Trends Pub · Gama | Rock / tributos | https://www.sympla.com.br/evento/noite-de-tributos/3631271 |

### Domingo, 15/11

| Horário | Evento | Local / região | Estilo | Fonte |
|---|---|---|---|---|
| 12h–23h | Pagodomm com Benza Deus | Dom Muster · Samambaia | Pagode / sertanejo | https://www.sympla.com.br/evento/pagodomm-com-benza-deus-domingo-15-no-dom-muster/3649858 |
| 15h–23h59 | Tardezinha da Club | Club Gastrobar · Valparaíso/GO | Música ao vivo (gênero não informado) | https://www.sympla.com.br/evento/tardezinha-da-club/3636567 |
| 16h | 10 Horas de Forró — Encontro dos Forrozeiros | Arena Dose Dupla · Ceilândia | Forró | https://www.sympla.com.br/evento/10-horas-de-forro/3614097 |
| 18h–04h | Molhadêra | Complexo Fora do Eixo · SAAN | Pagode / funk / swingueira | https://www.sympla.com.br/evento/molhadera-15-de-novembro/3649056 |
| 19h–23h | 3ª Dream Factory | Galpão 17 · Guará/SMAS | Dança / performance | https://www.sympla.com.br/evento/3a-dream-factory/3597505 |
| 18h–23h59 | Cabaré Noturno — Plastique Noir | Infinu · Asa Sul | Darkwave / post-punk | https://shotgun.live/pt-br/events/cabare-noturno-plastique-noir |
| 21h | Papangu | Infinu · Asa Sul | Rock progressivo / experimental | https://shotgun.live/pt-br/venues/infinu-comunidade-criativa |
| 15h–23h59 | Chama no Pagode | Estação Beira Lago · Setor de Clubes Sul | Pagode / samba | https://www.sympla.com.br/evento/lgc/3631552 |
| 22h–05h | Os Meninos de Barão no Telebar | Telebar · Ceilândia | Música ao vivo | https://www.sympla.com.br/evento/os-meninos-de-barao-no-telebar-15-11/3632223 |

**Observação de acesso:** a página oficial da Butecada Sertaneja foi retornada integralmente pelo resultado de busca do Sympla, mas a abertura direta retornou cache miss. Data, horário e local constam no conteúdo indexado da página oficial; a limitação de abertura está registrada.

## 4. Eventos mantidos pendentes

- **Ticiana Werner Wine Bar:** a página oficial de música ainda apresenta “Hoje — quarta-feira, 11 de novembro” às 19h30–23h. Por isso, Marrí (13/11), Alysson Takaki (14/11) e PJ Camargo (16/11) foram movidos para pending_review; não há confirmação atual suficiente para mantê-los publicados.
- **Surra de Modão:** as páginas oficiais encontradas para 31/10 (Dom Muster), 06/11 (SamamBar) e 07/11 (Cota Mil) estão encerradas. O evento de 18/11 no Contexto tem página oficial Sympla como “Terapia Sertaneja”, mas não lista atrações; páginas secundárias associam Surra de Modão à data, porém a participação do grupo permanece pendente de confirmação oficial.
- **Rota do Piseiro / Bar LG:** nenhuma página oficial ou flyer atual acessível confirmou o Bar LG como local. Não associar ao Galpão dos Brutos.
- **Galpão dos Brutos:** permanece parado conforme informação do responsável; nenhum evento foi associado a ele.
- Outros locais prioritários sem agenda oficial completa encontrada: Rancho do Vaqueiro, Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar/Arena P10, Palahop, Quintal da Tia Sandra, Espaço LG/Bar LG, Galpão Zero 8, Narguimania, Decky Bar e Bar Stilo 10. Ausência de agenda não foi tratada como encerramento.

## 5. Descoberta de estabelecimentos

- **2 novos perfis preparados em draft no repositório:** New Mercadito Bar e Restaurante (Asa Sul) e London Music Bar — Asa Sul.
- **0 inserções no Supabase** e **0 perfis publicados**.
- O perfil Dom Muster Cozinha & Bar já estava em draft na rodada anterior; não foi duplicado.
- London Music Bar — Águas Claras permanece como unidade/candidato separado: a listagem secundária consultada aponta endereço na Avenida Jacarandá, mas não houve confirmação oficial suficiente para criar outra ficha.
- Espaço LG/Bar LG e Rota do Piseiro permanecem pendentes de identidade/fonte oficial; os nomes não foram fundidos com Galpão dos Brutos.

## 6. Alterações técnicas e publicação

- Branch: agenda/2026-11-12-daily-coverage
- PR #154: https://github.com/leonardodutrards-del/noite-df/pull/154
- Arquivos adicionados: events-2026-11-13.ts, places-2026-11-13.ts e teste da rodada diária.
- Arquivos atualizados: events.ts, places.ts, public-agenda.ts e events-2026-11-10.ts.
- As três datas futuras da Ticiana ficaram pending_review; os cinco eventos novos têm IDs distintos e fonte oficial.
- Os dois novos locais permanecem draft e são filtrados da lista pública.
- Nenhum dado de evento ou perfil foi inserido diretamente nas tabelas de produção do Supabase.
- Nenhum merge ou deploy de produção foi feito. Aguardando CI e Vercel Preview no novo head.
- Nenhum contato com estabelecimentos; nenhum post, feed ou Stories do Noite DF.

## 7. Bloqueios e pendências

O principal bloqueio segue sendo o acesso aos perfis do Instagram e a ausência de fontes registradas em 24 estabelecimentos. A cobertura de regiões foi completa na base, mas não foi possível afirmar que todos os feeds e Stories foram inspecionados. O PR permanece sem merge para não publicar parcialmente enquanto essas lacunas e os itens pendentes não forem resolvidos.

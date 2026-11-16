# Operação diária de cobertura e agenda — 15/11/2026

**Verificação:** domingo, 15/11/2026, 09h51 (Brasília).  
**Escopo:** Brasília/DF e Entorno.  
**Status:** atualização preparada em branch/PR; nenhuma alteração direta no Supabase, nenhum merge e nenhuma publicação em produção.

## 1. Resumo executivo

- **104 estabelecimentos publicados** carregados do Supabase, cobrindo **22 regiões**.
- **31 registros de Instagram** no banco, correspondentes a **29 URLs distintas**. As 29 URLs foram testadas; nenhuma abriu nesta ferramenta. As 31 tentativas por estabelecimento foram gravadas em `agenda_source_checks` no Supabase em 15/11/2026. Isso não permite concluir se são públicas, privadas ou inexistentes.
- **69 eventos confirmados** preparados no arquivo diário da PR, com URL de fonte e data de verificação em cada registro. Um deles (Alberto Moreno) já existe publicado no Supabase e permanece como fallback local; a agenda pública deduplica por local, data/hora e título.
- **1 correção de qualidade**: 10 Horas de Forró mantido com início às 16h e sem horário final, pois a Sympla exibe 16h como início e fim, enquanto a descrição diz apenas “a partir de 16h”. Festa TOMA permanece 21h–06h de 22/11, conforme a página oficial.
- **3 novos estabelecimentos confirmados como candidatos** e preparados como rascunhos no repositório: Texxas Bar, Estação Beira Lago e Arena Dose Dupla. Nenhum foi inserido no Supabase nem publicado.
- **13 anúncios/eventos permanecem pendentes** por conflito de data/horário, falta de local, falta de horário inicial ou identidade do local não reconciliada.
- Não houve cancelamento confirmado nesta rodada. Eventos vencidos não foram promovidos; não houve despublicação automática de estabelecimentos.

## 2. Base publicada e regiões

Todos os registros com `publication_status='published'` foram carregados no início da rodada. Distribuição:

| Região cadastrada | Publicados |
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

A base foi carregada integralmente. A pesquisa online foi aprofundada nas fontes registradas e nos estabelecimentos prioritários; a falta de agenda encontrada para um local não deve ser interpretada como confirmação de que ele não terá programação.

## 3. Auditoria de Instagram

| Classificação | Resultado desta rodada |
|---|---:|
| Público e acessível sem login | 0 confirmados |
| Público, mas bloqueado/limitado | 0 confirmados |
| Privado | 0 confirmados |
| Inexistente/indisponível | 0 confirmados |
| Identidade/status não verificável por erro de acesso | 29 URLs distintas |
| Sem URL de Instagram cadastrada | 73 estabelecimentos |

Detalhamento técnico das tentativas: 27 URLs retornaram cache miss e 2 retornaram erro genérico. Uma das 29 URLs distintas é um Reel, não um perfil; há duas duplicidades entre os 31 registros do banco. Cache miss/erro não prova privacidade, inexistência ou bloqueio do Instagram. Nenhum post, Reel ou Story foi considerado visto quando a página não abriu.

O site oficial do Quintal da Tia Sandra aponta para https://www.instagram.com/quintaldatiasandra/, mas a página também não abriu. O site acessível informa música ao vivo de forma geral, sem uma programação datada e completa para 16–22/11.

**Prioridades sem agenda oficial futura localizada nesta rodada:** Rancho do Vaqueiro, Rota do Piseiro, Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar, Palahop, Oscarito Brasília, Quintal da Tia Sandra, Espaço LG/Bar LG, Galpão Zero 8, Narguimania, Decky Bar, Bar Stilo 10 e Arena P10. Para Narguimania, o último evento localizado era anterior à janela e foi tratado como vencido. O Galpão dos Brutos continua fora da programação atual, conforme a informação expressa do usuário.

## 4. Agenda confirmada preparada na PR

Cada registro abaixo tem `startsAt`, `endsAt`, `expiresAt`, local, região, categoria, observação de entrada quando publicada e `source.url` oficial. Horários são locais de Brasília.

| Data | Evento | Horário | Local | Fonte direta |
|---|---|---|---|---|
| 15/11 dom. | MOLHADÊRA | 19h–04h | Complexo Fora do Eixo | [Sympla](https://www.sympla.com.br/evento/lgc/3649056) |
| 15/11 dom. | Choppada do Madá | 12h–23h30 | Boteco da Madá | [Sympla](https://www.sympla.com.br/evento/choppada-do-mada-domingo-15-11-12h/3653590) |
| 17/11 ter. | Forró na Varanda | 18h–01h | Contexto Bar | [Sympla](https://www.sympla.com.br/evento/forro-na-varanda-17-11-varanda-do-contexto/3625155) |
| 17/11 ter. | Rosana Brown | 19h30–23h | Ticiana Werner | [Agenda oficial](https://www.ticianawerner.com.br/musica.php) |
| 18/11 qua. | Surra de Modão + Cardápio em Dobro | 18h–02h | Contexto Bar | [Sympla](https://www.sympla.com.br/evento/surra-de-modao-cardapio-em-dobro-18-11-varanda-do-contexto/3626362) |
| 18/11 qua. | Andresa Sousa | 19h30–23h | Ticiana Werner | [Agenda oficial](https://www.ticianawerner.com.br/musica.php) |
| 18/11 qua. | Isso É Jazz?! — Jimi Oliver | 20h15–23h | Infinu | [Shotgun](https://shotgun.live/nl/events/isso-e-jazz-58) |
| 19/11 qui. | Nu Metal Festival | 20h–02h | Galpão 17 | [Sympla](https://www.sympla.com.br/evento/nu-metal-festival-galpao-17/3563513) |
| 19/11 qui. | Quinta do CPX | 21h–05h | Complexo Fora do Eixo | [Sympla](https://www.sympla.com.br/evento/quinta-do-cpx-19-11-pre-feriado/3652478) |
| 19/11 qui. | We The Funk | 21h–04h | Contexto Bar | [Sympla](https://www.sympla.com.br/evento/lgc/3625200) |
| 19/11 qui. | As Sertanejas + Nego Rainner + DJ Eddy Viana | 20h–05h | Texxas Bar (candidato) | [Sympla](https://www.sympla.com.br/evento/texxas-bar-quinta-vespera-de-feriado-as-sertanejas-nego-rainner-dj-eddy-viana/3653610) |
| 19/11 qui. | Bee | 19h30–23h | Ticiana Werner | [Agenda oficial](https://www.ticianawerner.com.br/musica.php) |
| 19/11 qui. | Tranquilo apresenta Joyce Alane | 19h–23h | Infinu | [Shotgun](https://r.shotgun.live/pt-pt/events/tranquilobrasilia-2026-11-19) |
| 20/11 sex. | Deu Mó Love | 18h–04h | Contexto Bar | [Sympla](https://www.sympla.com.br/evento/deu-mo-love-20-11-varanda-do-contexto/3628682) |
| 20/11 sex. | MOLHADÊRA + Feriado | 18h–05h | Complexo Fora do Eixo | [Sympla](https://www.sympla.com.br/evento/molhadera-feriado-20-de-novembro/3652518) |
| 20/11 sex. | Sexta de Feriado no SamamBar | 18h–03h | SamamBar | [Sympla](https://www.sympla.com.br/evento/sexta-de-feriado-no-samambar/3651974) |
| 20/11 sex. | Mikaelen Barbosa | 19h30–23h | Ticiana Werner | [Agenda oficial](https://www.ticianawerner.com.br/musica.php) |
| 20/11 sex. | Sóxodó — As Fulô do Cerrado + Isadora Melo + DJ Firewalter | 19h–23h | Infinu | [Shotgun — agenda de shows](https://shotgun.live/pt-br/concerts/brasilia/brazilian) |
| 20/11 sex. | Sexta MTV — Summer Eletro Clipes | 19h–03h | ām.bar | [Shotgun — agenda oficial](https://shotgun.live/en/venues/am-bar) |
| 21/11 sáb. | Bola, Samba e Feijão | 12h–23h | Estação Beira Lago (candidato) | [Sympla](https://www.sympla.com.br/evento/bola-samba-e-feijao/3653111) |
| 21/11 sáb. | Te vejo na Praça | 16h–22h | Complexo Fora do Eixo | [Sympla](https://www.sympla.com.br/evento/te-vejo-na-praca-21-de-novembro/3652244) |
| 21/11 sáb. | BSB Punk Fest — Ócio | 16h–20h30 | Infinu | [Shotgun — agenda oficial](https://shotgun.live/fr/venues/infinu-comunidade-criativa) |
| 21/11 sáb. | Jean Tassy — Turnê Saudade de Mim | 19h–03h | ām.bar | [Shotgun — agenda oficial](https://shotgun.live/en/venues/am-bar) |
| 21/11 sáb. | Fernanda Rabelo | 19h30–23h | Ticiana Werner | [Agenda oficial](https://www.ticianawerner.com.br/musica.php) |
| 21/11 sáb. | Texxas Bar — Moleca 100 Vergonha / Só Pra Xamegar / DJ Hércules | 20h–05h | Texxas Bar (candidato) | [Sympla](https://www.sympla.com.br/evento/texxas-bar-moleca-100-vergonha-sabado-so-pra-xamegar-spx-dj-hercules/3637061) |
| 21/11 sáb. | Alberto Moreno — O Rei do Brega-Pop | 21h–04h | Arena Adega dos Amigos | [Sympla](https://www.sympla.com.br/evento/alberto-moreno-o-rei-do-brega-pop-pela-1a-vez-em-brasilia-df/3586393) |
| 21/11 sáb. | Miserável Cultura Fest — Lamento + Despenca + Sala de Gritos | 21h–23h59 | Infinu | [Shotgun — agenda oficial](https://shotgun.live/fr/venues/infinu-comunidade-criativa) |
| 21/11 sáb. | Festa TOMA — Edição Agrobaile | 21h–06h (22/11) | Contexto Bar | [Sympla](https://www.sympla.com.br/evento/festa-toma-edicao-agrobaile-club-contexto-boate-contexto-sabado-21-11-as-21h/3642351) |
| 21/11 sáb. | Inflama | 22h–05h (22/11) | Complexo Fora do Eixo | [Sympla](https://www.sympla.com.br/evento/inflama-21-de-novembro/3650933) |
| 24/11 ter. | Infinu recebe Luizga | 20h–23h | Infinu | [Shotgun](https://shotgun.live/nl/events/luizgaembsb) |
| 25/11 qua. | Surra de Modão + Cardápio em Dobro | 18h–02h (26/11) | Contexto Bar | [Sympla](https://www.sympla.com.br/evento/lgc/3626412) |
| 25/11 qua. | Isso É Jazz?! — Rodrigo Bezerra toca Pat Metheny | 20h15–23h | Infinu | [Shotgun](https://r.shotgun.live/es/events/isso-e-jazz-59) |
| 26/11 qui. | We The Funk | 21h–04h (27/11) | Contexto Bar | [Sympla](https://www.sympla.com.br/evento/we-the-funk-26-11-varanda-do-contexto-o-funk-e-nosso/3625202) |
| 26/11 qui. | Infinu recebe Vanguart | 20h–23h30 | Infinu | [Shotgun](https://r.shotgun.live/en/events/vanguart-em-brasilia) |
| 27/11 sex. | Rock 90 — Creed + Oasis | 20h–02h (28/11) | Galpão 17 | [Sympla](https://www.sympla.com.br/evento/lgc/3563529) |
| 27/11 sex. | Biu do Piseiro + Chama na Bota Papai + Galã do Piseiro + DJ Eddy Viana | 20h–05h (28/11) | Texxas Bar (candidato) | [Sympla](https://www.sympla.com.br/evento/texxas-bar-sexta-biu-do-piseiro-chama-na-bota-papai-gala-do-piseiro-dj-eddy-viana/3636959) |
| 28/11 sáb. | Marília Tavares + Thalita Rangel + DJ Hércules | 20h–05h (29/11) | Texxas Bar (candidato) | [Sympla](https://www.sympla.com.br/evento/lgc/3642481) |
| 28/11 sáb. | Motal e Infinu recebem YMA — Sentimental Palace | 20h–23h59 | Infinu | [Shotgun](https://r.shotgun.live/es/events/ymaembsb) |
| 28/11 sáb. | Salada Sonora × Trisal Batidão com Bya Alves | 19h–03h (29/11) | ām.bar | [Shotgun](https://shotgun.live/pt-pt/events/salada-sonora-x-trisal-batidao) |

**Observação:** a lista acima inclui eventos de 15/11 a 20/12 para alimentar a agenda semanal e o calendário mensal. O evento Alberto Moreno já está publicado no Supabase; o fallback local é deduplicado pela chave de identidade.


### Eventos adicionais confirmados na varredura ampliada

| Data | Evento | Horário | Local | Fonte direta |
|---|---|---|---|---|
| 15/11 dom. | Tardezinha da Club | 15h–23h59 | Club Gastrobar · Valparaíso/GO | [Sympla](https://www.sympla.com.br/evento/tardezinha-da-club/3636567) |
| 19/11 qui. | TBT do Benza | 20h–23h59 | Arena CCB - FUTSOCIETY · Cruzeiro | [Sympla](https://www.sympla.com.br/evento/tbt-do-benza/3654005) |
| 20/11 sex. | Almost Unplugged | 21h · encerramento não informado | Porks Sobradinho | [Agenda oficial](https://sobradinhoporks.com.br/) |
| 21/11 sáb. | Gudinaite Brasília | 18h–23h | Salão A - Clube AABB · Asa Sul | [Sympla](https://www.sympla.com.br/evento/lgc/3579097) |
| 21/11 sáb. | Flashback Luziânia — 3ª edição | 21h–04h (22/11) | Espaço JDC · Luziânia/GO | [Sympla](https://www.sympla.com.br/evento/lgc/3629501) |
| 22/11 dom. | Dominguinho da Club | 15h–23h59 | Club Gastrobar · Valparaíso/GO | [Sympla](https://www.sympla.com.br/evento/dominguinho-da-club/3636579) |
| 29/11 dom. | Aquele Domingo na Club | 15h–23h59 | Club Gastrobar · Valparaíso/GO | [Sympla](https://www.sympla.com.br/evento/aquele-domingo-na-club/3636586) |
| 29/11 dom. | Chrigor em Brasília — Véspera de Feriado | 15h30–23h30 | Estação Beira Lago · Setor de Clubes Sul | [Sympla](https://www.sympla.com.br/evento/lgc/3592107) |
| 20/12 dom. | Orla Party | 13h–23h | Chácara Eles Reis · Planaltina/GO | [Sympla](https://www.sympla.com.br/evento/lgc/3559433) |

A programação adicional eleva o lote diário a **69 eventos confirmados**. Não foram incluídos anúncios com conflito de data/horário ou local pendente.


### Eventos adicionais confirmados — Birosca, Infinu e agenda oficial

| Data | Evento | Horário | Local | Fonte direta |
|---|---|---|---|---|
| 16/11 seg. | PJ Camargo — Jazz lounge | 19h30–23h | Ticiana Werner Wine Bar · Asa Sul | [Agenda oficial](https://www.ticianawerner.com.br/musica.php) — já constava no seed anterior, não entra na contagem de 69 |
| 21/11 sáb. | Na Batida do Morro — 10 Anos | 22h–06h (22/11) | Birosca do Conic Pub / Arena Conic · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/21-11-na-batida-do-morro-10-anos) |
| 29/11 dom. | BSB Punk Fest — Rancore | 16h–20h30 | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/festivals/bsb-punk-fest-rancore) |
| 02/12 qua. | Isso É Jazz?! Esdras e Marcus tocam Moacir Santos | 20h15–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/isso-e-jazz-60) |
| 03/12 qui. | Tranquilo apresenta Jonatas Belgrande | 19h–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/tranquilobrasilia-2026-12-03) |
| 04/12 sex. | Nojo de Farra — A Confraternização | 19h–03h (05/12) | Birosca do Conic Pub · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/04-12-nojo-de-farra) |
| 04/12 sex. | Lacre 001 | 22h–06h (05/12) | Birosca do Conic Pub · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/lacre-001) |
| 05/12 sáb. | Infinu apresenta Daparte (MG) | 17h–20h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/daparteembsb) |
| 05/12 sáb. | Infinu recebe Mombojó | 20h–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/infinurecebemombojo) |
| 05/12 sáb. | Garoto: O Circo Dançante | 23h–07h (06/12) | Birosca do Conic Pub / Arena Conic · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/05-12-garoto-o-circo-dancante) |
| 06/12 dom. | Tom Ribeira — lançamento do EP Vovóvovô | 21h–23h30 | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/tomribeiraembsb-3) |
| 09/12 qua. | Isso É Jazz?! Iara Gomes toca Thelonious Monk | 20h15–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/isso-e-jazz-62) |
| 10/12 qui. | Tranquilo apresenta Yoún | 19h–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/tranquilobrasilia-2026-12-10) |
| 11/12 sex. | Conclave Furacão 2000 — Funks de 2000 a 2020 | 22h–06h (12/12) | Birosca do Conic · Asa Sul | [Agenda oficial Birosca/Shotgun](https://shotgun.live/pt-br/venues/birosca) |
| 12/12 sáb. | Club Vittar com Pabllo Vittar | 21h–06h (13/12) | Arena Birosca · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/12-12-club-vittar-com-pabllo-vittar) |
| 12/12 sáb. | Infinu recebe Os Replicantes | 20h30–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/osreplicantes) |
| 13/12 dom. | Valhalla + Device = Death Metal Chaos | 20h30–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/valhalladevice) |
| 16/12 qua. | Isso É Jazz?! Esdras Nogueira e Grupo tocam O Transa | 20h15–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/isso-e-jazz-61) |
| 23/12 qua. | Isso É Jazz?! Esdras Nogueira e Passo Largo tocam Dominguinhos | 20h15–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-pt/events/isso-e-jazz-63) |
| 30/12 qua. | Isso É Jazz?! Bailão de Fim de Ano | 20h15–23h | Infinu Comunidade Criativa · Asa Sul | [Shotgun](https://shotgun.live/pt-pt/events/isso-e-jazz-64) |
| 02/01 sáb. | Garoto New Year | 23h–07h (03/01) | Birosca do Conic Pub / Arena Conic · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/02-01-garoto-new-year) |
| 16/01 sáb. | Garoto Festival — Especial Anitta | 23h de 16/01 até 05h30 de 18/01 | Birosca do Conic Pub / Arena Conic · Asa Sul | [Shotgun](https://shotgun.live/pt-br/events/16-17-01-garoto-festival-especial-anitta) |

A contagem da seed diária passa a **69 eventos confirmados**. Os eventos de Birosca e Infinu foram conferidos em suas agendas oficiais Shotgun; PJ Camargo já estava no seed anterior. O evento Club Vittar foi mantido separado em **Arena Birosca**, cujo endereço é diferente do Birosca do Conic Pub.



## 5. Agenda de hoje e eventos já existentes no seed principal

Além dos dois registros novos da PR para 15/11, o seed principal já contém eventos oficiais para hoje, entre eles:
- 10 Horas de Forró — Arena Dose Dupla, início às 16h; a Sympla não fornece encerramento confiável.
- Chama no Pagode — Estação Beira Lago, 15h–23h59.
- Os Meninos de Barão — Telebar, 22h.
- Tardezinha da Club — Club Gastrobar, Valparaíso/GO, 15h.
- Cabaré Noturno e Papangu — Infinu.
- Dream Factory — Galpão 17.

O evento 10 Horas de Forró não recebe horário final inferido: a página mostra 16h como início e fim, mas a descrição informa apenas “a partir de 16h”.

## 6. Novos estabelecimentos — rascunhos e candidatos pendentes

Três candidatos já existentes no seed foram deduplicados no Supabase por nome normalizado, variações, slug, Instagram quando existente, endereço e telefones. Não houve correspondência. Os registros foram enriquecidos com fontes oficiais e mantidos como `publicationStatus='draft'` e `verified=false`; o filtro público continua excluindo rascunhos.

1. **Texxas Bar** — SIBS Q 1, Conjunto D, Brasília/DF; perfil oficial de eventos do próprio TEXXAS BAR no Sympla, Instagram indicado como @texxasbarbsb e WhatsApp 61 99450-8262. Região sugerida: Núcleo Bandeirante, rótulo ainda ausente das 22 regiões cadastradas.
2. **Estação Beira Lago** — SCES Trecho 1, Conjunto 03, térreo, Brasília/DF; CNPJ 62.006.612/0001-49 com nome fantasia Estação Beira Lago e situação ativa em 08/08/2026; páginas oficiais Sympla do próprio produtor confirmam eventos em novembro. O cadastro CNPJ lista bairro Asa Sul; os eventos localizam o espaço no Setor de Clubes Sul. Telefones divergentes foram mantidos fora do contato definitivo até reconciliação.
3. **Arena Dose Dupla** — QNM 09, Conjunto A, Lotes 02 e 04, Ceilândia Sul; CNPJ 30.103.636/0001-20 / Esquina Choperia LTDA em situação ativa no cadastro consultado; Sympla confirma evento e endereço.

**Sete locais adicionais identificados apenas como candidatos a perfil**, sem criação porque a evidência disponível nesta rodada é de páginas de eventos, ainda insuficiente para uma ficha empresarial completa e inequívoca:
- **Club Gastrobar** — Rua 2, Qd. 58, Valparaíso de Goiás/GO; duas páginas Sympla do produtor Papá Produção confirmam eventos e o mesmo endereço.
- **Espaço JDC** — Fazenda Tabocão, Jardim Brasília Sul/Zona Rural, Luziânia/GO; página Sympla confirma evento, data e endereço rural.
- **Arena CCB - FUTSOCIETY** — SRES, Cruzeiro, Brasília/DF; Sympla confirma evento e localização, mas o endereço cadastral completo não foi reconciliado.
- **Clube AABB / Salão A** — Asa Sul, Trecho 2, conjunto 17/20; página oficial de evento confirma o salão e o endereço.
- **Chácara Eles Reis** — Lagoa Formosa, Planaltina/GO; Sympla confirma evento em 20/12, mas não fornece endereço de rua.
- **Viracopos Gastrobar** — Rua 100, 2-192, Valparaíso de Goiás/GO; página de evento identifica o local, mas o anúncio tem conflito de data e a ficha comercial independente ainda precisa ser confirmada.
- **Arena Birosca** — SDS, Edifício Darcy Ribeiro, Asa Sul, Brasília/DF; evento oficial com Pabllo Vittar confirma endereço distinto do Birosca do Conic Pub; manter como unidade/local separado até validação cadastral.

Nenhum perfil novo foi inserido no Supabase ou publicado. Os seis locais permanecem candidatos pendentes; os três rascunhos existentes continuam fora do catálogo público.

## 7. Pendências e anúncios não publicados

1. **Sábado Mágico — Contexto, 21/11:** a página informa início às 11h, mas a descrição menciona a programação regular a partir de 12h. Horário conflitante.
2. **FeijoADA com Amor de Aluguel — Contexto, 21/11:** título/listagem indica 21/11 às 15h; descrição menciona 14/11 às 11h. Data e horário conflitantes; pode ser anúncio duplicado do Sábado Mágico.
3. **Pagodão das Estrelas — 20/11:** página identifica Bahrein Comida de Boteco, mas a descrição chama o local de Amsterdã (antigo Bahrein). Endereço é Setor Hortigranjeiro, Chácara 12, km 1/2, Santa Maria. Não associar ao Bahrein Cozinha e Bar de Valparaíso.
4. **Marília Tavares no Amsterdam — 21/11:** a Sympla identifica Bahrein Comida de Boteco no mesmo endereço de Santa Maria, enquanto a descrição usa Amsterdam. A identidade comercial precisa ser confirmada.
5. **Ressaca do Jorem — Luziânia:** não foi possível confirmar data e horário de início em página oficial acessível.
6. **Festa de Interior — Piseiro Estilizado — 21/11:** anúncio localizado com horário, mas sem local identificável.
7. **IN DA CLUB — 20/11:** duas páginas oficiais de ingresso divergem no início (20h e 21h); manter pendente até reconciliação.
8. **REGALO — Funk e Brindes — 20/11:** anúncio localizado, mas sem local verificável.
9. **Os Meninos de Barão no Viracopos — 15/11:** cabeçalho Sympla indica 15/11 às 18h, mas a descrição informa “domingo 11 de novembro”. Não publicar por conflito de data.
10. **Dead Slug — Porks Sobradinho, 21/11:** agenda oficial lista a banda para sábado, mas não informa horário de início; manter pendente.
11. **Chá da Alice — Birosca, 28/11:** cabeçalho da Shotgun informa 28/11 às 22h, mas a descrição ainda fala em “maio”. Manter pendente até correção do texto oficial.
12. **Seasons — Infinu, 05/12:** cabeçalho da Shotgun indica 05/12, mas a descrição informa 14/11. Data conflitante.
13. **Bastardos da Noite — Infinu, 06/12:** cabeçalho da Shotgun informa 16h, enquanto o serviço na descrição informa bilheteria às 17h e show às 18h. Início conflitante.

**Quarta Delas — Quintal da Tia Sandra:** menção secundária sem data/horário e sem flyer oficial acessível; não foi tratada como evento atual. O site oficial mostra apenas a seção “Programação Musical” sem conteúdo datado legível.

**Rota do Piseiro / Bar LG:** não foi localizado perfil oficial inequívoco da Rota do Piseiro nem flyer atual confirmando Bar LG como local. Bar LG/Espaço LG não foi misturado com Galpão dos Brutos. Nenhum evento foi atribuído ao Bar LG sem evidência oficial.  
**Galpão dos Brutos:** permanece tratado como parado, conforme informação do usuário; não foi usado como local de programação atual.

## 8. Estabelecimentos sem agenda futura confirmada

A busca por programação futura não encontrou confirmação publicável para **92 dos 104 estabelecimentos publicados** nas fontes acessíveis desta rodada. O Porks Sobradinho foi retirado desta lista após confirmação de Almost Unplugged em 20/11. Isso é “sem agenda confirmada encontrada”, não prova de ausência de evento.

Prioridades sem anúncio futuro confirmado: Rancho do Vaqueiro, Rota do Piseiro, Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar, Palahop, Oscarito Brasília, Quintal da Tia Sandra, Espaço LG/Bar LG, Galpão Zero 8, Narguimania, Decky Bar, Bar Stilo 10 e Arena P10. O site do Quintal informa música ao vivo de forma geral, mas não apresenta datas/atrações verificáveis para a semana. O Galpão dos Brutos permanece parado, sem programação atribuída.

## 9. GitHub, testes e publicação

- **PR:** https://github.com/leonardodutrards-del/noite-df/pull/155
- **Branch:** `agenda/2026-11-15-daily-coverage`
- **Arquivo de eventos:** https://github.com/leonardodutrards-del/noite-df/blob/agenda/2026-11-15-daily-coverage/data/seeds/events-2026-11-15.ts
- **Candidatos em rascunho:** https://github.com/leonardodutrards-del/noite-df/blob/agenda/2026-11-15-daily-coverage/data/seeds/places-2026-11-10.ts
- **Relatório:** https://github.com/leonardodutrards-del/noite-df/blob/agenda/2026-11-15-daily-coverage/docs/agenda-diaria-2026-11-15.md

A PR permanece em rascunho. Após esta atualização, CI e preview precisam terminar novamente; só serão considerados verdes quando o head atualizado estiver com testes, lint, build e Vercel Preview READY. Não houve merge nem publicação em produção. A produção continua no deployment da branch principal; a prévia desta PR não foi usada como substituta da produção. O último head desta atualização precisa manter CI e Vercel Preview verdes antes de qualquer revisão para merge.

Na verificação pública atual, `/agenda-semanal` ainda retorna 4 eventos e `/fim-de-semana` retorna 18 itens de 13–15/11. A agenda nova ainda não foi publicada, portanto essas páginas não refletem o lote desta PR. Não foi feita publicação em feed/Stories e nenhum estabelecimento foi contatado.

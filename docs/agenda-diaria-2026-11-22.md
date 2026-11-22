# Operação diária Noite DF — 22/11/2026

## Base e checkpoints

- Supabase: 104 estabelecimentos publicados em 22 regiões.
- 94/104 estabelecimentos tiveram ao menos uma fonte verificada nos últimos 7 dias; 10 permanecem pendentes.
- 388 fontes registradas e 546 verificações em `data_sources` / `agenda_source_checks`.
- 30 estabelecimentos possuem `agenda_url`; 74 ainda não possuem.
- 61 verificações nas últimas 24h: 28 baseline, 24 ok, 5 changed, 3 error e 1 blocked.
- Regiões com fontes de estabelecimentos verificadas nas últimas 24h: Águas Claras, Asa Sul, Ceilândia, Granja do Torto, Guará, Lago Sul, Planaltina, Plano Piloto, Samambaia, SIG, Sobradinho e Taguatinga.
- 10 pendentes: Circuito de Comitivas de Planaltina-GO; Chácara BWR; CB7; Fogão Goiano; Horus Eventus; Santa Aldeia Bar; Abençoado Bar; Bardot Music Bar; Fiel Bar e Distribuidora; SHOT Rock Bar.
- Instagram: 32 fontes cadastradas; último status registrado: 30 error, 1 blocked e 1 http_error. Isso não comprova perfil privado ou inexistente.

## Verificações de estabelecimentos registradas

- Galpão 17: Sympla oficial confirma evento futuro em 27/11, endereço SMAS Área Especial G, Conjunto A, Lotes 16 e 17.
  - https://www.sympla.com.br/evento/lgc/3563529
- Pontão do Lago Sul: site oficial confirma centro de lazer, restaurantes, bares, eventos, endereço e horário.
  - https://www.pontao.com.br/o-pontao/o-pontao/
- Bar do Batata: cadastro empresarial público confirma situação ativa e endereço Rodovia DF-230, 1, Planaltina/DF.
  - https://www.econodata.com.br/consulta-empresa/26910820000104-welton-lopes-da-silva-bar-e-lanchonete
- Vila Madalena: ficha pública confirma Vila Madalena Bar Etc, EQ 03/04 Loja 02, Planaltina/DF.
  - https://www.sluurpy.com/pt/planaltina/restaurant/8857866/vila-madalena-bar-etc
- Parque de Exposições Granja do Torto: página da OAB/DF confirma o espaço como local de evento; endereço corroborado por ficha pública.
  - https://oabdf.org.br/?eventDisplay=venue&post_type=tribe_venue&tribe_venue=parque-de-exposicoes-granja-do-torto
- Club 904, UK Music Hall, Bar do Chaguinha e Bar do Luis foram pesquisados, mas permanecem com divergências de endereço/identidade entre diretórios e o cadastro. Não alterar endereço nem identidade sem confirmação adicional.

## Eventos novos preparados no seed

Cinco novos eventos foram acrescentados a `data/seeds/events-2026-11-20.ts`:

1. Texxas Bar — Domingo Top 1, 22/11, 20h–05h.
   - https://www.sympla.com.br/evento/lgc/3656778
2. A Night To Remember — HSM vs Camp Rock, Anexo BZ, 27/11, 21h–04h.
   - https://www.sympla.com.br/evento/lgc/3594013
3. Vértice — House, Complexo Fora do Eixo, 28/11, 22h–06h.
   - https://www.sympla.com.br/evento/lgc/3657195
4. Dexcomplica — Edição Beira Lago, Clube de Engenharia, 28/11, 20h–06h.
   - https://www.sympla.com.br/evento/lgc/3634141
5. Réveillon Texxas Prime, 31/12, 19h–06h.
   - https://www.sympla.com.br/evento/lgc/3578484

Eventos já existentes no seed e não duplicados: Dominguinho da Club (22/11), We The Funk (26/11), Biu do Piseiro (27/11) e Marília Tavares (28/11) no Texxas/Amsterdam conforme seus locais já registrados.

## Candidatos em draft

Três novos perfis foram adicionados em `data/seeds/places-2026-11-20.ts`, sem publicação:

- Anexo BZ — SAAN Quadra 2, Lote 45; fonte oficial de evento confirma restaurante, bar e pista.
- Club Gastrobar — Valparaíso de Goiás; evento oficial confirma Rua 2, Quadra 58; lote exato diverge da ficha pública e fica pendente de revisão.
- New Khoder Lounge & Bar — CLN 210, Bloco D, Loja 60; página oficial do próprio produtor confirma endereço, contato e atividade recente.

O perfil Texxas Bar existente em draft teve a fonte atualizada com o evento de 22/11. Os candidatos permanecem em draft; nenhuma inserção direta em `establishments` foi feita.

## Pendências de eventos

- Paparico / Anexo BZ (28/11, 21h–04h): resultado oficial Sympla e fontes locais indicam data e local, mas a abertura direta da página Sympla retornou 404. Mantido pendente.
  - https://www.sympla.com.br/evento/lgc/3644294
- Beleléu no Lago / Estação Beira Lago (28/11, 15h–23h): resultado oficial Sympla e agregadores corroboram a programação, mas a abertura direta da página Sympla retornou 404. Mantido pendente.
  - https://www.sympla.com.br/evento/lgc/3653094
- Inauguração Complexo do Povo (28/11, 21h–04h): a descrição aponta Águas Lindas de Goiás/GO, mas o cabeçalho e o bloco Local da Sympla indicam Brasília/DF. Mantido pendente por divergência geográfica.
  - https://www.sympla.com.br/evento/inauguracao-complexo-do-povo/3646495
- Nenhuma associação nova da Rota do Piseiro ao Bar LG: não foi localizada publicação/flyer oficial atual que confirme esse vínculo.
- Galpão dos Brutos continua sem programação atual confirmada.

## Estado Supabase, GitHub e publicação

- A tabela `events` tem 49 registros: 45 expired, 3 draft e 1 pending_review. Há 0 eventos futuros com `publication_status='published'`; um dos drafts tem início futuro.
- Os eventos desta rodada foram preparados apenas no seed da branch/PR; não houve insert direto em `events`.
- PR #163 permanece aberta em draft:
  - https://github.com/leonardodutrards-del/noite-df/pull/163
- A seed `events-2026-11-20.ts` contém 23 objetos; a seed `places-2026-11-20.ts` contém 10 candidatos em draft.
- Os testes/CI e Preview precisam ser revalidados após os commits desta rodada. Nenhum merge ou deploy de produção foi feito.
- Produção permanece no deployment anterior; não publicar no Instagram/feed/Stories e não contatar estabelecimentos.

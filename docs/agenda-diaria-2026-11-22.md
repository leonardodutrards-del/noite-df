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

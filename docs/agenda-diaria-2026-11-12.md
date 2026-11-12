# Operação diária de cobertura e agenda — 12/11/2026

Rodada realizada em 12/11/2026, horário local America/Sao_Paulo.  
Projeto: \`leonardodutrards-del/noite-df\`.  
Escopo: Brasília/DF e Entorno. Nenhuma alteração direta nas tabelas de conteúdo de produção.

## 1. Base carregada do Supabase

Foram consultados todos os estabelecimentos com \`publication_status='published'\`.

- **104 estabelecimentos publicados**
- **22 regiões**
- 31 registros com Instagram; 47 com site; 30 com \`agenda_url\`
- 103 registros em \`data_sources\`, distribuídos por 80 estabelecimentos; 24 estabelecimentos publicados não têm fonte registrada nessa tabela
- 43 verificações de fonte nesta rodada: 31 registros de Instagram e 12 fontes não-Instagram; histórico de \`agenda_source_checks\`: 164 checks de 52 fontes distintas
- Tabela editorial \`events\`: 41 registros (25 \`published\`, 14 \`expired\`, 1 \`draft\`, 1 \`pending_review\`); 0 registros em \`event_candidates\`

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

## 2. Instagram — verificação e evidências

Foram tentadas 29 URLs distintas: 28 URLs de perfil e uma URL que aponta para um Reel. A base tem 31 registros de fonte, pois dois perfis são repetidos entre unidades/listagens.

| Resultado observado | URLs distintas |
|---|---:|
| Conteúdo acessível sem login | 0 |
| Bloqueio/limitação explícita da ferramenta | 6 URLs (4 HTTP 429, 2 robots.txt) |
| Erro de busca/cache miss | 23 URLs distintas; 25 registros de checagem por causa de URLs repetidas |
| URL de Reel em vez de perfil | 1 das 29 URLs distintas |
| Privado confirmado | 0 |
| Inexistente confirmado | 0 |
| Sem Instagram cadastrado | 73 estabelecimentos publicados |

Os erros não comprovam que uma conta seja privada ou inexistente. Não foi possível inspecionar posts, Reels ou Stories do Instagram nesta rodada. Não houve tentativa de contornar login, CAPTCHA, scraping ou controles da plataforma.

**Registro efetuado:** 43 verificações inseridas em \`public.agenda_source_checks\` nesta rodada, com data, source_id, URL direta e evidência observável na nota de cada registro. Das 12 fontes não-Instagram, 8 responderam HTTP 200 sem mudança relevante, 3 responderam HTTP 200 com conteúdo alterado (Savassi Carne de Sol, Quintal da Tia Sandra e Meatz Burger) e 1 URL retornou HTTP 404 (Sauz Restaurante). Os dois perfis compartilhados entre unidades são Figueiredo Cozinha e Bar e Palorama; a identidade específica de cada unidade continua pendente. A URL do Latinos Bar cadastrada na base é um Reel, não uma página de perfil.

## 3. Eventos novos confirmados e preparados

As datas, horários, locais e atrações abaixo foram conferidos em páginas oficiais de ingresso ou agenda oficial do estabelecimento. Quando a fonte não informa encerramento, o campo de término permanece ausente; o \`expiresAt\` é apenas um prazo interno de exibição, não um horário de encerramento.

### 12–15 de novembro

| Data | Evento | Local / região | Horário | Fonte oficial |
|---|---|---|---|---|
| 12/11, qui. | Violada SamamBar | SamamBar · Samambaia | 20h30–23h59 | https://www.sympla.com.br/evento/violada-samambar-12-de-novembro/3647942 |
| 12/11, qui. | Wolff Menezes — lançamento do álbum Morfeu | Eye Patch Panda · Asa Sul | Casa 19h; show 21h30; fim 01h | https://www.sympla.com.br/evento/wolff-menezes-lancamento-do-album-morfeu/3627788 |
| 13/11, sex. | Sóxodó Apresenta Forró Cobogó + Legal | Infinu · Asa Sul | 19h; fim não divulgado | https://shotgun.live/pt-br/venues/infinu-comunidade-criativa |
| 13/11, sex. | Noite dos Solteiros | Worlld Brasília · SIA | 21h–05h | https://www.sympla.com.br/evento/lgc/3642160 |
| 14/11, sáb. | Thiago Jhonathan | Worlld Brasília · SIA | 21h–05h | https://www.sympla.com.br/evento/thiago-jhonathan-worlld-brasilia/3645006 |
| 14/11, sáb. | Encontro Alternativo Zepelim | Zepelim Rock Bar · Asa Norte | 19h–23h45 | https://www.sympla.com.br/evento/encontro-alternativo-zepelim/3638134 |
| 15/11, dom. | Molhadêra — 15 de Novembro | Complexo Fora do Eixo · SAAN | 18h–04h | https://www.sympla.com.br/evento/molhadera-15-de-novembro/3649056 |

### Próximas semanas

| Data | Evento | Local / região | Horário | Fonte oficial |
|---|---|---|---|---|
| 18/11, qua. | Terapia Sertaneja + Cardápio em Dobro | Contexto · Setor de Clubes Sul | 18h–02h | https://www.sympla.com.br/evento/terapia-sertaneja-cardapio-em-dobro-na-varanda-do-contexto-18-11/3630412 |
| 20/11, sex. | Pagodão das Estrelas | Amsterdã (antigo Bahrein) · Setor Hortigranjeiro | 15h–01h | https://www.sympla.com.br/evento/pagodao-das-estrelas/3637448 |
| 25/11, qua. | Isso É Jazz?! — Rodrigo Bezerra toca Pat Metheny | Infinu · Asa Sul | 20h15; fim não divulgado | https://shotgun.live/pt-br/venues/infinu-comunidade-criativa |
| 02/12, qua. | Isso É Jazz?! — Esdras e Marcus tocam Moacir Santos | Infinu · Asa Sul | 20h15; fim não divulgado | https://shotgun.live/pt-br/venues/infinu-comunidade-criativa |
| 05/12, sáb. | Seasons | Infinu · Asa Sul | 23h; fim não divulgado | https://shotgun.live/pt-br/venues/infinu-comunidade-criativa |
| 09/12, qua. | Isso É Jazz?! — Iara Gomes toca Thelonious Monk | Infinu · Asa Sul | 20h15; fim não divulgado | https://shotgun.live/pt-br/venues/infinu-comunidade-criativa |

O evento Pagodão das Estrelas é mantido como **Amsterdã (antigo Bahrein)**, no Setor Hortigranjeiro, Chácara 12, km 1/2. A página da Sympla também mostra “Bahrein Comida de Boteco” no campo do local, mas a descrição identifica Amsterdã. Não associar ao Bahrein Cozinha e Bar de Valparaíso.

Além desses 16 eventos novos, o PR consolida os 28 eventos futuros já documentados no PR #140, mantendo a data original de verificação de 10/11 para essas fontes.


### Eventos adicionais confirmados em fontes oficiais

- **13/11, 21h–03h — PAGODIN 0800**, Portal Pub e Lounge, Novo Gama/GO. Grupo Vibe Pura e DJ Junio Muniz; entrada gratuita via Sympla; happy hour 21h–22h30. [Fonte oficial Sympla](https://www.sympla.com.br/evento/pagodin-0800-13-11-sexta/3637153).
- **14/11, 19h–04h — 5º Piseiro Mistura Louca**, Rancho do João Paulin, Quadra 2, S/N, Novo Gama/GO. Data, horário e local confirmados; atrações e preço não aparecem no conteúdo acessível. [Fonte oficial Sympla](https://www.sympla.com.br/evento/5o-piseiro-mistura-louca/3548228).
- **15/11, 15h–23h59 — Tardezinha da Club**, Club Gastrobar, Rua 2, Qd 58, Lote 21, Jardim Oriente, Valparaíso de Goiás/GO. Data, horário e local confirmados; atrações e gênero não informados. [Fonte oficial Sympla](https://www.sympla.com.br/evento/tardezinha-da-club/3636567).

### Expirados, cancelados e pendentes

**Resumo da rodada:** 16 novos eventos confirmados e preparados no PR; 0 eventos existentes atualizados; 1 expirado; 0 cancelados; 14 anúncios pendentes.

- **Expirado:** Surra de Modão + Cardápio em Dobro, 11/11, Contexto. O horário divulgado terminava às 02h de 12/11; a edição está vencida e não deve aparecer na agenda futura.
- **Cancelados:** nenhum cancelamento confirmado nesta rodada.
- **Pendentes (14 anúncios):** Quarta Delas no Quintal da Tia Sandra (sem line-up/datado na fonte oficial); New Khoder Lounge & Bar e Royal Lounge (páginas oficiais com cache miss); evento de 14/11 no Texxas Bar (página de ingresso indisponível para leitura direta); 299 Club (sem endereço exato); Intense Lounges (identificação/local ambíguos); Moonshine (local não identificado); Poll Party (local “a definir”); Ressaca do Jorem (horário de início sem confirmação); Arena Conic/Arena Birosca (conflito de local); Dead Slug no Porks (sem horário de início); Os Meninos de Barão no Viracopos (cabeçalho 15/11, descrição “domingo 11 de novembro”); Piseiro dos Brutos (intervalo do cabeçalho 07/11–05/12 diverge do horário de 05/12 às 21h na descrição); Corona Day no Osca (página de ingresso não abriu).
- A página musical da Ticiana Werner ainda exibia 11/11 como “hoje” na consulta; eventos futuros anteriormente listados nessa página ficam em revalidação, sem cancelamento automático.

## 4. Prioridades solicitadas

- **Surra de Modão:** a edição de 11/11 venceu; nenhum novo evento futuro foi confirmado nesta rodada.
- **Complexo Fora do Eixo:** Festa do Pisa (13/11) e Toca da Bruxa (14/11) continuam na agenda publicada; Molhadêra (15/11) foi confirmada e adicionada ao PR.
- **Contexto:** We The Funk (12/11), Deu Mó Love (13/11) e Sábado Mágico (14/11) permanecem na agenda; Terapia Sertaneja (18/11) foi confirmada e adicionada.
- **Oscarito Brasília:** Sábadô (14/11) permanece confirmado.
- **Telebar:** Os Meninos de Barão (15/11) permanece confirmado.
- **Rancho do Vaqueiro, Rota do Piseiro/Bar LG, Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar/Arena P10, Palahop, Quintal da Tia Sandra, Espaço LG/Bar LG, Galpão Zero 8, Narguimania, Decky Bar e Bar Stilo 10:** não foi encontrada nova programação oficial completa para esta rodada. Club Gastrobar (Valparaíso) e Portal Pub e Lounge (Novo Gama) foram descobertos e têm eventos confirmados nesta rodada.
- **Galpão dos Brutos:** permanece tratado como parado; nenhum evento foi associado a ele. A Rota do Piseiro e o Bar LG continuam separados; não apareceu flyer/post oficial atual que confirme o Bar LG como local.

## 5. Descoberta de estabelecimentos

**Resumo:** 5 novos perfis confirmados o suficiente para rascunho e preparados no PR; 0 inseridos no Supabase e 0 publicados. Além dos 33 rascunhos anteriores, 7 leads locais novos aguardam fonte oficial direta e 3 locais identificados apenas por anúncios de evento aguardam confirmação de operação permanente.

### Perfis preparados em draft no repositório

Cinco novos perfis foram preparados como \`draft\`, \`verified=false\`: **Worlld Brasília (SIA)**, **Zepelim Rock Bar (Asa Norte)**, **Eye Patch Panda (Asa Sul)**, **Portal Pub e Lounge (Novo Gama/GO)** e **Club Gastrobar (Valparaíso/GO)**. Portal Pub foi identificado pelo próprio produtor em página Sympla; Club Gastrobar tem Linktree oficial, Instagram vinculado, localização e Google Business. O perfil direto do Instagram do Club Gastrobar não abriu; visibilidade pública/privada não foi determinada. Nenhum dos cinco foi inserido no Supabase nem exposto ao público.

Os 33 candidatos em draft do PR #148 foram carregados para esta branch e permanecem não publicados. O perfil SamamBar já existe como publicado; Bar do Batata também já existe como publicado; Origen Bar já existe como draft. Nenhum desses foi duplicado.

### Leads pendentes em regiões sub-representadas

Pesquisa local/Google Business apontou leads para revisão, sem fonte oficial suficiente para criar perfil: Rota 060 Beer e Via Park Bar (Samambaia); Toinha Rock Pub (Samambaia); DIG ROCK BAR, Santa Vibe e APICE Entretenimento (Santa Maria); Wiskytorio Cervejaria e Supremo Restaurante (Gama); Cheiro do Mato (Planaltina); Quintal do Sucupira, Praianos Restaurante e Bohemios Bar Espetinho (Valparaíso); Santo Butiquim (endereço/região divergente). Bar do Batata já está publicado e Origen Bar já está em draft.


### Fontes não-Instagram com mudança/erro

- **Savassi Carne de Sol** — site oficial respondeu HTTP 200 e confirma as unidades Guará e Valparaíso, com cardápios e horários; não apresenta agenda de eventos datados. [Site oficial](https://savassicarnedesol.com.br/).
- **Quintal da Tia Sandra** — site oficial respondeu HTTP 200, confirma funcionamento de terça a domingo e música ao vivo semanal. A seção “Programação Musical” não expõe no HTML acessível nomes/datas/horários do line-up; Instagram e Facebook não foram usados para inferir conteúdo inacessível. [Site oficial](https://quintaldatiasandra.com.br/).
- **Meatz Burger — Sudoeste** — página oficial de delivery respondeu HTTP 200 e confirma endereço no CLSW 101, Bloco A, entrada 40; não divulga agenda de eventos. A página indica indisponibilidade no momento da consulta, o que não comprova encerramento. [Página da unidade](https://deliverydireto.com.br/meatzburger/sudoeste/pages/sobre-nos).
- **Sauz Restaurante** — site cadastrado respondeu HTTP 404; isso indica falha da URL registrada, não encerramento confirmado. Manter o estabelecimento publicado e recomendar revisão da fonte. [URL cadastrada](https://www.sauz.com.br/).


- **Portal Pub e Lounge — Novo Gama/GO:** perfil preparado em rascunho a partir de página Sympla do próprio produtor, com endereço e atividade de casa de shows confirmados. Google Business/RestaurantGuru também retornou telefone (61) 98416-9671 e horários de quinta a domingo; estes dados foram marcados como fonte secundária e não como confirmação oficial. Sem Instagram oficial identificado nesta rodada.
- **Club Gastrobar — Valparaíso/GO:** perfil preparado em rascunho com Linktree oficial, Instagram vinculado (@clubgastrobar), WhatsApp/localização e Google Business (4,2/15 avaliações). A página direta do Instagram falhou ao abrir; identidade do perfil foi confirmada pelo Linktree, mas visibilidade pública/privada não foi determinada.
- **Rancho do João Paulin — Novo Gama** foi identificado apenas como local de evento em página Sympla; sem fonte oficial permanente suficiente, ficou como candidato de local, sem perfil. **Dose Dupla** já corresponde ao rascunho existente **Arena Dose Dupla** do PR #140; o evento de 14/11 foi mantido lá e não duplicado.
- **Viracopos Gastro bar — Valparaíso** e **Chácara Três Passos — Águas Lindas** permanecem candidatos de local; o anúncio do Viracopos tem conflito de data e o anúncio da Chácara tem conflito entre intervalo do cabeçalho e horário descrito.

### Leads adicionais descobertos em pesquisa local

A pesquisa de descoberta por Google Business encontrou os seguintes estabelecimentos, sem correspondência pelo nome no Supabase nesta rodada. Foram mantidos como **candidatos pendentes**, sem criação de perfil, porque ainda falta vincular uma fonte direta oficial (Instagram/site/página do próprio estabelecimento) e confirmar a identidade operacional:

| Candidato | Região / endereço observado | Telefone público | Situação |
|---|---|---|---|
| Rota 060 Beer | ADE, Samambaia | +55 61 99913-9321 | Google Business indica bar com música ao vivo; falta URL oficial direta |
| Estação do Chopp | QR 219, Conjunto B, Lote 06, Santa Maria Norte | +55 61 3686-5349 | Bar/gastropub; falta fonte oficial direta |
| DIG ROCK BAR | QR 219, Conjunto B, Lote 01, Santa Maria Norte | +55 61 99155-4417 | Bar de música ao vivo; falta fonte oficial direta |
| Central Bar | QC 2, Santa Maria | +55 61 3393-6662 | Bar; falta fonte oficial direta |
| Supremo Restaurante | QI 03, Lote 220, Setor Leste Industrial, Gama | +55 61 3054-2020 | Bar/restaurante; falta fonte oficial direta |
| Bar do Chorão Drinks and Snacks | Quadra 03, Conjunto G, Lote 41, Vila Buritis, Planaltina/DF | +55 61 99184-4207 | Listagem com poucas avaliações; identidade/endereço aguardam validação |
| Tarumã Cozinha e Bar — unidade Gama | Setor Central / Ponte Alta Norte, Gama | +55 61 99408-8264 | Possível unidade distinta do rascunho Tarumã/SIG; não mesclar sem confirmação |

**Deduplicação realizada:** VBQ Samambaia já está entre os rascunhos do PR #148; Bendito Bar e Dom ManJu Gama já estão publicados; Don Potiguar Planaltina, Cozinha Bar Pantanal, Grill Espeto Bar, Quiosque Maranhense, Roda Pizza e Pizzaria Opção 1/Bar do Serginho já existem como rascunhos no Supabase. Nenhum deles foi recriado. O Tarumã do Gama foi mantido separado do candidato Tarumã/SIG, sem criar segunda unidade.

## 6. Publicação e segurança

- Branch: \`agenda/2026-11-12-daily-coverage\`
- PR #154: https://github.com/leonardodutrards-del/noite-df/pull/154 (branch atualizada; sem merge).
- A branch parte do \`main\` atual. O PR inclui 16 eventos novos confirmados, 28 eventos futuros já pesquisados (44 entradas futuras antes da revisão final), deduplicação por título + início + estabelecimento + fonte, testes e cinco perfis novos em draft.
- A lista pública filtra perfis \`draft\`; os cinco novos locais não serão exibidos.
- **Nenhum merge ou deploy de produção foi executado.** A produção atual está Vercel `READY` no commit `5b72d2b` (`main`), com aliases `noitedf.com.br` e `www.noitedf.com.br`. A home informa 104 locais; `/fim-de-semana` mostra 27 eventos de 13–15/11. A captura indexada de `/agenda-semanal` (rastreada há 2 dias) mostra 4 eventos e inclui 10/11 e 11/11; como não é uma captura live, a divergência ficou registrada para revalidação.
- Não houve postagem no Instagram, feed ou Stories e nenhum estabelecimento foi contatado.

## 7. Bloqueios e próximos passos

O bloqueio dominante é a impossibilidade de abrir os perfis do Instagram pela ferramenta, não uma confirmação de que estejam privados ou inexistentes. A rodada não é suficiente para autorizar publicação: é necessário revisar os perfis bloqueados, os eventos pendentes e a correspondência de unidades compartilhando Instagram.

**CI #556 aprovado no head `a3dabc3`:** 78/78 arquivos de teste, 315/315 testes; lint passou com 4 avisos não bloqueantes; build passou. Vercel Preview `READY`: https://noite-3d0vldlgb-leonardodutrards-dels-projects.vercel.app. A ferramenta de navegação não conseguiu abrir a rota protegida do Preview; o estado do deployment foi confirmado, mas não a revisão visual.

O deployment de produção permanece `READY` no `main` (`5b72d2b`), sem alterações desta rodada. **PR #154 permanece aberto e sem merge**, porque ainda existem lacunas de fontes/Instagram e eventos pendentes. Mesmo com CI verde, não publicar agenda parcial.

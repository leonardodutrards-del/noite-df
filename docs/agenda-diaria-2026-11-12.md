# Operação diária de cobertura e agenda — 12/11/2026

Horário da rodada: 08:18–08:30, America/Sao_Paulo.  
Projeto: \`leonardodutrards-del/noite-df\`.  
Escopo: Brasília/DF e Entorno. Nenhuma alteração direta nas tabelas de conteúdo de produção.

## 1. Base carregada do Supabase

Foram consultados todos os estabelecimentos com \`publication_status='published'\`.

- **104 estabelecimentos publicados**
- **22 regiões**
- 31 registros com Instagram; 47 com site; 30 com \`agenda_url\`
- 103 registros em \`data_sources\`, distribuídos por 80 estabelecimentos; 24 estabelecimentos publicados não têm fonte registrada nessa tabela
- 0 registros em \`event_candidates\`

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

**Registro efetuado:** 31 verificações inseridas em \`public.agenda_source_checks\`, com data, source_id, URL direta e evidência observável na nota de cada registro. Os dois perfis compartilhados entre unidades são Figueiredo Cozinha e Bar e Palorama; a identidade específica de cada unidade continua pendente. A URL do Latinos Bar cadastrada na base é um Reel, não uma página de perfil.

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

Além desses 13 eventos novos, o PR consolida os 28 eventos futuros já documentados no PR #140, mantendo a data original de verificação de 10/11 para essas fontes.

### Expirados, cancelados e pendentes

- **Expirado:** Surra de Modão + Cardápio em Dobro, 11/11, Contexto. O horário divulgado terminava às 02h de 12/11; a edição está vencida e não deve aparecer na agenda futura.
- **Cancelados:** nenhum cancelamento confirmado nesta rodada.
- **Pendentes:** Quarta Delas no Quintal da Tia Sandra (apenas fonte secundária; site oficial não abriu); eventos do New Khoder Lounge & Bar e Royal Lounge (páginas oficiais com cache miss); evento de 14/11 no Texxas Bar (página de ingresso indisponível para leitura direta); 299 Club (sem endereço exato); Intense Lounges (identificação/local ambíguos); Moonshine (local não identificado); Poll Party (local “a definir”); Ressaca do Jorem (horário de início sem confirmação); eventos associados a Arena Conic/Arena Birosca (conflito de local); Dead Slug no Porks (sem horário de início).
- A página musical da Ticiana Werner ainda exibia 11/11 como “hoje” na consulta; eventos futuros anteriormente listados nessa página ficam em revalidação, sem cancelamento automático.

## 4. Prioridades solicitadas

- **Surra de Modão:** a edição de 11/11 venceu; nenhum novo evento futuro foi confirmado nesta rodada.
- **Complexo Fora do Eixo:** Festa do Pisa (13/11) e Toca da Bruxa (14/11) continuam na agenda publicada; Molhadêra (15/11) foi confirmada e adicionada ao PR.
- **Contexto:** We The Funk (12/11), Deu Mó Love (13/11) e Sábado Mágico (14/11) permanecem na agenda; Terapia Sertaneja (18/11) foi confirmada e adicionada.
- **Oscarito Brasília:** Sábadô (14/11) permanece confirmado.
- **Telebar:** Os Meninos de Barão (15/11) permanece confirmado.
- **Rancho do Vaqueiro, Rota do Piseiro/Bar LG, Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar/Arena P10, Palahop, Quintal da Tia Sandra, Espaço LG/Bar LG, Galpão Zero 8, Narguimania, Decky Bar e Bar Stilo 10:** não foi encontrada nova programação oficial completa para esta rodada.
- **Galpão dos Brutos:** permanece tratado como parado; nenhum evento foi associado a ele. A Rota do Piseiro e o Bar LG continuam separados; não apareceu flyer/post oficial atual que confirme o Bar LG como local.

## 5. Descoberta de estabelecimentos

### Perfis preparados em draft no repositório

Três novos perfis foram preparados como \`draft\`, \`verified=false\`, com endereço e fonte oficial de evento: **Worlld Brasília (SIA)**, **Zepelim Rock Bar (Asa Norte)** e **Eye Patch Panda (Asa Sul)**. Não foram inseridos no Supabase nem expostos ao público.

Os 33 candidatos em draft do PR #148 foram carregados para esta branch e permanecem não publicados. O perfil SamamBar já existe como publicado; Bar do Batata também já existe como publicado; Origen Bar já existe como draft. Nenhum desses foi duplicado.

### Leads pendentes em regiões sub-representadas

Pesquisa local/Google Business apontou leads para revisão, sem fonte oficial suficiente para criar perfil: Rota 060 Beer e Via Park Bar (Samambaia); Toinha Rock Pub (Samambaia); DIG ROCK BAR, Santa Vibe e APICE Entretenimento (Santa Maria); Wiskytorio Cervejaria e Supremo Restaurante (Gama); Cheiro do Mato (Planaltina); Quintal do Sucupira, Praianos Restaurante e Bohemios Bar Espetinho (Valparaíso); Santo Butiquim (endereço/região divergente). Bar do Batata já está publicado e Origen Bar já está em draft.


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
- A branch parte do \`main\` atual. O PR inclui os eventos novos, 28 eventos futuros já pesquisados, deduplicação por título + início + estabelecimento + fonte, testes e perfis novos em draft.
- A lista pública filtra perfis \`draft\`; os três novos locais não serão exibidos.
- **Nenhum merge ou deploy de produção foi executado.** A produção foi conferida: a home informa 104 locais; `/fim-de-semana` mostra 27 eventos de 13–15/11; `/agenda-semanal` ainda está defasada, exibindo somente 4 eventos e mantendo 10/11 e 11/11 na seleção. Essa divergência deve ser validada no Preview antes de qualquer merge.
- A produção estava Vercel \`READY\` no commit \`5b72d2b\` no início da rodada. A página pública de fim de semana tinha um snapshot indexado com 27 eventos; a rota semanal não pôde ser validada por acesso direto com cache-bust nesta execução.
- Não houve postagem no Instagram, feed ou Stories e nenhum estabelecimento foi contatado.

## 7. Bloqueios e próximos passos

O bloqueio dominante é a impossibilidade de abrir os perfis do Instagram pela ferramenta, não uma confirmação de que estejam privados ou inexistentes. A rodada não é suficiente para autorizar publicação: é necessário revisar os perfis bloqueados, os eventos pendentes e a correspondência de unidades compartilhando Instagram.

Aguardar CI, lint, build e Vercel Preview READY no head deste PR. Mesmo com verificações verdes, manter o PR sem merge até a revisão das lacunas e conflitos de fonte/local.

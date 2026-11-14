# Operação diária de cobertura e agenda — 14/11/2026

Rodada executada em 14/11/2026, horário local America/Sao_Paulo. Escopo: Brasília/DF e Entorno. Alterações de conteúdo preparadas somente em branch/PR; nenhuma gravação de evento ou estabelecimento foi feita diretamente nas tabelas de produção.

## 1. Base e cobertura

- **104 estabelecimentos publicados** carregados do Supabase.
- **22 regiões** cobertas, sem lista fixa.
- **31 estabelecimentos** têm URL no campo `instagram`; há **32 registros Instagram em `data_sources`**, com **30 URLs únicas**.
- Uma URL adicional de Instagram, do Dudu Bar, existe em `data_sources` mas o campo `establishments.instagram` está vazio.
- **47** têm site, **30** têm agenda_url e **80** têm ao menos uma fonte registrada. **24 publicados** ainda não têm fonte em `data_sources`.
- **73 estabelecimentos** não têm valor no campo `instagram`; Dudu Bar é um dos casos com fonte registrada separadamente.

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

## 2. Instagram — 30 URLs únicas verificadas

Foram tentadas diretamente todas as **30 URLs únicas** registradas em `data_sources` (32 linhas de fonte, pois Figueiredo e Palorama aparecem em dois perfis/unidades). Os resultados foram gravados em `public.agenda_source_checks` em 14/11, entre 08h37 e 08h50 de Brasília.

| Classificação observável | URLs únicas |
|---|---:|
| Conteúdo público acessível sem login | 0 |
| Bloqueio explícito por robots.txt | 2 |
| Erro de fetch/cache miss | 28 |
| Privado confirmado | 0 |
| Inexistente confirmado | 0 |

Os dois bloqueios explícitos foram **Complexo Fora do Eixo** e **Birosca do Conic**. As outras 28 URLs não puderam ser abertas pela ferramenta. Cache miss/erro de fetch não comprova que a conta seja privada ou inexistente; por isso, nenhuma conta recebeu essas classificações sem evidência. Nenhum post, Reel ou Story foi lido nesta rodada.

Além das URLs de Instagram, os registros operacionais mostram **12 verificações de outras fontes** nesta rodada: 2 sem alteração, 3 com alteração, 3 erros de fetch, 1 erro HTTP e 3 registros de baseline. As fontes com erro/alteração ficaram para revisão manual; não foram tratadas como confirmação de agenda.

| Estabelecimento(s) | URL direta | Resultado |
|---|---|---|
| Arena Adega dos Amigos | [@arenaadega](https://www.instagram.com/arenaadega/) | Cache miss |
| Bahrein Cozinha e Bar | [@bahreincozinhabar](https://www.instagram.com/bahreincozinhabar/) | Cache miss |
| Bar do Assis | [@bar.assis](https://www.instagram.com/bar.assis/) | Cache miss |
| Bar Godofredo | [@godofredo408norte](https://www.instagram.com/godofredo408norte/) | Erro de fetch |
| Bar Stilo 10 | [@barstilo10](https://www.instagram.com/barstilo10/) | Cache miss |
| Bendito Bar | [@benditobar_planaltina](https://www.instagram.com/benditobar_planaltina/) | Cache miss |
| Birosca do Conic | [@biroscadoconic](https://www.instagram.com/biroscadoconic/) | Bloqueio robots.txt |
| Boteco da Madá | [@botecodamadabsb](https://www.instagram.com/botecodamadabsb/) | Cache miss |
| Brasileirinho Bar e Restaurante | [@brasileirinhoqd08](https://www.instagram.com/brasileirinhoqd08/) | Cache miss |
| Chopp Brasília Bier Sobradinho | [@choppbrasiliabiersobradinho](https://www.instagram.com/choppbrasiliabiersobradinho/) | Cache miss |
| Clube 27 Bar | [@clube27bar](https://www.instagram.com/clube27bar/) | Cache miss |
| Clube AQUA | [@aquaplays1](https://www.instagram.com/aquaplays1/) | Cache miss |
| Complexo Fora do Eixo | [@complexoforadoeixo](https://www.instagram.com/complexoforadoeixo/) | Bloqueio robots.txt |
| Contexto Bar | [@contextobar](https://www.instagram.com/contextobar/) | Erro de fetch |
| Decky Bar | [@decky_barsobradinho](https://www.instagram.com/decky_barsobradinho/) | Cache miss |
| Dudu Bar | [@dudubaroficial](https://www.instagram.com/dudubaroficial/) | Erro de fetch; fonte existe em `data_sources`, mas campo `instagram` vazio |
| Eita Lounge Bar | [@eitaloungebar](https://www.instagram.com/eitaloungebar/) | Cache miss |
| Figueiredo Cozinha e Bar — Planaltina e Valparaíso | [@figueiredocozinhaebar](https://www.instagram.com/figueiredocozinhaebar/) | Cache miss; mesmo handle em dois perfis/unidades |
| Galpão dos Brutos | [@osbrutosdopiseiro1](https://www.instagram.com/osbrutosdopiseiro1/) | Cache miss; local não tratado como programação atual |
| Galpão Zero 8 | [@galpao.zero8](https://www.instagram.com/galpao.zero8/) | Cache miss |
| IVV Swinebar | [@ivvswinebar](https://www.instagram.com/ivvswinebar/) | Erro de fetch |
| Latinos Bar | [URL cadastrada](https://www.instagram.com/reel/c-0gbrru65s/) | Cache miss; a URL é um Reel, não um perfil |
| Narguimania Show Bar | [@narguimaniashowbar_eventos](https://www.instagram.com/narguimaniashowbar_eventos/) | Cache miss |
| Oscarito Brasília | [@oscaritobrasilia](https://www.instagram.com/oscaritobrasilia/) | Cache miss |
| P10 Gastrobar | [@p10gastrobar](https://www.instagram.com/p10gastrobar/) | Erro de fetch |
| Palahop | [@palahopoficial](https://www.instagram.com/palahopoficial/) | Cache miss |
| Palorama Burguer — Quadra 8 e Sobradinho II | [@palorama.oficial](https://www.instagram.com/palorama.oficial/) | Cache miss; mesmo handle em dois perfis/unidades |
| Pipa Drinks Águas Claras | [@pipa.drinks](https://www.instagram.com/pipa.drinks/) | Erro de fetch |
| Rancho do Vaqueiro | [@ranchodovaqueirobsb](https://www.instagram.com/ranchodovaqueirobsb/) | Cache miss |
| Trends Pub | [@trendsbar](https://www.instagram.com/trendsbar/) | Cache miss |

**Observações de integridade:** Figueiredo Cozinha e Bar e Palorama Burguer usam o mesmo handle em dois perfis publicados cada. Não foram fundidos; a existência de unidades distintas deve ser validada por endereço. Latinos Bar tem URL de Reel cadastrada no lugar de um perfil; a identidade da conta não foi inferida. Dudu Bar tem URL oficial registrada pelo site, mas não no campo `instagram`; não promovi o valor automaticamente.

Fora da base, foram tentadas as URLs de `@surrademodao` e duas variações de Rota do Piseiro; todas retornaram cache miss. Não foi localizado perfil oficial inequívoco da Rota do Piseiro. A página de Instagram do Toinha foi encontrada por meio do Linktree oficial, mas o perfil não foi aberto.

## 3. Eventos — confirmações, atualizações e pendências

Seis eventos novos completos foram adicionados nesta rodada suplementar ao arquivo `events-2026-11-14-upcoming.ts`. Os três eventos já presentes na primeira atualização da branch foram mantidos. A janela cobre a programação de sábado, 14/11, e os próximos eventos até 21/11.

| Data | Horário | Evento | Local / região | Estilo | Fonte |
|---|---|---|---|---|---|
| Sábado, 14/11 | 17h–01h (15/11) | Dark House Fest — 1ª edição | Moto Rock & Cia · Taguatinga | Rock autoral | [Sympla oficial](https://www.sympla.com.br/evento/dark-house-fest-1-edicao/3605216) |
| Sábado, 14/11 | 17h–23h45 | Samba de Maria | Brasília Motonáutica Clube · Vila Planalto | Samba / pagode | [Sympla oficial](https://www.sympla.com.br/evento/samba-de-maria-14-11/3648536) |
| Sábado, 14/11 | 20h–01h (15/11) | Noite de Tributos — Guns N’ Roses e Bon Jovi | Trends Pub / Trend’s Bar · Gama | Rock / tributos: BKD Guns e Bon Jovi Experience | [Sympla oficial](https://www.sympla.com.br/evento/noite-de-tributos/3631271) |
| Quinta, 19/11 | 21h–05h (20/11) | Quinta do CPX — Pré-feriado | Complexo Fora do Eixo · SAAN | Funk / open bar | [Sympla oficial](https://www.sympla.com.br/evento/quinta-do-cpx-19-de-novembro/3652478) |
| Sexta, 20/11 | 12h–01h30 (21/11) | Consciência Negra 2026 — Resistência, Festa e Liberdade | Babylon Delicatessen · Samambaia Sul | Samba / feijoada / cultura afro-brasileira | [Sympla oficial](https://www.sympla.com.br/evento/consciencia-negra-2026-resistencia-festa-e-liberdade/3640226) |
| Sexta, 20/11 | 19h–01h (21/11) | Sistema Criolina — Pezão & Barata | Eye Patch Panda · Asa Sul | Brasilidades, ritmos latinos, grooves africanos, funk, soul e disco | [Sympla oficial](https://www.sympla.com.br/evento/sistema-criolino-pezao-barata/3626406) |
| Sexta, 20/11 | 20h–03h30 (21/11) | Curtindo a Vida Adoidado — 3ª edição | London Music Bar — Águas Claras · Águas Claras | Pop / rock / dance / flashback | [Sympla oficial](https://www.sympla.com.br/evento/curtindo-a-vida-adoidado-3oedicao/3652741) |
| Sábado, 21/11 | 21h–06h (22/11) | Festa Toma — Edição Agrobaile | Contexto Bar · Setor de Clubes Sul | Funk / eletrofunk / 808 | [Sympla oficial](https://www.sympla.com.br/evento/festa-toma-edicao-agrobaile-club-contexto-boate-contexto-sabado-21-11-as-21h/3642351) |
| Sábado, 21/11 | 22h–05h (22/11) | INFLAMA | Complexo Fora do Eixo · SAAN | Festa / DJs; gênero único não especificado | [Sympla oficial](https://www.sympla.com.br/evento/inflama-21-de-novembro/3650933) |

**Evento atualizado e deduplicado:** `Sábado Mágico | 14.11 | Varanda Contexto Bar` e `FeijoADA com Amor de Aluguel | 14.11 | Varanda Contexto Bar` são duas páginas oficiais do mesmo produtor para a mesma sessão (14/11, 11h–04h, Contexto). Mantive apenas o evento canônico `Sábado Mágico` e incorporei os dados da página complementar: feijoada R$59,90; segunda feijoada gratuita somente para compra antecipada; Amor de Aluguel; brinquedoteca; maiores de 18 anos; couvert artístico obrigatório para a opção VIP. [Página Sábado Mágico](https://www.sympla.com.br/evento/sabado-magico-14-11-varanda-contexto-bar/3626205) · [Página FeijoADA](https://www.sympla.com.br/evento/feijoada-com-amor-de-aluguel-14-11-varanda-contexto-bar/3626028).

O Supabase já continha **Alberto Moreno — O Rei do Brega-Pop**, sábado 21/11, 21h–04h, na Arena Adega dos Amigos, Ceilândia; o evento foi preservado sem duplicação. [Sympla oficial](https://www.sympla.com.br/evento/alberto-moreno-o-rei-do-brega-pop-pela-1a-vez-em-brasilia-df/3586393).

### Pendentes — não publicar

- **Corona Day no Osca — 14/11, 9h–16h, Oscarito:** a página oficial da Sympla aparece indexada (ID 3648831), mas a abertura direta retornou cache miss; há outra edição antiga de 17/10 com título semelhante. Não confundir as edições. [Sympla — página indexada](https://www.sympla.com.br/evento/lgc/3648831).
- **Blood Fire Death Festival — 14/11, 18h–01h, Galpazinho, Gama:** data, início e nome do local aparecem na página oficial, mas o endereço fica apenas em “Setor Central”; falta logradouro/lote para confirmar a identidade do espaço. [Sympla](https://www.sympla.com.br/evento/blood-fire-death-festival-11-edicao-2026/3203693).
- **Os Meninos de Barão no Viracopos — 15/11, 18h–23h30:** o cabeçalho oficial informa 15/11, mas a descrição ainda diz “Domingo 11 de novembro”; além disso, a ficha de CNPJ consultada apresenta endereço diferente do Google Business e da página de ingresso. Mantido pendente por conflito, sem associar a outro gastrobar. [Sympla](https://www.sympla.com.br/evento/os-meninos-de-barao-no-viracopos-valparaiso-gg/3618316).
- **OBLIVION — 20/11, 21h, Culto Rock Bar / CONIC:** a página oficial informa fim em 21/11/2601 às 04h, claramente inconsistente, e o local aparece como SDS/Subsolo/CONIC sem endereço mais preciso. Não publicar até correção. [Sympla](https://www.sympla.com.br/evento/lgc/3613043).
- **B DAY SEM DISTINÇÃO — Arena P10, 21/11:** cabeçalho da Sympla informa início às 16h, mas a descrição informa 17h. Pendente por conflito de horário. [Sympla](https://www.sympla.com.br/evento/lgc/3650152).
- **Marília Tavares — 21/11:** a página anuncia 20h no “Amsterdam”, mas identifica o local no cabeçalho como Bahrein Comida de Boteco. A identidade/relação entre os nomes ainda precisa ser reconciliada. Não associar ao Bahrein Cozinha e Bar de Valparaíso. [Sympla](https://www.sympla.com.br/evento/21-11-marilia-tavares-no-amsterdam/3642490).
- **Rota do Piseiro / Bar LG:** nenhuma publicação/flyer oficial atual acessível confirma data, horário e local; não publicar nem associar ao Galpão dos Brutos.
- **FLASHDANCE — A Noite da Nostalgia, Mansão Rotineira, 21/11:** a página do evento informa cancelamento; foi excluído da agenda. [Sympla](https://www.sympla.com.br/evento/flashdance-a-noite-da-nostalgia/3618305).

### Expiração de eventos passados

No Supabase, 24 eventos publicados tinham `ends_at < now()`; havia um evento futuro publicado. Foi preparada a migration `20261114120000_expire_past_published_events.sql`, que altera somente registros publicados com horário final explícito já passado. A migration não foi aplicada diretamente ao banco; aguarda o fluxo de PR.

## 4. Descoberta de estabelecimentos


### Novos perfis em draft na branch

Foram preparados **6 perfis adicionais nesta rodada**, totalizando **8 perfis em draft** na branch (todos `publicationStatus='draft'` e `verified=false`, portanto fora da lista pública):

1. **Saguari Gastro House — Samambaia:** site oficial confirma QS 310, Conjunto 5, Lote 7, telefone, horário e cardápio. [Site oficial](https://www.saguarigastrohouse.com.br/)
2. **Toinha Brasil Show — Guará:** Linktree oficial reúne canais de Instagram, Facebook, ingressos, WhatsApp e site; endereço e telefone cruzados com Google Business. [Linktree oficial](https://linktr.ee/toinhabrasilshow)
3. **Estação Beira Lago — Setor de Clubes Sul:** ficha Google Business cruzada com a página oficial do evento Chama no Pagode; endereço SCES Trecho 1, Conjunto 3, Lote 5.
4. **London Music Bar — Águas Claras:** unidade distinta da Asa Sul já em draft; Google Business e Sympla confirmam Avenida Jacarandá, 22. A reportagem da VEJA também distingue a unidade original de Águas Claras da segunda unidade na Asa Sul.
5. **Moto Rock & Cia — Taguatinga:** site oficial confirma endereço QNJ 18, Área Especial e WhatsApp; evento Dark House Fest confirmado para 14/11. [Site oficial](https://motorockecia.com.br/)
6. **Brasília Motonáutica Clube — Vila Planalto/SCEN:** site oficial, ficha Google Business e Sympla confirmam o clube, o endereço e a existência de restaurante, bar, lanchonete e salões de eventos. [Site oficial](https://brasiliamotonauticaclube.com/)
7. **Mansão Rotineira — Santa Maria:** ficha Google Business identifica chácara/espaço de eventos no Setor de Mansões Abraão II, Chácara 03. O evento Flashdance de 21/11 foi verificado separadamente e está cancelado; não foi incluído.
8. **Babylon Delicatessen — Samambaia Sul:** site oficial confirma QN 303, Conjunto 04, Loja 04, telefone e proposta de bar/restaurante com música. A casa declara estar em pré-abertura; por isso o perfil permanece em draft, embora o evento oficial de 20/11 esteja confirmado. [Site oficial](https://www.babylonbsb.com.br/)

A busca de duplicidade no Supabase por nome, variações, endereço, telefone e região não encontrou correspondência publicada para os seis novos perfis. Nenhum perfil foi inserido diretamente no Supabase.

### Atualização de perfil existente

**Trends Pub** (nome preservado no cadastro; evento anunciado como Trend’s Bar): endereço atualizado na branch de “Gama — DF” para **Quadra 05, Lote 20, Setor Industrial do Gama, Brasília/DF**, cruzando Google Business com a página oficial da Sympla para Noite de Tributos em 14/11. Telefone não foi alterado porque as fontes públicas consultadas divergiam.

### Candidatos pendentes

- **Viracopos Gastrobar — Valparaíso-GO:** evento oficial e Google Business apontam Rua 100, 2-192, mas o cadastro público de CNPJ consultado aponta Rua 73, Qd. 113, Lote 04; além disso, a descrição da Sympla contém data divergente. Perfil e evento permanecem pendentes.
- **Galpazinho — Gama:** evento localizado, mas sem endereço completo além de Setor Central; não criar perfil até identificar logradouro/lote.
- **Estação do Chopp — Santa Maria:** fontes públicas apontam endereços diferentes (QR 219, QR 319 e QR 218); pendente.
- **DIG Rock Bar — Santa Maria:** endereço diverge entre referências públicas e a evidência de atividade atual ainda é insuficiente; pendente.
- **Culto Rock Bar — CONIC:** evento OBLIVION aponta o local, mas não há identificação/endereço inequívoco do estabelecimento; pendente.
- **Rota do Piseiro / Bar LG — Sobradinho:** falta perfil oficial inequívoco da Rota do Piseiro e flyer atual que confirme o Bar LG como local; manter os nomes separados.
- **Babylon Delicatessen:** perfil em draft por pré-abertura; não publicar o estabelecimento até confirmação de abertura regular.

O VBQ Samambaia já constava como draft em branch anterior; não foi duplicado. Bar e Jantinha do Mazim já existe como draft no Supabase, e Bendito Bar já está publicado; ambos foram preservados sem duplicação.

### Correção Galpão dos Brutos / Bar LG

Galpão dos Brutos permanece no cadastro, mas não foi tratado como local de programação atual. A programação a investigar é a da Rota do Piseiro no Bar LG; não foi encontrada evidência atual suficiente para associar evento ao Bar LG. Os dois espaços permanecem separados, sem duplicação e sem despublicação automática.

## 5. Publicação e segurança

- **Branch:** `agenda/2026-11-12-daily-coverage`
- **PR:** [#154 — Agenda diária 14/11: eventos oficiais, cobertura e novos drafts](https://github.com/leonardodutrards-del/noite-df/pull/154)
- **Commit de atualização:** será validado pelo CI após o push desta rodada.
- **CI anterior ao ajuste:** testes e lint passaram; o build falhou por dois objetos `businessContact` sem `checkedAt` (Olinda e Xique Xique) em `places-2026-11-13.ts`. O campo foi incluído nos dois objetos neste commit; aguarda-se nova execução de testes, lint e build.
- **Preview Vercel anterior:** não ficou READY porque o build do head anterior falhou. A nova prévia só será considerada pronta após deployment READY e conferência das páginas afetadas.
- **Produção:** nenhuma alteração desta rodada foi publicada. O deployment de produção anterior permanece como referência; o PR não foi mesclado.
- A migration de expiração dos 24 eventos passados continua apenas no PR; não foi aplicada ao Supabase.
- Nenhuma gravação direta de novos eventos ou estabelecimentos no Supabase, nenhum contato com casas e nenhuma postagem no Instagram/feed/Stories.


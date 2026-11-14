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

## 3. Eventos — novas confirmações

Três novos eventos completos foram adicionados à agenda da branch, com data, início e local confirmados em listagens oficiais de ingresso:

| Data | Horário | Evento | Local / região | Estilo | Fonte |
|---|---|---|---|---|---|
| Quinta, 19/11 | 21h–05h (20/11) | Quinta do CPX — Pré-feriado | Complexo Fora do Eixo · SAAN | Funk / open bar | [Sympla oficial](https://www.sympla.com.br/evento/quinta-do-cpx-19-de-novembro/3652478) |
| Sábado, 21/11 | 21h–06h (22/11) | Festa Toma — Edição Agrobaile | Contexto Bar · Setor de Clubes Sul | Funk / eletrofunk / 808 | [Sympla oficial](https://www.sympla.com.br/evento/festa-toma-edicao-agrobaile-club-contexto-boate-contexto-sabado-21-11-as-21h/3642351) |
| Sábado, 21/11 | 22h–05h (22/11) | INFLAMA | Complexo Fora do Eixo · SAAN | Festa / DJs; gênero único não especificado | [Sympla oficial](https://www.sympla.com.br/evento/inflama-21-de-novembro/3650933) |

**Limitação de acesso:** os links são páginas oficiais de ingresso da Sympla, mas a abertura direta do HTML retornou cache miss. Os dados foram conferidos nos resultados indexados das próprias páginas oficiais; os links diretos estão preservados para conferência humana. Nenhum preço foi inferido.

O Supabase já contém um evento futuro publicado: **Alberto Moreno — O Rei do Brega-Pop**, sábado 21/11, 21h–04h, na Arena Adega dos Amigos, Ceilândia; 2º lote informado a R$40 + taxa. [Sympla oficial](https://www.sympla.com.br/evento/alberto-moreno-o-rei-do-brega-pop-pela-1a-vez-em-brasilia-df/3586393). Esse evento já estava cadastrado e não foi duplicado.

### Pendentes — não publicar

- **B DAY SEM DISTINÇÃO — Arena P10, 21/11:** cabeçalho da Sympla informa início às 16h, mas a descrição informa 17h. Pendente por conflito de horário. [Sympla](https://www.sympla.com.br/evento/lgc/3650152)
- **Marília Tavares — 21/11:** a página anuncia 20h no “Amsterdam”, mas identifica o local no cabeçalho como Bahrein Comida de Boteco. A identidade/relação entre os nomes ainda precisa ser reconciliada. Não associar ao Bahrein Cozinha e Bar de Valparaíso. [Sympla](https://www.sympla.com.br/evento/21-11-marilia-tavares-no-amsterdam/3642490)
- **Rota do Piseiro / Bar LG:** sem flyer/post oficial atual que confirme data, horário e local; não publicar.
- **Surra de Modão:** nenhuma nova edição futura confirmada nesta rodada.
- **Quintal da Tia Sandra:** não foi localizada agenda futura datada verificável nesta rodada.

### Expiração de eventos passados

No Supabase, 24 eventos publicados tinham `ends_at < now()`; havia um evento futuro publicado. Foi preparada a migration `20261114120000_expire_past_published_events.sql`, que altera somente registros publicados com horário final explícito já passado. A migration não foi aplicada diretamente ao banco; aguarda o fluxo de PR.

## 4. Descoberta de estabelecimentos

### Novos perfis em draft na branch

Foram preparados **2 perfis**, ambos `publicationStatus='draft'` e `verified=false`, portanto excluídos da lista pública:

1. **Saguari Gastro House — Samambaia:** site oficial confirma QS 310, Conjunto 5, Lote 7, telefone, horário e cardápio. [Site oficial](https://www.saguarigastrohouse.com.br/)
2. **Toinha Brasil Show — Guará:** Linktree oficial reúne canais de Instagram, Facebook, ingressos, WhatsApp e site; endereço e telefone cruzados com Google Business. [Linktree oficial](https://linktr.ee/toinhabrasilshow)

A busca de duplicidade no Supabase por nome, endereço e telefone não encontrou correspondência publicada para esses dois perfis. Nenhum perfil foi inserido diretamente no Supabase.

### Candidatos pendentes

- **Rota 060 Beer — Samambaia:** localizado em diretório secundário; falta confirmar canal oficial atual.
- **Labihz Centro Cultural — Planaltina-GO:** ficha pública de negócio localizada; canal oficial e programação atual não confirmados.
- **Biroska Restaurante e Choperia — Planaltina-GO:** ficha pública localizada; falta canal oficial.
- **Villa Gourmet Plan-GO — Planaltina-GO:** ficha pública localizada; falta confirmação em canal oficial.
- **Senhor Buteco — Luziânia:** ficha pública localizada; falta confirmação em canal oficial.
- **Cachaçaria Mineira e Beer House — Ceilândia:** fichas públicas localizadas; identidade/canais oficiais precisam de revisão.
- **Mezha Cozinha e Bar — Samambaia:** ficha pública localizada; falta confirmação em canal oficial.

O VBQ Samambaia já consta como draft em branch anterior; não foi duplicado. Bar e Jantinha do Mazim já existe como draft no Supabase, e Bendito Bar já está publicado; ambos foram preservados sem duplicação.

### Correção Galpão dos Brutos / Bar LG

Galpão dos Brutos permanece no cadastro, mas não foi tratado como local de programação atual. A programação a investigar é a da Rota do Piseiro no Bar LG; não foi encontrada evidência atual suficiente para associar evento ao Bar LG. Os dois espaços permanecem separados, sem duplicação e sem despublicação automática.

## 5. Publicação e segurança

- **Branch:** `agenda/2026-11-12-daily-coverage`
- **PR:** [#154 — Agenda diária 14/11: eventos oficiais, cobertura e novos drafts](https://github.com/leonardodutrards-del/noite-df/pull/154)
- **Último CI:** execução #583 passou em 322 testes e falhou em 1 asserção antiga que esperava 4 eventos no Porks; após a revisão, o teste foi ajustado para os 2 eventos efetivamente confirmados. Nova execução ainda pendente no head atual.
- **Preview Vercel:** deployment do head atual em fila; ainda não READY.
- **Produção:** último deployment observado em `READY` no commit `5b72d2b2326cb12b9cad6959437c78baf04bb9f0` da branch `main`. Nenhuma alteração desta rodada foi publicada.
- Nenhum merge, nenhuma gravação direta de novos eventos/estabelecimentos no Supabase, nenhum contato com casas e nenhuma postagem no Instagram/feed/Stories.

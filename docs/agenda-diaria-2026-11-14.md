# Operação diária de cobertura e agenda — 14/11/2026

Rodada executada em 14/11/2026, horário local America/Sao_Paulo. Escopo: Brasília/DF e Entorno. Alterações de conteúdo preparadas somente na branch/PR; nenhuma gravação de evento ou estabelecimento foi feita diretamente nas tabelas de produção.

## 1. Base e cobertura

- **104 estabelecimentos publicados** carregados do Supabase.
- **22 regiões** cobertas, sem lista fixa.
- **31 estabelecimentos** têm Instagram cadastrado; 32 registros de fonte oficial Instagram, correspondentes a 30 URLs distintas.
- **47** têm site, **30** têm agenda_url e **80** têm ao menos uma fonte registrada. **24 publicados** ainda não têm fonte em data_sources.
- **73 estabelecimentos** não têm Instagram cadastrado.

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

## 2. Instagram — verificação direta desta rodada

Foram reabertas diretamente 11 URLs de perfis prioritários e de apoio. As verificações foram registradas em `public.agenda_source_checks` às 08:37 de Brasília:

| Resultado desta rodada | Quantidade |
|---|---:|
| Conteúdo público acessível sem login | 0 |
| Bloqueio explícito por robots.txt | 2 |
| Erro de fetch/cache miss | 9 |
| Privado confirmado | 0 |
| Inexistente confirmado | 0 |

Os dois bloqueios explícitos foram Complexo Fora do Eixo e Birosca do Conic. Os nove erros/cache miss foram Rancho do Vaqueiro, Eita Lounge Bar, P10 Gastrobar, Palahop, Oscarito Brasília, Contexto Bar, Pipa Drinks, Bar Godofredo e IVV Swinebar. Não foi possível ler posts, Reels ou Stories dessas contas nesta rodada; erro de fetch não significa perfil privado ou inexistente.

Os outros 20 URLs cadastrados não foram reabertos hoje; permanecem com a última evidência registrada em 13/11. Naquela rodada, nenhum dos 29 URLs únicos abriu conteúdo, com bloqueios/limitações e erros/cache miss documentados. Não se tentou contornar login, CAPTCHA, robots.txt ou limites da plataforma.

Verificações externas prioritárias:
- `@surrademodao`: URL direta tentou abrir, mas retornou cache miss; nenhum conteúdo foi lido.
- Rota do Piseiro: variações de URL pesquisadas não produziram perfil oficial inequívoco.
- Bar LG/Espaço LG: nenhum flyer/post atual ou página oficial de ingresso confirmou o local para a Rota do Piseiro.

O verificador de fontes não-Instagram registrou hoje 12 checagens: 2 ok, 3 changed, 3 error, 1 http_error e 3 baseline. Conteúdo alterado ou bloqueado segue para revisão manual; não foi tratado como confirmação automática de evento.

## 3. Eventos — novas confirmações

Três novos eventos completos foram adicionados à agenda da branch, todos com data, início e local em página oficial de ingresso:

| Data | Horário | Evento | Local / região | Estilo | Fonte |
|---|---|---|---|---|---|
| Quinta, 19/11 | 21h–05h (20/11) | Quinta do CPX — Pré-feriado | Complexo Fora do Eixo · SAAN | Funk / open bar | [Sympla oficial](https://www.sympla.com.br/evento/quinta-do-cpx-19-de-novembro/3652478) |
| Sábado, 21/11 | 21h–06h (22/11) | Festa Toma — Edição Agrobaile | Contexto Bar · Setor de Clubes Sul | Funk / eletrofunk / 808 | [Sympla oficial](https://www.sympla.com.br/evento/festa-toma-edicao-agrobaile-club-contexto-boate-contexto-sabado-21-11-as-21h/3642351) |
| Sábado, 21/11 | 22h–05h (22/11) | INFLAMA | Complexo Fora do Eixo · SAAN | Festa / DJs; gênero único não especificado | [Sympla oficial](https://www.sympla.com.br/evento/inflama-21-de-novembro/3650933) |

Os eventos já preparados nos PRs anteriores para 12–15/11 e 18/11–09/12 foram preservados e não foram duplicados.

### Pendentes — não publicar

- **B DAY SEM DISTINÇÃO — Arena P10, 21/11:** o cabeçalho da Sympla informa início às 16h, mas a descrição informa início às 17h. Mantido pendente por conflito de horário. [Sympla](https://www.sympla.com.br/evento/lgc/3650152)
- **Marília Tavares — 21/11:** a página oficial anuncia 20h no “Amsterdam”, mas identifica o local no cabeçalho como Bahrein Comida de Boteco. A identidade/relação entre os nomes ainda precisa ser reconciliada. Não associar ao Bahrein Cozinha e Bar de Valparaíso. [Sympla](https://www.sympla.com.br/evento/21-11-marilia-tavares-no-amsterdam/3642490)
- **Rota do Piseiro / Bar LG:** sem flyer/post oficial atual que confirme data, horário e local; não publicar.
- **Surra de Modão:** nenhuma nova edição futura confirmada nesta rodada.
- **Quintal da Tia Sandra:** a seção de programação do site não apresentou anúncio futuro datado verificável nesta rodada.

### Expiração de eventos passados

No Supabase, 24 eventos ainda estavam com status `published` apesar de já terem `ends_at < now()`; havia um evento futuro publicado. Foi preparada a migration `20261114120000_expire_past_published_events.sql`, que altera somente registros publicados com horário final explícito já passado. A migration não foi aplicada diretamente ao banco; aguarda o fluxo de PR.

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
- **PR:** [#154 — Agenda diária 12/11: cobertura, eventos confirmados e locais em draft](https://github.com/leonardodutrards-del/noite-df/pull/154)
- **Preview:** aguardando novo estado de Vercel após as alterações desta rodada.
- **Produção:** último deployment observado em `READY` no commit `5b72d2b2326cb12b9cad6959437c78baf04bb9f0` da branch `main`. Nenhuma alteração desta rodada foi publicada.
- Nenhuma mensagem enviada a estabelecimentos; nenhum feed ou Story publicado; nenhuma gravação direta de novos eventos ou estabelecimentos em produção.

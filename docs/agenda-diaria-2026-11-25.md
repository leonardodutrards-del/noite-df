# Operação diária Noite DF — 25/11/2026

## Base, cobertura e checkpoint

- Supabase consultado no início: **104 estabelecimentos publicados em 22 regiões**.
- Lote rotativo de 10 publicados: Santa Aldeia Bar (Sobradinho), Outback Conjunto Nacional (Asa Norte), Olinda Bar e Restaurante (Taguatinga), Dudu Bar (Asa Sul), Xique Xique Asa Norte e Asa Sul, Porks Sobradinho, Na Banca (Sobradinho), Jotaká (Águas Claras) e Outback DF Plaza (Águas Claras).
- Resultado do lote: **8 páginas oficiais/públicas com conteúdo legível**, **1 página sem texto recuperável** (Porks; somente conteúdo gráfico) e **1 estabelecimento sem fonte pública atual cadastrada** (Santa Aldeia). Xique Xique foi aberto uma única vez e usado para revisar as duas fichas.
- Foram gravados **9 checks** em `agenda_source_checks`: 8 `ok` e 1 `error`. Estado após a gravação: **427 data_sources / 667 agenda_source_checks**.
- Cobertura acumulada: **103/104** estabelecimentos com algum check nos últimos 7 dias. O único sem check é **Santa Aldeia Bar**; não há estabelecimento com check mais antigo que 7 dias. Isso não significa que todos os perfis tenham conteúdo legível ou agenda.
- Regiões cobertas pelo lote: Sobradinho, Asa Norte, Asa Sul, Taguatinga e Águas Claras. As páginas abertas confirmaram identidade/endereço/horários, mas não apresentaram agenda pública datada para os próximos dias.
- Não existe tabela dedicada de checkpoint; o avanço desta rodada ficou registrado nos checks por fonte e neste relatório.

## Rodízio de cinco prioritários

- Perfis selecionados pelo check mais antigo: **Telebar, Quintal da Tia Sandra, Arena P10, Bar Stilo 10 e Decky Bar**.
- A busca pública rápida não localizou programação futura indexada para esses cinco. Arena P10: a página Sympla encontrada refere-se ao B Day Sem Distinção de 21/11, já encerrado. Bar Stilo 10: o resultado mais recente localizado é Biguinho Sensação, de 07/03/2026, encerrado. Quintal da Tia Sandra: resultados localizados são de 07/09 e 12/10, ambos passados. Telebar e Decky Bar: nenhum evento futuro encontrado nas fontes indexadas consultadas.
- Instagram direto não foi reaberto nesta rodada: as últimas tentativas registradas para Quintal, Stilo 10 e Decky tiveram bloqueio/redirecionamento ou throttling. Não classificar esses perfis como privados ou inexistentes.

## Instagram — estado agregado da base

- 31/104 estabelecimentos publicados têm URL de Instagram cadastrada; 73 não têm.
- Último estado armazenado para os 31: 27 `error`, 3 `http_error` e 1 `blocked`. Não há confirmação armazenada de perfil privado ou inexistente. Nesta rodada não houve leitura direta de conteúdo de Instagram.
- Os erros de fetch não comprovam que o perfil esteja indisponível; indicam somente que a fonte não foi recuperada.

## Eventos e flyers — quarta-feira

### Novos dados oficiais

- **Sábadô + Final da Libertadores no Oscarito** — sábado, **28/11/2026, 16h–02h (29/11)**, Oscarito Brasília, SIG Quadra 01, Lotes 985. A Sympla confirma abertura dos portões às 16h, transmissão Palmeiras x Estudiantes às 17h, DJ Primo, Boteco do Clima, Henrique & Ruan e Banda Dexcomplica; entrada antecipada de conveniência R$ 20 até 21h, com complemento após esse horário; 18+. [Página oficial Sympla](https://www.sympla.com.br/evento/sabado-final-da-libertadores-no-oscarito/3664203)
- **Réveillon VBQ 2027** — quinta, **31/12/2026, 20h–04h (01/01/2027)**, Villa Butiquim/VBQ Samambaia, QS 122 Conjunto 1, Lote 3. Página oficial reaberta confirma DJ Santini, Luiz Marcelo e Matheus, DJ Vinny, open food e queima de fogos. O evento já constava no seed da PR #163; a fonte foi revalidada em 25/11 e o perfil do local permanece em draft. [Página oficial Sympla](https://www.sympla.com.br/evento/reveillon-vbq-2027/3660940)

### Revalidações e deduplicação

- **Deu Mó Love**, 27/11, 18h–04h, Contexto: página oficial reaberta; já consta no PR #163, sem novo registro. [Sympla](https://www.sympla.com.br/evento/deu-mo-love-27-11-varanda-do-contexto/3628685)
- **FeijoADA com Amor de Aluguel**, 28/11, 11h–04h, Contexto: página oficial reaberta; confirma feijoada R$ 59,90 e pagode com Amor de Aluguel; já consta no PR #163. [Sympla](https://www.sympla.com.br/evento/lgc/3626169)
- **Sábado Mágico**, 28/11, 11h–04h, foi reaberto. A página apresenta o mesmo dia, janela horária e local da FeijoADA; não foi criado segundo registro para evitar duplicação da mesma programação da varanda. [Sympla](https://www.sympla.com.br/evento/sabado-magico-28-11-varanda-contexto-bar/3626211)
- A varredura detalhada desta quarta utilizou 6 páginas de evento; não foi iniciada uma segunda varredura integral.

### Estado do banco de eventos

- `public.events`: **49 registros** — 45 `expired`, 3 `draft`, 1 `pending_review`; **0 eventos futuros publicados no Supabase**.
- Seed proposto na PR #163 após esta rodada: **37 registros** — 36 `published` e 1 `pending_review`. O Réveillon VBQ já existente permanece no seed, com fonte atualizada; não foi criado segundo evento.
- O evento Tchau e Bença/Sexta dos Cria permanece em revisão por divergência de título na página oficial; não foi promovido.

## Descoberta de estabelecimentos — Samambaia e Jardim Ingá

- **Refúgio Cozinha e Bar (Samambaia)**: página oficial de links confirma identidade, proposta temática, karaokê, música nacional/rock/flashback, WhatsApp e localização QN 508; o resultado do Google Business corrobora QN 508, CEP 72312-200 e telefone. Adicionado apenas como **draft**, sem Instagram porque o canal não foi confirmado na página oficial. [Página oficial de links](https://msha.ke/refugio/)
- **Saguari Gastro House (Samambaia)**: já existia como draft na PR #163; site oficial reaberto confirma endereço QS 310, Conjunto 5, Lote 7, funcionamento e contato. Check de fonte atualizado para 25/11. [Site oficial](https://www.saguarigastrohouse.com.br/)
- **Villa Butiquim/VBQ (Samambaia)**: já existia como draft; fonte do perfil foi atualizada para a página oficial do Réveillon VBQ 2027, mantendo o perfil fora do catálogo público.
- Duplicatas preservadas sem recriação no Jardim Ingá: Grill Espeto Bar, Pizzaria Opção 1 (Bar do Serginho), Quiosque Maranhense e Sushi Ingá Prime já aparecem como drafts no banco.
- Leads adicionais vistos em resultados locais — Mezha, Dom Muster, Ô Dalva, Potiguar Caldos, Espaço Gastronômico e Tô de Boa Petiscaria — permanecem **pendentes**, pois esta rodada não reuniu fonte própria/independente suficiente para preparar fichas com segurança.
- Nenhum perfil novo foi inserido diretamente no Supabase; o draft do Refúgio foi preparado somente no seed da PR.

## GitHub, CI e publicação

- Reutilizada a PR aberta **[#163](https://github.com/leonardodutrards-del/noite-df/pull/163)**; não foi criada PR adicional.
- Alterações preparadas: evento oficial Sábadô, atualização de fontes dos drafts Villa Butiquim/Saguari, novo draft Refúgio e testes de deduplicação/visibilidade.
- CI e Preview Vercel do novo commit devem ser conferidos antes de qualquer decisão. A PR permanece draft; **nenhum merge, deploy de produção ou publicação social** foi realizado.
- Nenhum estabelecimento foi contatado.

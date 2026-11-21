# Operação diária Noite DF — 21/11/2026

## Base, cobertura e checkpoint

- Estabelecimentos com `publication_status='published'`: **104** em **22 regiões**.
- Com pelo menos uma verificação de fonte nos últimos sete dias: **85/104**.
- Pendentes na rotação de sete dias: **19**. A cobertura é de fonte verificada, não uma auditoria manual integral de cada perfil.
- data_sources: **365**; agenda_source_checks: **511**.
- Verificações nas últimas 24 horas: **94** — 82 ok, 4 changed, 3 error, 2 http_error, 2 blocked e 1 baseline; os registros cobrem **45 estabelecimentos publicados distintos** em 16 regiões.
- Nesta revisão foram inseridas **17 fontes e 17 verificações** no Supabase: sete páginas de eventos confirmados, duas páginas de eventos pendentes, três fontes de estabelecimentos candidatos e cinco fontes de estabelecimentos publicados. Nenhum dado de conteúdo de estabelecimento ou evento foi alterado diretamente.

- Perfis publicados com agenda_url cadastrada: **30/104**; **74** sem agenda_url cadastrada.
- Estabelecimentos publicados sem qualquer fonte registrada: **2** — CB7 e Horus Eventus, ambos pendentes de descoberta/identidade.
- A tabela events do Supabase tem **3 eventos publicados futuros**: dois vinculados a estabelecimentos publicados e um vinculado a estabelecimento draft. Os 18 registros da seed da PR não foram inseridos diretamente na tabela events.

### Estabelecimentos publicados verificados nesta rodada

| Estabelecimento | Região | Evidência consultada |
|---|---|---|
| Bar Responsa | Asa Sul | Site oficial; endereço, horários, telefone e indicação de música ao vivo diária |
| Pança Cheia | Sobradinho | Comida di Buteco; endereço, telefone e horários |
| Oito Gastrobar | Sobradinho | Espelho público de publicações até 13/06/2026 e listagem de negócios; sem agenda recente |
| Bar do Buchada | Gama | Cadastro empresarial/CNPJ e endereço |
| Macaco Velho Chopp Bar | Águas Claras | Solutudo informa Rua 31 Sul Lote 9; resultado separado de Maps cita QS 5 e pode ser outra unidade — não consolidar sem confirmação |
| Telebar | Ceilândia | Cadastro empresarial ativo e endereço em Ceilândia Norte; sem agenda oficial recente |
| Bar do Galego | Guará | Listagem de negócio atualizada em 06/11/2026, endereço e telefone |
| Temporâneo (AABB) | Lago Sul | Sympla confirma uso em 23/10; AABB publicou encerramento da temporada em abril — manter como espaço sazonal, sem agenda futura confirmada |
| Moema Pizzaria — Planaltina | Planaltina | Solutudo/CNPJ ativo, atividade de restaurante, endereço e telefones; Instagram cadastrado ainda não acessado |
| Arena Mané Garrincha | Plano Piloto | Site oficial confirma complexo multiuso e endereço; agenda oficial mostra novos eventos em breve |
| SamamBar | Samambaia | Sympla confirma Réveillon 31/12/2026, 20h–06h, endereço e atrações |

Total desta revisão: **11 estabelecimentos** tiveram revisão de fonte individualizada. Também foi registrada uma fonte oficial de localização e canais para o Boteco da Madá.

### Regiões e perfis

- Os registros de verificação cobrem **16 regiões** nas últimas 24 horas: Águas Claras, Asa Norte, Asa Sul, Ceilândia, Gama, Guará, Lago Sul, Park Way, Planaltina, Plano Piloto, SAAN, Samambaia, SIG, Sobradinho, Sudoeste e Taguatinga.
- Oito perfis prioritários tiveram tentativa direta em 19/11: seis erros de fetch, um bloqueio por `robots.txt` e um HTTP 429. Não houve repetição idêntica hoje. Nenhum foi classificado como privado ou inexistente sem evidência.
- Oito tentativas não equivalem a oito perfis acessíveis; a classificação individual continua pendente.

### 19 estabelecimentos pendentes na rotação

Club 904; UK Music Hall; Circuito de Comitivas de Planaltina-GO; Bar do Chaguinha; Bar do Luis; Parque de Exposições Granja do Torto; Galpão 17; Chácara BWR; Pontão do Lago Sul; Bar do Batata; Vila Madalena; CB7; Fogão Goiano; Horus Eventus; Santa Aldeia Bar; Abençoado Bar; Bardot Music Bar; Fiel Bar e Distribuidora; SHOT Rock Bar.

Restrições de identidade/endereço:
- A busca por Bar do Chaguinha retornou um endereço QNM 22 Casa 04, diferente do QNM 22 Conjunto D Lote 4 registrado na base; não associar sem confirmação.
- A listagem encontrada para Bar do Luis corresponde a Gama, enquanto o registro Noite DF é Ceilândia; não associar.
- Macaco Velho tem fonte para QS 5, enquanto o cadastro também menciona Rua 31; revisar se são unidades distintas antes de alterar endereço.

## Eventos confirmados e preparados na PR #163

### Cinco novos eventos adicionados à seed

| Data e horário local | Evento | Local | Fonte |
|---|---|---|---|
| Sáb. 21/11, 15h30–02h (22/11) | Sambinha da Vila — transmissão Palmeiras x Flamengo | Minas Brasília Tênis Clube, Asa Norte | [Sympla](https://www.sympla.com.br/evento/lgc/3656482) |
| Sáb. 21/11, 17h–02h (22/11) | Butecada Sertaneja | New Mercadito Bar e Restaurante, Asa Sul | [Sympla](https://www.sympla.com.br/evento/butecada-sertaneja-21-11-new-mercadito/3660539) |
| Sáb. 21/11, 20h–03h (22/11) | Girls Just Wanna Have Rock N’ Fun — Arthemis + Liberty U | London Music Bar — Asa Sul | [Sympla](https://www.sympla.com.br/evento/sabado-21-11-girls-just-wanna-have-rock-n-fun-bandas-arthemis-liberty-u-arthemisrock-ba/3659947) |
| Dom. 22/11, 13h–23h30 | Choppada da Madá — Pagode do Leozinho | Boteco da Madá, Taguatinga | [Sympla](https://www.sympla.com.br/evento/lgc/3651776) |
| Sáb. 05/12, 20h–05h (06/12) | CURRAL — Surra de Modão (Edição Beira Lago) | Cais do Lago, Setor de Clubes Sul | [Sympla](https://www.sympla.com.br/evento/lgc/3653158) |

Detalhes relevantes:
- Sambinha da Vila: a página oficial confirma início às **15h30**, até 02h, e transmissão da partida às 16h. Uma listagem secundária anterior indicava 18h; prevalece a fonte oficial.
- Butecada Sertaneja: a página confirma data, horário e local, mas não lista artistas individuais.
- Girls Just Wanna Have Rock N’ Fun: abertura às 20h, shows a partir das 22h; Arthemis e Liberty U. A página informa entrada gratuita para mulheres durante a noite e valores específicos para homens.
- Choppada da Madá: Leozinho comanda a roda; o pagode começa às 18h. O texto acessível não informa preço.

### Revalidações e correções

- Sábadô no Oscarito: página oficial confirma 21/11, **18h–02h**, com DJ Primo, Boteco do Clima, Zé Felipe e Miguel e Banda Dexcomplica. Os valores no Supabase aparecem em UTC (21:00Z–05:00Z), equivalentes a 18h–02h em Brasília; não há divergência de horário.
- Sábado Mágico e Festa Toma no Contexto: páginas oficiais revalidadas; Festa Toma inclui Artur Campos no line-up e couvert VIP de R$15.
- Domingo do CPX e Conexão Delas: páginas oficiais revalidadas para 22/11.
- Bola, Samba e Feijão: página oficial revalidada, 21/11, 12h–23h, Estação Beira Lago; já existe na seed e não foi duplicado.
- London Music Bar — Águas Claras: página oficial revalidada para 21/11, 20h–03h, Utriu + BKD Guns.

### Eventos pendentes — não publicados

- **B DAY Sem Distinção / Arena P10**, 21/11: cabeçalho da Sympla indica 16h, descrição diz início às 17h.
- **Perto de Casa / P10**, 22/11: cabeçalho indica 15h–23h30; descrição informa abertura às 16h, gravação às 18h30 e encerramento às 22h30.
- **Festa de Interior / Piseiro Estilizado**: a página apresenta divergência entre Castelo Versailles e Palácio Ágape; local não confirmado.
- Nenhum evento foi cancelado ou expirado nesta rodada por falta de evidência.


### Oito eventos adicionais confirmados nesta revisão (21/11)

| Data e horário local | Evento | Local | Fonte |
|---|---|---|---|
| Sáb. 21/11, 16h–02h (22/11) | DVD Pagode do Béli — FLA x PAL | Orla do Clube de Engenharia — Pier 21, Lago Sul | [Sympla](https://www.sympla.com.br/evento/lgc/3657546) |
| Dom. 22/11, 18h–23h59 | Forró de Vitrola | A Casa de Jorge, SAAN | [Sympla](https://www.sympla.com.br/evento/forro-de-vitrola-22-de-novembro/3654904) |
| Sex. 27/11, 20h–03h (28/11) | Biu do Piseiro no Amsterdam | Amsterdam Bar, Santa Maria | [Sympla](https://www.sympla.com.br/evento/lgc/3644812) |
| Sex. 27/11, 20h–04h (28/11) | Sambinha Na Orla — PDJ + Caju Pra Baixo + Encontro de Batuqueiros | Clube de Engenharia, Lago Sul | [Sympla](https://www.sympla.com.br/evento/lgc/3649109) |
| Sex. 27/11, 22h–01h30 (28/11) | Samba do Povo da Rua | A Casa de Jorge, SAAN | [Sympla](https://www.sympla.com.br/evento/lgc/3658614) |
| Sáb. 28/11, 11h–04h (29/11) | FeijoADA com Amor de Aluguel | Contexto Bar, Setor de Clubes Sul | [Sympla](https://www.sympla.com.br/evento/feijoada-com-amor-de-aluguel-28-11-varanda-contexto-bar/3626169) |
| Sáb. 28/11, 20h–04h (29/11) | Tamborzão — FP do Trem Bala + DJ Zullu + Noobreak | Orla do Clube de Engenharia — Pier 21, Lago Sul | [Sympla](https://www.sympla.com.br/evento/fp-do-trem-bala-dj-zullu-noobreak-orla-do-pier-21-sabado-28-11/3653788) |
| Qui. 31/12, 20h–06h (01/01/2027) | Réveillon SamamBar 2027 — Leandro Lucca, Lia Almeida, DJ Salles e Grupo Moleque | SamamBar, Samambaia | [Sympla](https://www.sympla.com.br/evento/lgc/3652554) |

Observações:
- A Casa de Jorge foi incluída como perfil draft, com endereço SAAN Quadra 01, Lote 940, tipo bar, e fontes de eventos oficiais. SamamBar tem Réveillon confirmado para 31/12/2026, incluído na seed como evento futuro. A matéria de apresentação confirma a proposta de bar/restaurante, palco, programação musical e endereço; o rascunho não entra no catálogo público.
- Amsterdam Bar permanece em draft; o evento de 27/11 está confirmado na Sympla, mas o nome do produtor ainda aparece como Bahrein — Comida de Boteco. O local do evento está descrito como Amsterdam Bar, Santa Maria; não alterar identidade do estabelecimento sem revisão.
- A Sympla usa o nome Clube de Engenharia e endereço SCES Trecho 2, 32 para o Sambinha Na Orla, enquanto as páginas de Pagode do Béli e Tamborzão usam Orla do Clube de Engenharia — Pier 21, SCES Trecho 1, Lote 7. Mantidos como locais distintos no texto do evento; não criar nem fundir perfis até conciliar a diferença.
- SUB de FAVELA / Truvis Bar continua pendente: cabeçalho da Sympla indica 21h, mas o corpo mantém o campo de abertura como “[Inserir horário de abertura]”.
- DE RODA Á MODA / Dom Muster continua pendente: cabeçalho indica 14h, porém a localização publicada traz apenas “conjunto, 05”, sem endereço completo verificável.

## Novos candidatos de estabelecimento

- **New Mercadito Bar e Restaurante — Asa Sul:** identidade, tipo, endereço SHCS CLS 201/102 Sul e atividade atual corroborados por listagem pública recente e evento oficial. Perfil preparado como `draft`; sem Instagram/site oficial validado e sem agenda recorrente confirmada.
- **Minas Brasília Tênis Clube — Asa Norte:** site oficial confirma SCEN Trecho 03, Conjunto 06, telefone e espaços para eventos. O clube é normalmente restrito a sócios/convidados; o evento ticketado foi confirmado na Sympla. Perfil preparado como `draft` até revisão de aderência ao catálogo e acesso público.
- **London Music Bar — Asa Sul e Águas Claras:** dois perfis separados continuam como `draft`; fontes oficiais confirmam endereços e programação.
- **Estação Beira Lago:** a Sympla identifica o local e a produtora, com endereço entre AABR e ASEEL; perfil permanente continua pendente por falta de fonte própria independente.
- **Quintal da Tia Sandra:** site oficial indexado confirma funcionamento de terça a domingo, almoço a partir das 11h e música ao vivo semanal, no SIG Qd. 6 Rua L Lote 1515. A captura direta do site segue bloqueada e não há apresentação com data/horário específicos para 21–22/11.
- Ascade e Cápsula Bar continuam candidatos pendentes; nenhuma inserção foi feita no catálogo público.

## GitHub, testes e publicação

- PR **#163** permanece aberta e em `draft`: https://github.com/leonardodutrards-del/noite-df/pull/163
- A rodada atualiza seeds e testes; o CI do novo head ainda está em execução e o Preview Vercel ainda está na fila/construção.
- Produção continua no deployment READY anterior da `main`; esta rodada **não foi mergeada nem publicada em produção**.
- Os 23 novos registros de fontes/verificações foram gravados apenas nas tabelas operacionais `data_sources` e `agenda_source_checks`.
- Nenhum conteúdo de evento/estabelecimento foi gravado diretamente no Supabase. Nenhum post foi feito no Instagram/feed/Stories e nenhum estabelecimento foi contatado.

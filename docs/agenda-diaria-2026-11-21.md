# Operação diária Noite DF — 21/11/2026

## Base, cobertura e checkpoint

- Estabelecimentos com `publication_status='published'`: **104** em **22 regiões**.
- Com pelo menos uma verificação de fonte nos últimos sete dias: **80/104**.
- Pendentes na rotação de sete dias: **24**. A cobertura é de fonte verificada, não uma auditoria manual integral de cada perfil.
- `data_sources`: **341**; `agenda_source_checks`: **481**.
- Verificações nas últimas 24 horas: **65** — 55 `ok`, 4 `changed`, 3 `error`, 2 `http_error` e 1 `blocked`.
- Foram acrescentados **23 registros de fonte** e **23 registros de verificação** ao Supabase. Nenhum dado de conteúdo de estabelecimento ou evento foi alterado diretamente.

### Estabelecimentos publicados verificados nesta rodada

| Estabelecimento | Região | Evidência consultada |
|---|---|---|
| Bar Responsa | Asa Sul | Site oficial; endereço, horários, telefone e indicação de música ao vivo diária |
| Pança Cheia | Sobradinho | Comida di Buteco; endereço, telefone e horários |
| Oito Gastrobar | Sobradinho | Espelho público de publicações até 13/06/2026 e listagem de negócios; sem agenda recente |
| Bar do Buchada | Gama | Cadastro empresarial/CNPJ e endereço |
| Macaco Velho Chopp Bar | Águas Claras | Cadastro empresarial/CNPJ e endereço QS 5; o cadastro local também cita Rua 31, exigindo reconciliação de unidades |
| Telebar | Ceilândia | Cadastro empresarial ativo e endereço em Ceilândia Norte; sem agenda oficial recente |
| Bar do Galego | Guará | Listagem de negócio atualizada em 06/11/2026, endereço e telefone |

Também foi registrada uma fonte oficial de localização e canais para o Boteco da Madá.

### Regiões e perfis

- Auditoria de estabelecimentos nesta rodada: Asa Sul, Sobradinho, Gama, Águas Claras, Ceilândia e Guará.
- Fontes de eventos e locais também cobriram Taguatinga, Asa Norte, Setor de Clubes Sul, SAAN e SIG.
- Oito perfis prioritários tiveram tentativa direta em 19/11: seis erros de fetch, um bloqueio por `robots.txt` e um HTTP 429. Não houve repetição idêntica hoje. Nenhum foi classificado como privado ou inexistente sem evidência.
- Oito tentativas não equivalem a oito perfis acessíveis; a classificação individual continua pendente.

### 24 estabelecimentos pendentes na rotação

Club 904; UK Music Hall; Circuito de Comitivas de Planaltina-GO; Bar do Chaguinha; Bar do Luis; Parque de Exposições Granja do Torto; Galpão 17; Chácara BWR; Pontão do Lago Sul; Temporâneo (AABB); Bar do Batata; Moema Pizzaria — Planaltina; Vila Madalena; Arena Mané Garrincha; SamamBar; Arena P10; CB7; Fogão Goiano; Horus Eventus; Santa Aldeia Bar; Abençoado Bar; Bardot Music Bar; Fiel Bar e Distribuidora; SHOT Rock Bar.

Restrições de identidade/endereço:
- A busca por Bar do Chaguinha retornou um endereço QNM 22 Casa 04, diferente do QNM 22 Conjunto D Lote 4 registrado na base; não associar sem confirmação.
- A listagem encontrada para Bar do Luis corresponde a Gama, enquanto o registro Noite DF é Ceilândia; não associar.
- Macaco Velho tem fonte para QS 5, enquanto o cadastro também menciona Rua 31; revisar se são unidades distintas antes de alterar endereço.

## Eventos confirmados e preparados na PR #163

### Quatro novos eventos adicionados à seed

| Data e horário local | Evento | Local | Fonte |
|---|---|---|---|
| Sáb. 21/11, 15h30–02h (22/11) | Sambinha da Vila — transmissão Palmeiras x Flamengo | Minas Brasília Tênis Clube, Asa Norte | [Sympla](https://www.sympla.com.br/evento/lgc/3656482) |
| Sáb. 21/11, 17h–02h (22/11) | Butecada Sertaneja | New Mercadito Bar e Restaurante, Asa Sul | [Sympla](https://www.sympla.com.br/evento/butecada-sertaneja-21-11-new-mercadito/3660539) |
| Sáb. 21/11, 20h–03h (22/11) | Girls Just Wanna Have Rock N’ Fun — Arthemis + Liberty U | London Music Bar — Asa Sul | [Sympla](https://www.sympla.com.br/evento/sabado-21-11-girls-just-wanna-have-rock-n-fun-bandas-arthemis-liberty-u-arthemisrock-ba/3659947) |
| Dom. 22/11, 13h–23h30 | Choppada da Madá — Pagode do Leozinho | Boteco da Madá, Taguatinga | [Sympla](https://www.sympla.com.br/evento/lgc/3651776) |

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

## Novos candidatos de estabelecimento

- **New Mercadito Bar e Restaurante — Asa Sul:** identidade, tipo, endereço SHCS CLS 201/102 Sul e atividade atual corroborados por listagem pública recente e evento oficial. Perfil preparado como `draft`; sem Instagram/site oficial validado e sem agenda recorrente confirmada.
- **Minas Brasília Tênis Clube — Asa Norte:** site oficial confirma SCEN Trecho 03, Conjunto 06, telefone e espaços para eventos. O clube é normalmente restrito a sócios/convidados; o evento ticketado foi confirmado na Sympla. Perfil preparado como `draft` até revisão de aderência ao catálogo e acesso público.
- **London Music Bar — Asa Sul e Águas Claras:** dois perfis separados continuam como `draft`; fontes oficiais confirmam endereços e programação.
- **Estação Beira Lago:** a Sympla identifica o local e a produtora, com endereço entre AABR e ASEEL; perfil permanente continua pendente por falta de fonte própria independente.
- Ascade e Cápsula Bar continuam candidatos pendentes; nenhuma inserção foi feita no catálogo público.

## GitHub, testes e publicação

- PR **#163** permanece aberta e em `draft`: https://github.com/leonardodutrards-del/noite-df/pull/163
- A rodada atualiza seeds e testes; o CI do novo head ainda está em execução e o Preview Vercel ainda está na fila/construção.
- Produção continua no deployment READY anterior da `main`; esta rodada **não foi mergeada nem publicada em produção**.
- Os 23 novos registros de fontes/verificações foram gravados apenas nas tabelas operacionais `data_sources` e `agenda_source_checks`.
- Nenhum conteúdo de evento/estabelecimento foi gravado diretamente no Supabase. Nenhum post foi feito no Instagram/feed/Stories e nenhum estabelecimento foi contatado.

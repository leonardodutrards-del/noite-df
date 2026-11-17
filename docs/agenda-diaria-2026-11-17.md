# Operação diária de cobertura e agenda — 17/11/2026

**Verificação:** terça-feira, 17/11/2026, manhã (Brasília).  
**Escopo:** Brasília/DF e Entorno.  
**Status desta rodada:** duas novas entradas de evento e duas correções preparadas em branch/PR. Nenhuma alteração de evento ou estabelecimento foi gravada diretamente nas tabelas de conteúdo do Supabase. Foram gravados somente registros operacionais em `agenda_source_checks`.

## 1. Resumo executivo

- **104 estabelecimentos publicados** carregados do Supabase, distribuídos em **22 regiões**.
- **287 fontes** registradas em `data_sources`; 56 têm histórico de verificação. **21 fontes distintas tiveram verificação registrada hoje**: 8 `ok`, 3 `changed`, 1 `blocked` e 9 `error`. Foram gravadas 24 linhas de verificação no dia porque três fontes alteradas receberam uma segunda nota após revisão manual.
- A base contém **32 registros de Instagram de 32 estabelecimentos, em 30 URLs distintas**; 72 estabelecimentos publicados não têm URL de Instagram cadastrada. O último status dos 32 registros de Instagram permanece `error`, sem classificação confiável de perfil público/privado.
- **Nove perfis prioritários** foram tentados diretamente nesta rodada (Rancho do Vaqueiro, Eita Lounge Bar, P10 Gastrobar, Palahop, Complexo Fora do Eixo, Oscarito, Galpão Zero 8, Narguimania e Decky Bar). Todos retornaram `DisabledError` na ferramenta de navegação. Isso não prova que os perfis estejam privados, inexistentes ou bloqueados; nenhum conteúdo foi considerado visualizado.
- No snapshot consultado às 08h41, a agenda pública anterior mostrava **42 eventos semanais** e **55 em novembro**. Após a virada da janela semanal e o deploy da PR #156, o crawler externo devolveu **41 semanais** e **54 em novembro**, ainda com título/horário antigos; esse retorno foi tratado como snapshot possivelmente desatualizado, não como confirmação final de propagação. A PR #155, já mergeada, publicou a seed com 74 eventos confirmados no intervalo de 16/11/2026 a 16/01/2027.
- A tabela `events` do Supabase tem 25 eventos publicados, mas apenas 1 com início futuro. A agenda pública atual usa também a seed local/fallback. Essa diferença foi registrada; nenhum evento foi inserido diretamente na tabela de produção.
- **Dois eventos novos** e **duas correções de conteúdo** foram preparados neste branch. Não houve cancelamento confirmado nesta rodada.

## 2. Base publicada e cobertura regional

Todos os 104 registros com `publication_status='published'` foram carregados. Distribuição por região:

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

A carga da base foi integral; a auditoria manual de fontes não foi integral. Dos 287 registros de fonte, 56 têm histórico de verificação, e 21 fontes distintas tiveram status atualizado hoje. Não foi identificada uma tabela dedicada a checkpoint por lote; o registro durável disponível é `agenda_source_checks`. As demais fontes/estabelecimentos permanecem na rotação pendente, sem declarar cobertura total.

## 3. Instagram e fontes

### Instagram

- 32 registros de fonte para 32 estabelecimentos e 30 URLs distintas.
- 72 estabelecimentos publicados sem URL de Instagram cadastrada.
- Nove URLs prioritárias foram tentadas diretamente hoje; todas falharam com `DisabledError` da ferramenta de navegação.
- Nenhuma conta foi classificada como privada, inexistente ou pública/bloqueada sem evidência. Não houve tentativa de contornar login, CAPTCHA ou controles da plataforma.
- As nove tentativas foram registradas em `agenda_source_checks` com a URL vinculada ao registro de origem e nota explícita sobre a limitação.

### Outras fontes verificadas hoje

- **Na Banca:** revisão manual do site/cardápio após detecção de mudança. O conteúdo acessível mostra cardápio e happy hour, sem agenda datada.
- **Savassi Carne de Sol — Guará e Valparaíso:** revisão manual do site institucional e dos links de cardápio das duas unidades. Não há agenda datada ou evento futuro no conteúdo consultado.
- **Quintal da Tia Sandra:** o site oficial retornou redirecionamento não autorizado/timeout. A fonte permanece bloqueada; não se concluiu que o local esteja fechado nem que o Instagram seja privado.
- O registro operacional foi atualizado com as três revisões manuais e a limitação do Quintal foi mantida.

## 4. Eventos confirmados e correções preparadas

### Novos eventos

| Data | Evento | Horário | Local | Fonte |
|---|---|---|---|---|
| 20/11/2026 | Negra Arte Cultura — Consciência Negra 2026: Resistência, Festa e Liberdade | 12h–01h30 (21/11) | Babylon Delicatessen, Samambaia Sul | [Sympla](https://www.sympla.com.br/evento/lgc/3640226) |
| 21/11/2026 | Noite na Skina | 18h–01h (22/11) | Skinão Petiscaria, AR 07, Conjunto 1, Sobradinho II | [Sympla](https://www.sympla.com.br/evento/lgc/3616254) |

**Babylon:** a página oficial do evento confirma data, início, encerramento, endereço e lotes de R$ 60, R$ 80 e R$ 100. O site oficial da casa ainda declara fase de pré-abertura e finalização da cozinha/estrutura. O evento foi preparado na agenda, mas **nenhum perfil comercial foi criado ou publicado** até confirmar a operação regular do estabelecimento. [Site oficial Babylon](https://www.babylonbsb.com.br/)

**Skinão Petiscaria:** a página oficial da Sympla confirma evento, data, horário e nome do local, mas não apresenta atrações ou preço no conteúdo acessível. A busca empresarial não encontrou correspondência inequívoca; o resultado semelhante foi “Skinão do Peixe”, em São Sebastião, com endereço diferente. O evento foi preparado com a fonte da Sympla, mas o perfil do estabelecimento permanece candidato pendente e não foi criado.

### Correções de eventos já publicados

1. **Contexto, 18/11:** a página oficial Sympla de ID 3626362 agora identifica o evento como “A Sertajenada convida + Cardápio em Dobro”, com A Sertanejada, Juliana Fer e participações de Lucas e Barbara. O início às 18h e o encerramento às 02h permanecem. A seed foi corrigida e a fonte foi atualizada para a URL canônica. [Sympla](https://www.sympla.com.br/evento/a-sertajenada-convida-cardapio-em-dobro-18-11-varanda-do-contexto/3626362)
2. **Festa Toma — Contexto, 21/11:** a página oficial informa encerramento às **09h de 22/11**, não às 06h. Também foi acrescentado o line-up publicado: K2, Samon Pessoa, Wendel Silva, Manu Soares, Ana Ximenes, NitroX, Arthur Lopes, 3 Tenores, Madru, Edson Sales e Johnzin. O couvert de R$ 15 para convites VIP foi mantido. [Sympla](https://www.sympla.com.br/evento/lgc/3642351)

### Revalidações e pendências

- **Corona Day no Osca — 21/11, 09h–15h** e **Sábadô no Oscarito — 21/11, 18h–02h** são sessões distintas no mesmo dia; ambas já constam da seed pública e não foram duplicadas. [Corona Day](https://www.sympla.com.br/evento/corona-day-no-osca/3655656) · [Sábadô](https://www.sympla.com.br/evento/sabado-no-oscarito/3655652)
- **Clube Country + Cardápio em Dobro — 18/11:** outra página Sympla do mesmo organizador, local e horário da A Sertajenada, mas sem line-up ou distinção operacional clara. Mantida pendente para evitar duplicidade. [Sympla](https://www.sympla.com.br/evento/clube-country-cardapio-em-dobro-na-varanda-do-contexto-18-11/3630412)
- **B DAY Sem Distinção — Arena P10, 21/11:** o cabeçalho informa 16h e a descrição diz início às 17h. Mantido pendente por conflito de horário. [Sympla](https://www.sympla.com.br/evento/lgc/3650152)
- **IN DA CLUB — 20/11:** permanece pendente por divergência de início entre páginas oficiais (20h e 21h).
- **Pagodão das Estrelas — 20/11:** permanece pendente por divergência entre “Bahrein Comida de Boteco” e “Amsterdã (antigo Bahrein)” na descrição/local.
- **Sábado Mágico — Contexto, 21/11:** mantido com início às 11h, conforme cabeçalho oficial; a menção às 12h refere-se à feijoada/happy hour.
- **Telebar:** a única página localizada nesta busca é o evento de 15/11, já encerrado. Não foi promovido como agenda futura.
- Não foi localizado flyer oficial atual confirmando Rota do Piseiro no Bar LG. Rota do Piseiro e Bar LG/Espaço LG não aparecem como estabelecimentos publicados na base; nenhum evento foi atribuído a eles.
- Galpão dos Brutos permanece sem programação atual, conforme orientação do usuário. Não foi confundido com Rota do Piseiro/Bar LG.

## 5. Novos estabelecimentos e candidatos

- **Babylon Delicatessen (Samambaia Sul):** site oficial, endereço e evento Sympla identificados; a própria casa informa pré-abertura e finalização da estrutura. Candidato pendente de confirmação de funcionamento regular; sem perfil criado.
- **Skinão Petiscaria (Sobradinho II):** identificada em página de evento, mas sem correspondência empresarial independente inequívoca. Candidato pendente; sem perfil criado.
- **Texxas Bar, Estação Beira Lago e Arena Dose Dupla:** permanecem como rascunhos já existentes no repositório, fora do catálogo publicado. A busca empresarial por “Estação Beira Lago” retornou um estacionamento no SCEN, não uma confirmação independente do espaço de eventos; manter pendente.
- Nenhum novo estabelecimento foi inserido no Supabase ou publicado.

## 6. Prioridades e lacunas

Entre as prioridades consultadas, 16 são estabelecimentos publicados na base: Rancho do Vaqueiro, Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar, Palahop, Complexo Fora do Eixo, Oscarito Brasília, Contexto Bar, Quintal da Tia Sandra, Galpão dos Brutos, Galpão Zero 8, Narguimania, Decky Bar, Bar Stilo 10, Arena P10 e Telebar. Surra de Modão é acompanhado como atração/projeto musical, não como estabelecimento.

Não foi localizada programação futura oficial nova, acessível e suficientemente completa para Rancho do Vaqueiro, Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar, Palahop, Galpão Zero 8, Narguimania, Decky Bar e Bar Stilo 10. Para Arena P10 há o B DAY pendente por horário conflitante; para Telebar, somente o evento encerrado de 15/11. Isso significa “nenhuma agenda publicável encontrada nas fontes acessíveis nesta rodada”, não prova de que não haverá evento.

## 7. GitHub, testes e publicação

- **Branch original:** `agenda/2026-11-17-daily-coverage`; **PR #156** foi mergeada em 17/11/2026 às 11:59 UTC, commit `7efab8efad863dbf68592ccecd90ca35aab05e32`.
- Arquivos da PR #156: atualização de `data/seeds/events-2026-11-15.ts`, novo `data/seeds/events-2026-11-17.ts`, inclusão do lote em `data/seeds/events.ts), dois testes e este relatório.
- **Validação da PR #156:** CI #611 concluiu com testes, lint e build aprovados; Vercel Preview ficou **READY**. A implantação de produção do commit `7efab8efad863dbf68592ccecd90ca35aab05e32` também ficou **READY**.
- **Verificação pós-deploy:** a leitura externa da página pública ainda devolveu um snapshot antigo (41 eventos e o título/horário anteriores). Ao revisar `getPublicAgenda()`, foi identificado que o ramo usado quando Supabase está configurado acrescentava explicitamente seeds somente até 15/11; o lote de 17/11 estava ausente desse ramo. Por isso, os dois novos eventos ainda não podiam aparecer nesse caminho, apesar de o build/preview estarem prontos.
- **Correção complementar — PR #157:** [fix: incluir agenda de 17/11 com Supabase ativo](https://github.com/leonardodutrards-del/noite-df/pull/157). O branch `agenda/2026-11-17-db-enabled-feed` adiciona `confirmedEventsNovember17` ao fallback local usado com Supabase ativo e inclui teste de regressão para o ramo de produção. CI #613 concluiu com testes, lint e build aprovados; Vercel Preview ficou **READY**. No momento deste registro, a merge/publicação de #157 ainda estava pendente.
- Nenhuma alteração de conteúdo foi gravada diretamente nas tabelas de eventos ou estabelecimentos do Supabase; somente registros operacionais de verificação em `agenda_source_checks`. Nenhum post foi feito nas redes sociais e nenhum estabelecimento foi contatado.

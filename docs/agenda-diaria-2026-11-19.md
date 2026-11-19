# Operação diária Noite DF — 19/11/2026

## Resumo executivo

- Base Supabase: **104 estabelecimentos publicados**, distribuídos em **22 regiões**, com **288 fontes** cadastradas.
- Nesta rodada: **18 estabelecimentos verificados**, em **10 regiões**, por meio de **20 fontes**. A cobertura é parcial; **86 estabelecimentos** ainda não foram verificados nesta rodada e permanecem na rotação.
- Foram registrados 8 novos resultados de tentativa direta de Instagram em `agenda_source_checks`; não houve classificação indevida de perfis como privados ou inexistentes.
- Agenda pública: a página de fim de semana respondeu HTTP 200 e apresentou **30 eventos de 20 a 22/11**. A agenda mensal apresentou **54 eventos confirmados ainda válidos em novembro** e **41 em destaque na semana atual**.
- Duas divergências em páginas oficiais da Sympla foram corrigidas na seed editorial: horário/line-up da MOLHADÊRA e encerramento/line-up da Festa Toma.
- Nenhum estabelecimento novo foi publicado. Nenhum evento foi gravado diretamente na tabela de conteúdo do Supabase.

## 1. Base e cobertura

### Cobertura desta rodada

Os 18 estabelecimentos verificados estão distribuídos nas seguintes regiões:

- Asa Norte: 2
- Asa Sul: 3
- Guará: 1
- Planaltina: 2
- SAAN: 1
- Setor de Clubes Sul: 1
- SIG: 2
- Sobradinho: 4
- Sudoeste: 1
- Taguatinga: 1

Resultado agregado das 20 verificações de fonte registradas hoje:

| Resultado | Fontes |
|---|---:|
| OK | 4 |
| Alterado — requer conferência manual | 4 |
| Bloqueado | 1 |
| Erro HTTP | 2 |
| Erro de acesso/fetch | 9 |
| **Total** | **20** |

A rotação não concluiu auditoria integral dos 104 estabelecimentos. Não foi localizada tabela dedicada de checkpoints; o histórico de tentativas foi registrado em `agenda_source_checks`, e este relatório documenta os lotes concluídos e pendentes.

### Instagram prioritário

Tentativas diretas em 19/11 para:

- Rancho do Vaqueiro — `@ranchodovaqueirobsb`
- Eita Lounge Bar — `@eitaloungebar`
- P10 Gastrobar — `@p10gastrobar`
- Palahop — `@palahopoficial`
- Complexo Fora do Eixo — `@complexoforadoeixo`
- Contexto Bar — `@contextobar`
- Oscarito Brasília — `@oscaritobrasilia`
- Galpão dos Brutos — `@osbrutosdopiseiro1`

Resultado: 6 falhas de acesso/DisabledError, 1 bloqueio explícito por robots.txt e 1 resposta HTTP 429. Nenhum conteúdo de perfil foi acessado; esses resultados **não comprovam** que os perfis sejam privados ou inexistentes. As tentativas foram registradas com URL, data e evidência técnica.

Na base, 31 estabelecimentos publicados têm URL preenchida no campo Instagram; há 32 entidades com fonte oficial de Instagram em 30 URLs distintas. Outros 73 estabelecimentos não têm URL no campo Instagram. Há 47 com site e 30 com agenda_url.

### Lacunas prioritárias

- **Oito Gastrobar** está publicado em Sobradinho, mas não tem Instagram, site ou agenda_url cadastrados. O agregador público consultado mostra publicações até junho de 2026; não foi encontrado anúncio oficial atual suficiente para cadastrar programação.
- **Rota do Piseiro** não foi localizada como estabelecimento publicado na base nem teve flyer/post oficial atual acessível nesta rodada. Nenhuma programação foi atribuída ao Bar LG.
- **Galpão dos Brutos** continua sem evento confirmado. Respeitada a informação do responsável pelo Noite DF de que o local está parado; não foi associado à Rota do Piseiro nem ao Bar LG.
- As páginas de agenda de **Cápsula Bar** e as matérias sobre **Primo Pobre** ajudaram a descobrir candidatos, mas não foi obtida confirmação oficial acessível da programação de 19–22/11. Nenhum evento foi criado a partir apenas de matéria secundária e nenhum perfil novo foi publicado.

## 2. Eventos e correções

### Correções verificadas em fonte oficial

**MOLHADÊRA + Feriado — Complexo Fora do Eixo, sexta-feira 20/11**

- A seed anterior informava início às 18h e incluía Pagode do Edu.
- A página oficial da Sympla informa abertura às **21h**, encerramento às **05h de 21/11**, e line-up com Gustavo Machado 98, Matteo, Sanchez, Nyka e Kaca.
- A seed foi corrigida para 21h–05h, removendo a atração não confirmada.
- Fonte: https://www.sympla.com.br/evento/molhadera-feriado-20-de-novembro/3652518

**Festa Toma — Edição Agrobaile — Contexto Bar, sábado 21/11**

- A seed anterior informava encerramento às 09h de domingo.
- A página oficial da Sympla informa **21h–06h de 22/11** e inclui Artur Campos no line-up.
- A seed foi corrigida para 21h–06h e o line-up foi atualizado.
- Fonte: https://www.sympla.com.br/evento/lgc/3642351

Ambas as fontes foram verificadas em 19/11; os registros agora usam `verifiedAt: 2026-11-19`.

### Outras páginas oficiais revalidadas

- Nu Metal Festival — Galpão 17, 19/11, 20h–02h: https://www.sympla.com.br/evento/nu-metal-festival-galpao-17/3563513
- Quinta do CPX — Complexo Fora do Eixo, 19/11, 21h–05h: https://www.sympla.com.br/evento/quinta-do-cpx-19-11-pre-feriado/3652478
- We The Funk — Contexto Bar, 19/11, 21h–04h: https://www.sympla.com.br/evento/lgc/3625200
- Deu Mó Love — Contexto Bar, 20/11, 18h–04h: https://www.sympla.com.br/evento/deu-mo-love-20-11-varanda-do-contexto/3628682
- Noite na Skina — Skinão Petiscaria, 21/11, 18h–01h: https://www.sympla.com.br/evento/lgc/3616254
- Marília Tavares no Amsterdam, 21/11, 20h–03h: https://www.sympla.com.br/evento/lgc/3642490

O Nu Metal Festival já constava da seed pública e não foi duplicado.

### Pendência: Porks Sobradinho

O evento **Almost Unplugged**, previsto para 20/11 às 21h, continua visível na página pública do Noite DF. A fonte oficial do Porks havia mudado na verificação de 17/11 e já não apresentava esse anúncio; nesta rodada, o site oficial não expôs conteúdo legível para confirmar a programação atual. Como ausência na página não comprova cancelamento, o evento não foi removido automaticamente. Manter pendente de confirmação.

### Supabase e agenda pública

- Tabela `events`: 31 registros publicados; 7 com início futuro.
- Três dos sete eventos futuros estão vinculados ao **Vikings Pub Brasília**, cujo estabelecimento está em `draft`; por isso, a projeção editorial pública os exclui corretamente até a publicação do estabelecimento.
- Quatro eventos futuros estão vinculados a estabelecimentos publicados (três no Oscarito e um na Arena Adega dos Amigos).
- A página pública de fim de semana apresenta 30 eventos para 20–22/11. A agenda mensal apresenta 54 eventos válidos em novembro e 41 na janela da semana atual.

## 3. GitHub, validação e publicação

- Branch de trabalho: `agenda/2026-11-19-sympla-corrections`.
- Arquivos alterados: `data/seeds/events-2026-11-15.ts`, `tests/agenda-seed-2026-11-15.test.ts` e `tests/agenda-seed-2026-11-17.test.ts`.
- Foram acrescentados testes para impedir regressão do horário/line-up da MOLHADÊRA e da Festa Toma.
- As alterações estão preparadas para revisão em PR; CI, lint, build e Vercel Preview precisam ser confirmados antes de merge/publicação.
- Produção antes desta correção: commit `21dbbcf52c75cc6d071d6111254bf623b80eea60`, deployment Vercel **READY**. A página pública de fim de semana respondeu HTTP 200.
- PR #158 permanece aberto e não foi incorporado: Hop Capital está como draft; Xique Xique continua com complemento de endereço divergente e precisa de confirmação. CI #618 está aprovado e o Preview está READY, mas a pendência editorial impede publicação do perfil.

Nenhum post foi feito nas redes sociais e nenhum estabelecimento foi contatado. Nenhuma tabela de conteúdo de eventos ou estabelecimentos do Supabase foi alterada diretamente; apenas os registros operacionais de verificação de fontes foram acrescentados a `agenda_source_checks`.

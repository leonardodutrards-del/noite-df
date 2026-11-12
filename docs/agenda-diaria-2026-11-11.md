# Cobertura diária Noite DF — 11/11/2026

Horário de referência: Brasília, America/Sao_Paulo. Rodada reforçada de quarta-feira, com foco em flyers de quinta a domingo e início da semana seguinte.

## 1. Base consultada

- Estabelecimentos com `publication_status='published'` carregados do Supabase: **104**.
- Regiões distintas no banco: **22** — Águas Claras, Asa Norte, Asa Sul, Brasilinha · Entorno, Ceilândia, Cidade Ocidental · Entorno, Gama, Granja do Torto, Guará, Jardim Ingá · Entorno, Lago Sul, Park Way, Planaltina, Plano Piloto, SAAN, Samambaia, Setor de Clubes Sul, SIG, Sobradinho, Sudoeste, Taguatinga e Valparaíso · Entorno.
- Perfis com campo Instagram preenchido: **31**; URLs distintas: **29**.
- Perfis sem campo Instagram cadastrado: **73**.
- Foram criados/regularizados 31 registros de fonte e checagem em `data_sources` / `agenda_source_checks`; um Instagram já presente no perfil IVV Swinebar não tinha registro correspondente em `data_sources`, e esse registro foi acrescentado.

### Resultado da verificação de Instagram

Foram tentadas as 29 URLs distintas cadastradas, sem login e sem contornar bloqueios:

| Classificação observável | Quantidade |
|---|---:|
| Público e acessível sem login | 0 |
| Bloqueio/limitação explícita da ferramenta | 6 URLs (4 retornaram HTTP 429; 2 negadas por robots.txt) |
| Erro de fetch/cache miss, sem status público/privado determinável | 22 URLs |
| URL que aponta para Reel, não para perfil; identidade não confirmada | 1 URL |
| Privado confirmado | 0 |
| Inexistente confirmado | 0 |

O Supabase recebeu **31 registros de checagem**: 6 `blocked` e 25 `error`. As 25 linhas de erro correspondem a 23 URLs distintas, pois duas URLs são compartilhadas por mais de um perfil/unidade. Os erros não permitem concluir que um perfil seja privado ou inexistente.

Perfis prioritários tentados: Rancho do Vaqueiro, Eita Lounge Bar, P10 Gastrobar, Palahop, Complexo Fora do Eixo, Oscarito Brasília, Contexto Bar e Restaurante, Galpão Zero 8, Narguimania, Bar Stilo 10, Decky Bar, Pipa Drinks, Godofredo 408, IVV Swinebar, Birosca do Conic, Arena Adega, Trends Pub, Bendito Bar, Figueiredo Cozinha e Bar, Brasileirinho, Chopp Brasília Bier, Clube 27, Galpão dos Brutos/Os Brutos do Piseiro, Palorama, Bar do Assis, Boteco da Madá e Bahrein Cozinha e Bar, entre os demais perfis cadastrados.

## 2. Rodada reforçada de quarta-feira — agenda

A agenda editorial existente na branch principal contém **35 eventos confirmados** para a janela de 09 a 16/11/2026, provenientes das rodadas anteriores e das fontes oficiais já registradas. Esta rodada não alterou nem expirou eventos existentes.

### Novo evento confirmado e preparado no PR

- **Pagodão das Estrelas** — sexta-feira, **20/11/2026, 15h–01h**.
- Local indicado na página: **Amsterdã (antigo Bahrein)**; o cabeçalho da Sympla também exibe “Bahrein Comida de Boteco”. Endereço descrito: Setor Hortigranjeiro, Chácara 12, km 1/2, Brasília/DF.
- Atrações anunciadas: Jean Mussa, Nossa Cor, Papel Marchê, Forte Atração, Jaque, Gabriel Vizy, Nosso Rolê, Lucas Alves, Clara Muniz, Leozinho, Daniel Pinheiro, Marcelo B1 e DJ Geovanna.
- Estilo: pagodão, conforme o título do evento.
- Preço: não informado no conteúdo oficial consultado.
- Fonte oficial: [Sympla — Pagodão das Estrelas](https://www.sympla.com.br/evento/pagodao-das-estrelas/3637448).
- **Cuidado de deduplicação:** não associar este evento ao perfil “Bahrein Cozinha e Bar” de Valparaíso; o endereço do evento é outro. A identidade cadastral de Amsterdã/Bahrein no Setor Hortigranjeiro permanece pendente e não foi criada como perfil público.

### Itens pendentes — não publicados

1. **Corona Day no Osca**, Oscarito Brasília, 14/11, 09h–16h: o resultado indexado da página oficial Sympla informa DJ, sambinha ao vivo e atividades esportivas; a abertura direta da página retornou cache miss. Manter pendente até a página oficial ser acessível e os detalhes serem reconferidos. [Sympla — Corona Day no Osca](https://www.sympla.com.br/evento/corona-day-no-osca/3648831).
2. **Terapia Sertaneja + Cardápio em Dobro**, Contexto, 11/11: existe outra página Sympla para o mesmo horário, local e produtor da edição já cadastrada como Surra de Modão. Como os dois anúncios podem ser duplicatas/nomes alternativos e não há confirmação independente da organização, manter somente o evento já confirmado e deixar a segunda listagem pendente. [Sympla — Terapia Sertaneja](https://www.sympla.com.br/evento/terapia-sertaneja-cardapio-em-dobro/3630407).
3. **Quarta Delas com Alan Morais**, Quintal da Tia Sandra, 11/11: apareceu apenas em fonte secundária; não foi localizada página oficial de ingresso ou confirmação datada no canal oficial. Pendente.
4. **Ressaca do Jorem**, Luziânia, 14/11: fonte secundária aponta o Palácio de Versailles, mas a página de ingresso indicada não abriu e o horário de início não pôde ser confirmado. Pendente. [Cheers — Ressaca do Jorem](https://cheers.com.br/evento/ressaca-do-jorem-38204).

### Agenda prioritária — situação desta rodada

- **Contexto Bar e Restaurante:** 11/11 Surra de Modão + Cardápio em Dobro; 12/11 We The Funk; 13/11 Deu Mó Love; 14/11 Sábado Mágico — páginas oficiais Sympla já registradas no seed de 10/11. A listagem paralela “Terapia Sertaneja” ficou pendente por possível duplicidade.
- **Complexo Fora do Eixo:** Festa do Pisa (13/11) e Toca da Bruxa (14/11), páginas oficiais Sympla já registradas.
- **Oscarito Brasília:** Sábadô no Oscarito (14/11) confirmado; Corona Day (14/11) pendente por cache miss na página oficial.
- **Telebar:** Os Meninos de Barão (15/11), página oficial Sympla já registrada.
- **Rancho do Vaqueiro:** nenhuma agenda nova datada confirmada nesta rodada.
- **Rota do Piseiro / Bar LG Sobradinho:** não foi localizado perfil oficial inequívoco da Rota do Piseiro nem flyer atual que associe a programação ao Bar LG. Não associar ao Galpão dos Brutos. Bar LG/Espaço LG não consta como perfil publicado no banco.
- **Galpão dos Brutos / Os Brutos do Piseiro:** respeitada a informação do usuário de que o espaço está parado; não foi tratado como local de programação atual e não foi despublicado.
- **Eita Lounge Bar, Oito Gastrobar, P10 Gastrobar, Palahop, Quintal da Tia Sandra, Galpão Zero 8, Narguimania, Decky Bar, Bar Stilo 10 e Arena P10:** nenhuma agenda nova completa e confirmada em fonte oficial nesta rodada. A falta de post acessível não foi tratada como prova de encerramento.
- **Arena P10 e P10 Gastrobar:** mantidos como registros distintos; nenhuma fusão automática.

## 3. Descoberta de estabelecimentos

Foram feitos cruzamentos por nome, slug e telefone no Supabase antes de preparar candidatos. Não houve correspondência de nome/slug/telefone para os 33 candidatos abaixo. Duas correspondências parciais por endereço foram revisadas e descartadas como falsos positivos. Os candidatos foram adicionados **somente como rascunhos** no repositório, com `verified=false`, `publicationStatus='draft'`, fontes e data de coleta; o filtro existente em `data/seeds/places.ts` os mantém fora da lista pública.

### 33 rascunhos preparados

- **Asa Norte:** Aflora Bar — Gastrobar Vegano; Vasto Restaurante — Brasília Shopping; Cápsula Bar.
- **Asa Sul:** Gran Monumental Restaurante & Gastrobar.
- **Guará:** Lampião Gastrobar; Moinho 21.
- **Sobradinho:** Dorin Bar; Guarabira Bar e Depósito; Lounge Chopperia; Empório Cozinha Pizza & Bar; Puhl's Bier; Tsunagari; Kojii Sushi; Shelter Food; Bodega do Mestre; Quintal da Jeeh; La Casita Hamburgueria; Tradição Mineira.
- **Gama:** Quiosque JC.
- **Samambaia:** VBQ Samambaia (Villa Butiquim); Bar do Peixe do Seu Raimundo; Dom Muster Cozinha & Bar.
- **Ceilândia:** Beer House; Baronny Fest Beer; Primo Cozinha Bar Ceilândia; Bar Brasileiro — Cozinha e Bar.
- **Planaltina/DF:** Alcatraz Pub; QuinTaL — Porções & Petiscos; Espaço Maria Morena.
- **Planaltina/GO e Entorno:** D'Hookah Lounge; Butiquim da Villa; 013 GastroBar; Canto Brasileiro — Restaurante Lagoa Bar.

Fontes principais usadas nos rascunhos: [Linktree Aflora](https://linktr.ee/aflora.gastrobar), [Brasília Shopping — Vasto](https://brasiliashopping.com.br/lojas/vasto-restaurante/), [site Lampião Gastrobar](https://lampiao-gastrobar.cluvi.com.br/), [site Empório Cozinha & Bar](https://emporiocozinhaebar.com.br/pizzas/), [Linktree Tsunagari](https://linktr.ee/tsunagarioficial), [site Kojii Sushi](https://kojii.com.br/), [matéria de inauguração do Cápsula Bar](https://www.brasiliacomercio.com.br/capsula-bar-inaugura-espaco-as-margens-do-lago-paranoa/) e listagens Google Business individuais, com links de busca e endereço registrados em `data/seeds/places-2026-11-11.ts`.

### Candidatos adicionais mantidos pendentes

- **Santo Butiquim:** o resultado de negócios rotula “Park Way”, mas o endereço apresentado é Núcleo Bandeirante; região precisa de reconciliação.
- **Buteco do Guima:** categoria pública encontrada como condomínio, não como bar; identidade/tipo não confirmados.
- **Innôva Café:** Linktree localizado, mas endereço exato ainda não confirmado.
- **Armazém 21:** Linktree localizado em Gama, mas endereço exato ainda não confirmado.
- **Santa Monica Gastrobar:** notícia antiga de inauguração, sem fonte oficial atual que confirme operação.
- **Botiquim do XIII** e **Dom Valentim Cozinha e Bar:** dados públicos com endereço incompleto; não criar perfil.
- **Espaço LG/Bar LG Sobradinho:** sem perfil inequívoco no banco ou fonte oficial atual.
- **Rota do Piseiro:** identidade oficial não confirmada; não criar perfil de promoter/artista como estabelecimento.

## 4. Estado técnico, publicação e bloqueios

- Branch preparada: `agenda/2026-11-11-daily-coverage`.
- Alterações: 1 evento novo confirmado (20/11), 33 perfis em rascunho, teste de deduplicação/publicação e este relatório.
- **Nenhum merge foi feito. Nenhuma alteração de evento ou estabelecimento foi gravada diretamente nas tabelas de produção do Supabase.** Somente os registros operacionais de checagem de fontes do Instagram foram atualizados.
- A branch principal tem 35 eventos editoriais para 09–16/11, mas a produção não reflete esse conjunto completo.
- Último deployment de produção consultado: `READY` no commit `3e618883d2a373430da8e343c9981d75831412f4`.
- O commit principal mais recente consultado, `5fad2e162b904fa6851e1177a4d4a5930259d497`, está sem deployment de produção posterior; o status Vercel retornou **FAILURE por limite de builds**. Portanto, o deployment READY é anterior ao último merge e não comprova que a versão atual esteja publicada.
- Verificação pública: `/agenda-semanal` mostra apenas 4 eventos, `/agenda-mensal` mostra 6, e `/fim-de-semana` ainda apresenta 16–18/10/2026. Isso é uma divergência de produção a corrigir antes de qualquer publicação de agenda.
- PR #140 continua aberto para eventos de 17/11 a 13/12; a prévia Vercel estava READY, mas não foi encontrado resultado CI completo no head. Não foi mesclado.
- PR desta rodada: [#148](https://github.com/leonardodutrards-del/noite-df/pull/148). CI GitHub Actions passou em testes, lint e build; Vercel Preview está READY em [agenda/2026-11-11-daily-coverage](https://noite-3hqezppbn-leonardodutrards-dels-projects.vercel.app). A inspeção de rota pelo navegador desta execução foi bloqueada, então a prévia não foi conferida visualmente. O PR permanece em rascunho porque a cobertura geral ainda tem lacunas de Instagram e a produção continua sem deployment do último commit.

## 5. Segurança e limites respeitados

- Nenhum login, senha, CAPTCHA, scraping proibido ou conteúdo privado foi tentado.
- Nenhuma mensagem foi enviada a estabelecimentos.
- Nenhum feed ou Stories do Noite DF foi publicado.
- Nenhum local foi despublicado por falta de postagem recente.
- Eventos sem data/horário/local oficial ou com conflito de identidade ficaram pendentes, sem publicação.

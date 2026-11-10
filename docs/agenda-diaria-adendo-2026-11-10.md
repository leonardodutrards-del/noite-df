# Adendo diário — Noite DF — 10/11/2026

**Janela da revisão complementar:** 10/11/2026, manhã (America/Sao_Paulo)  
**Base:** 104 estabelecimentos publicados carregados do Supabase, em 22 regiões.  
**Branch:** `agenda/2026-11-10-verified-addendum`

## Resultado da revisão complementar

A agenda semanal já estava publicada em produção. A conferência direta da página de produção retornou 34 cards. Esta revisão identificou dois eventos completos que ainda não estavam na página:

### Sexta-feira, 13/11 — Núcleo Bandeirante

- **20h–05h — Os Meninos de Barão + DJ Eddy Viana — Gala do Piseiro**, Texxas Bar, SIBS QI 1, Conjunto D, Núcleo Bandeirante. Evento 18+. A página do organizador informa cobrança de couvert artístico, sem divulgar o valor.
- **Fonte oficial:** [Sympla — evento do organizador TEXXAS BAR](https://www.sympla.com.br/evento/lgc/3586903).
- **Evidência cadastral:** a página oficial identifica o produtor como TEXXAS BAR, informa telefone/WhatsApp (61) 99450-8262 e aponta o Instagram `@texxasbarbsb`. O Google Business confirma o endereço SIBS QI 1, Núcleo Bandeirante, e o mesmo telefone. A URL direta do Instagram foi registrada, mas o acesso direto ficou limitado pela ferramenta.

### Sábado, 14/11 — SIG

- **18h–02h — Sábadô no Oscarito**, Oscarito Brasília, SIG Quadra 01, lotes 985. Roda de samba, sertanejo e música ao vivo; line-up divulgado: DJ Primo, Boteco do Clima, Banda Dexcomplica e atrações adicionais, incluindo uma entrada ainda “Em Breve”.
- **Entrada:** taxa de conveniência antecipada de R$20 até 21h; após 21h, a página informa complemento na bilheteria conforme o ingresso vigente. Sujeito à lotação e alteração.
- **Fonte oficial:** [Sympla — Sábadô no Oscarito](https://www.sympla.com.br/evento/sabado-no-oscarito/3648839).
- Não havia evento correspondente no Supabase nem no seed publicado; a busca por nome/URL não encontrou duplicata.

## Descoberta de estabelecimentos

### Candidato preparado em rascunho — não publicado

**Texxas Bar** — identidade e operação atual confirmadas pela página oficial de ingresso, que identifica o próprio estabelecimento como organizador e informa endereço, telefone e Instagram; Google Business confirma o mesmo endereço e telefone.  
- Tipo: Bar.
- Região: Núcleo Bandeirante.
- Endereço: SIBS QI 1, Conjunto D, Núcleo Bandeirante, Brasília/DF.
- Telefone/WhatsApp: (61) 99450-8262.
- Instagram informado pelo organizador: https://www.instagram.com/texxasbarbsb/
- Agenda/fonte: https://www.sympla.com.br/evento/lgc/3586903
- O perfil foi preparado como `draft`, `verified=false`, para revisão editorial. Não foi inserido diretamente no Supabase nem publicado como perfil público.

### Candidatos e eventos mantidos pendentes

- **Vera Cruz Gastrobar, Planaltina — CASSIUS OGRO / TÓXICO, 13/11, 19h30–21h:** a página oficial de ingresso confirma evento, horário e local, mas há divergência de endereço entre a página de negócios/CNPJ e o resultado do Google Business. Não publicar nem criar perfil até resolver a localização inequívoca. [Sympla oficial](https://www.sympla.com.br/evento/lgc/3629544)
- **Viracopos Gastro bar, Valparaíso — Os Meninos de Barão, 15/11, 18h–23h30:** o cabeçalho do ingresso confirma 15/11, mas a descrição menciona “Domingo 11 de novembro”; também há divergência entre o endereço do Sympla e o endereço cadastral encontrado. Não publicar até confirmação. [Sympla oficial](https://www.sympla.com.br/evento/os-meninos-de-barao-no-viracopos-valparaiso-gg/3618316)
- **Dose Dupla — Os Meninos de Barão, 14/11, 21h30–04h30:** a página do produtor informa QNM 09 (antigo Lá Casa), Ceilândia, enquanto o resultado de negócio com nome semelhante aponta para QN 431, Samambaia. Não associar a nenhum perfil existente até confirmar a unidade correta. [Sympla oficial](https://www.sympla.com.br/evento/os-meninos-de-barao-no-dose-dupla-ceilandia/3587126)

## Prioridades mantidas

- **Rota do Piseiro / Bar LG:** identidade oficial e associação do local ainda não confirmadas; não vincular ao Galpão dos Brutos.
- **Galpão dos Brutos:** permanece separado e sem programação atual, conforme a correção do responsável pelo projeto.
- **Espaço LG Sobradinho:** manter esse nome literal até identificação oficial inequívoca.
- **Surra de Modão:** permanece associado ao Contexto Bar e Restaurante, em 11/11; não associar ao Bar LG.

## Cobertura e Instagram

- 104 estabelecimentos publicados carregados dinamicamente; 22 regiões consultadas.
- 30 campos de Instagram na base; 29 tentativas bloqueadas/limitadas pela ferramenta e 1 URL cadastrada que aponta para um Reel, não para um perfil.
- Nenhum perfil foi classificado como privado ou inexistente sem evidência. O status público/privado dos 29 perfis inacessíveis permanece indeterminável.
- 94 estabelecimentos estavam sem agenda datada localizada na varredura principal; com a confirmação do Oscarito, esse total passa a 93. Texxas Bar é candidato novo e não integra os 104 perfis publicados.
- Nenhum estabelecimento foi despublicado por falta de post recente.

## Estado técnico

- Produção antes deste adendo: 34 cards na página semanal.
- Este PR adiciona 2 eventos verificados; total esperado após merge: 36 cards.
- O evento do Texxas Bar é publicado como evento confirmado, mas o perfil do estabelecimento permanece em draft.
- Nenhuma gravação direta no Supabase, nenhum contato a estabelecimentos e nenhuma publicação no Instagram/feed/Stories.
- O PR separado #140, com eventos após 16/11, permanece em revisão e não deve ser mesclado sem CI executado no head atual.

## Complemento 2 — Arena Dose Dupla (10/11/2026)

A busca complementar resolveu a identidade que estava pendente como “Dose Dupla”: as páginas oficiais de ingresso de 14 e 15/11, o endereço QNM 09 e a página oficial anterior da casa convergem para **Arena Dose Dupla**, em Ceilândia Sul. A checagem de duplicidade no Supabase por nome normalizado, variações, slug, Instagram, endereço e telefone retornou zero perfis existentes.

### Eventos confirmados

- **Sábado, 14/11, 21h30–04h30 — Os Meninos de Barão no Dose Dupla.** A página oficial do ingresso usa o nome curto “Dose Dupla”, informa QNM 09 (antigo Lá Casa) e confirma a janela completa. A página oficial da Arena Dose Dupla para 15/11 e o endereço público confirmam a mesma unidade.
  - Fonte: [Sympla oficial — Os Meninos de Barão no Dose Dupla](https://www.sympla.com.br/evento/os-meninos-de-barao-no-dose-dupla-ceilandia/3587126).
- **Domingo, 15/11, a partir das 16h — 10 Horas de Forró / Encontro dos Forrozeiros.** Atrações: R10, Kuque do Piseiro, Pyt Sakaninha e Celso Alves. Evento 18+, com documento oficial com foto.
  - Fonte: [Sympla oficial — 10 Horas de Forró](https://www.sympla.com.br/evento/10-horas-de-forro/3614097).
  - A página descreve “10 horas de forró”, mas o horário estruturado de término aparece igual ao início (16h). Não foi inferido horário final; a agenda exibe somente “a partir das 16h” e registra a inconsistência.

### Perfil candidato em rascunho

- **Arena Dose Dupla** — tipo casa de show; região Ceilândia; endereço QNM 09, Conjunto A, Lote 2/4, Ceilândia Sul; telefone/WhatsApp (61) 99943-9720.
- A página oficial anterior da Sympla cita diretamente `@arenadosedupla`; a URL direta foi tentada, mas o Instagram não abriu pela ferramenta. O Google Business confirma o endereço e o telefone.
- Perfil preparado como `draft`, `verified=false`; não foi inserido diretamente no Supabase nem publicado.

### Totais após este complemento

- A agenda de produção tinha 36 cards antes deste complemento.
- Este PR adiciona 2 eventos confirmados; total esperado após merge: 38 cards.
- O status “Dose Dupla pendente” do primeiro adendo foi resolvido como Arena Dose Dupla. Permanecem pendentes Vera Cruz Gastrobar (divergência de endereço) e Viracopos Gastro bar (data/endereço inconsistentes).
- O total de 93 estabelecimentos publicados sem agenda datada localizada não muda: Arena Dose Dupla ainda é um candidato novo e não faz parte dos 104 perfis publicados.

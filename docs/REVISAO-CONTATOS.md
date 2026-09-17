# Revisão de contatos e cadastro

Etapa em andamento, consultada em 16/09/2026.

- Mantidos os 50 registros existentes e adicionados seis locais com fontes oficiais.
- Contatos com telefone em 12 registros; WhatsApp somente quando publicado como tal pela fonte.
- Horários separados de programação de eventos. Links de agenda não significam que eventos semanais tenham sido confirmados.
- Formulários de parceiro e visitante reorganizados; confirmação de senha no parceiro; credenciais demonstrativas removidas da tela de login.
- Validação: 66 testes e build Next.js passaram. A validação não comprova persistência de contas em produção. O lint geral possui dois erros preexistentes no login de visitante e no hook de autenticação.

## Pendências

Revisão dos contatos restantes; confirmar agendas com data; Contexto, Oscarito, Complexo Fora do Eixo e Galpão dos Brutos solicitados para inclusão. Rancho do Vaqueiro já cadastrado, atualizar sem duplicar. Site do Contexto contém telefone aparentemente ilustrativo e rodapé de modelo, não importar esses contatos. Instagram exige sessão autenticada nesta navegação.

Esta etapa não altera esquema de banco e não resolve a persistência existente da autenticação.

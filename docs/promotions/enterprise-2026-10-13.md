# Enterprise: um mês gratuito com meio de pagamento

Campanha autorizada em 13/10/2026. A audiência é o snapshot de 104 estabelecimentos já cadastrados, disponível em `data/promotions/enterprise-2026-10-13.json`. Cadastros suspensos não podem ativar; assinaturas vigentes não são substituídas nem recebem cobrança duplicada. Esse caso deve ser ajustado individualmente.

A promoção começa quando o Mercado Pago confirmar uma assinatura autorizada com meio de pagamento, não quando o usuário abrir o link. O provedor configura um mês calendário gratuito e depois R$ 150/mês. O checkbox registra o aceite e o checkout do provedor confirma a autorização de cobrança recorrente. Cancelamento disponível no painel; dados de cartão não são armazenados pelo Noite DF.

Abrir checkout só cria/reutiliza um plano de cobrança. Só a notificação verificada do Mercado Pago com identificação de meio de pagamento libera o Enterprise. O código verifica preço, moeda, mês grátis e domínio do checkout antes de redirecionar. A renovação não reinicia a promoção. Não houve ativação em massa no banco.

Validação de integração: é necessário conferir o webhook de assinaturas configurado no aplicativo Mercado Pago e validar uma adesão real com meio de pagamento do próprio titular. Os testes automatizados verificam recusa sem meio de pagamento, vínculo do local, repetição e preço. Não houve cadastro de cartão nem cobrança de teste em nome de terceiros.

## Aviso proposto para e-mail, WhatsApp ou mensagem privada

Olá, equipe [local]! Aqui é o Leonardo, fundador do Noite DF.

Preparamos uma promoção para os estabelecimentos já cadastrados: 1 mês gratuito do Enterprise, com gestão do perfil, agenda, promoções, cardápio e métricas, além de suporte prioritário.

A ativação exige login, vínculo aprovado com o estabelecimento e cadastro de um meio de pagamento no Mercado Pago. O mês gratuito começa após a confirmação do provedor. Depois, o Enterprise renova por R$ 150/mês, somente com o aceite apresentado na ativação. É possível cancelar antes da renovação para impedir a cobrança.

Acesse https://www.noitedf.com.br/planos e escolha “Ativar 1 mês grátis” no Enterprise. Se já tiver assinatura ativa, responda para ajustarmos a promoção sem gerar uma segunda cobrança.

Se não quiser receber novos avisos comerciais, basta responder esta mensagem.

Leonardo Dutra — Noite DF
https://www.noitedf.com.br

## Entregas

Nenhum envio pode ser tratado como concluído sem identificação de mensagem retornada pelo canal. A integração do Instagram conectada ao Windsor permite posts e comentários, mas não mensagens privadas. Nenhum conector de WhatsApp apareceu conectado. E-mail depende de destinatário verificado; excluir contatos de locais encerrados e avisos de infraestrutura. Mensagens de parceiros devem usar o contato oficial ou a conversa anterior correspondente.

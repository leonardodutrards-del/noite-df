# Operação da agenda e imagens

O Master Admin cadastra um evento com data, encerramento, endereço e fonte oficial em `/admin/agenda`. Publicar ou corrigir um evento atualiza as agendas na próxima abertura da página, sem deploy de código por evento.

As agendas de hoje, semana, mês e fim de semana usam os mesmos eventos. A seleção muda pelo calendário de Brasília, ordena datas, evita duplicatas e deixa de exibir eventos no encerramento. Eventos futuros continuam na agenda mensal e passam à semanal quando chegar sua semana. O registro permanece no Admin para auditoria.

## Flyers e fotos

O campo opcional aceita endereço HTTPS direto de arquivo, descrição acessível, crédito e fonte. A publicação exige confirmação de autorização de uso. Não reutilizar imagens sem permissão nem inferir uma autorização por estarem em um perfil público. A imagem é exibida com proporção original, sem recortar os horários, e crédito clicável. Uma falha no arquivo não remove os dados do evento. URLs temporárias de CDN do Instagram não são armazenamento durável; preferir arquivos estáveis fornecidos pelo organizador. Upload para armazenamento próprio ainda não faz parte deste lote.

A migração `supabase/migrations/20261009143200_event_artwork.sql` acrescenta apenas `events.artwork`. As políticas RLS e autorização Master Admin permanecem em vigor. Aplicar esta migração antes do deploy.

## Cardápio digital

Na mesma página do Admin, carregar o cardápio do estabelecimento antes de editar. O campo existente `establishments.menu` aceita até 12 imagens ordenadas, cada uma com descrição, crédito, fonte e autorização. O perfil exibe essas páginas com ampliação e mantém o link completo e os preços anteriormente cadastrados. Não precisa de uma nova migração para o cardápio. Substituir URLs e conferir a data quando os preços mudarem; não gerar preços a partir de flyers nem tentar ler valores automaticamente de fotos.

## Divulgação

O Admin prepara automaticamente propostas textuais de feed para eventos confirmados do mês e uma proposta agregada de Story por data. Cada proposta inclui data, local, fonte e link para a agenda correspondente. Os identificadores são determinísticos, para servir como referência de deduplicação. Não existe envio social, agendamento de entrega nem histórico de posts publicados neste lote. A proposta agregada é recalculada ao abrir a página e não representa um novo Story enviado.

Antes de automatizar entregas, conectar uma conta profissional por integração compatível, registrar entregas e revisões, garantir idempotência e validar mudanças/cancelamentos antes de enviar. A coleta das fontes continua no monitoramento editorial: não há crawler de Instagram nem ingestão irrestrita de parceiros. O suporte a flyers de eventos não altera as fotos de capa dos estabelecimentos.

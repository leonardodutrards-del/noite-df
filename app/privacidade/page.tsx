import Link from 'next/link';

export default function PrivacyPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <main className="container legal">
      <Link className="brand" href="/">Noite DF</Link>
      <h1>Política de Privacidade</h1>
      <p>Atualizada em 09/10/2026.</p>
      <p>O Noite DF trata informações para oferecer o guia de lugares e eventos, manter contas e operar os serviços de parceiros.</p>
      <h2>Conta e preferências</h2>
      <p>Nome, e-mail e dados de autenticação são usados para criar e acessar sua conta. Favoritos, roteiros e preferências são associados à conta para disponibilizar essas funções. A autenticação utiliza o Supabase.</p>
      <h2>Dados de parceiros e pagamentos</h2>
      <p>Informações do estabelecimento, contatos, programação e promoções são usadas na gestão e publicação do perfil. Plano, situação de pagamento, identificadores da cobrança e período de acesso são utilizados para liberar os recursos contratados. O Mercado Pago processa os pagamentos, conforme suas próprias políticas.</p>
      <h2>Uso do site</h2>
      <p>Visualizações e interações, como cliques em rotas, WhatsApp, Instagram e favoritos, são registradas para medir o interesse nos estabelecimentos. Registros de segurança e auditoria ajudam a proteger contas e acompanhar alterações. Ferramentas de mensuração, quando habilitadas, também podem receber eventos de uso.</p>
      <h2>Publicação e serviços externos</h2>
      <p>Informações aprovadas de estabelecimentos e eventos podem aparecer no guia público. Links para mapas, redes sociais e ingressos levam a serviços externos que possuem políticas próprias.</p>
      <h2>Seus dados</h2>
      <p>Você pode solicitar informações sobre o tratamento dos seus dados, correção ou exclusão ao responsável pelo Noite DF. Registros necessários para segurança, cobranças e atendimento de obrigações podem precisar ser preservados. Cancelar um plano interrompe a renovação recorrente e não exclui automaticamente a conta ou os dados do estabelecimento.</p>
      {supportEmail && <><h2>Contato</h2><p><a href={`mailto:${supportEmail}`}>{supportEmail}</a></p></>}
      <p><Link href="/termos">Consultar os Termos de Uso</Link></p>
    </main>
  );
}

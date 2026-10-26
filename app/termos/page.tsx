import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="container legal">
      <Link className="brand" href="/">Noite DF</Link>
      <h1>Termos de Uso</h1>
      <p>Atualizados em 26/10/2026.</p>
      <p>O Noite DF organiza informações fornecidas por estabelecimentos, usuários e fontes públicas. Horários, preços e eventos podem mudar; confirme disponibilidade, ingressos e condições diretamente com o estabelecimento ou organizador.</p>
      <h2>Contas e parceiros</h2>
      <p>Mantenha seus dados corretos e suas credenciais protegidas. A gestão de um estabelecimento depende de vínculo aprovado pelo Master Admin. O parceiro é responsável pela veracidade e autorização de uso das informações enviadas. Conteúdo pode passar por revisão, ser suspenso ou expirar.</p>
      <h2>Planos e pagamentos</h2>
      <p>A divulgação assistida custa R$30 por mês por estabelecimento e inclui até quatro atualizações mensais no perfil e na agenda com informações e imagens autorizadas enviadas pela casa. Não inclui artes, gestão de redes sociais, mídia paga ou garantia de público e vendas. Início, pagamento e prazo são combinados antes da contratação. Não há fidelidade nem cobrança iniciada pela página. Mudanças futuras de preço exigem informação e aceite antes de contratar um novo período. Consulte a <Link href="/divulgar">oferta de divulgação</Link>.</p>
      <p>Assinaturas de painel existentes mantêm suas condições e não são migradas ou canceladas por esta oferta. As regras de Mercado Pago e acesso abaixo se referem a essas assinaturas, consultáveis na <Link href="/assinaturas">área de planos do painel</Link>.</p>
      <p>A assinatura recorrente é autorizada no checkout do Mercado Pago. O Pix é um pagamento avulso pelo valor do plano, com acesso por 30 dias após aprovação e renovação manual. Pagamentos precisam ser confirmados pelo provedor para liberar o acesso; o retorno do checkout, por si só, não confirma a aprovação.</p>
      <h2>Cancelamento</h2>
      <p>Você pode cancelar a assinatura recorrente na área Cobrança do painel para interromper novas cobranças. No Pix, não há cobrança recorrente: o acesso termina ao final do período pago, salvo novo pagamento confirmado. Cancelar não apaga automaticamente os dados cadastrados. Solicitações de reembolso devem ser avaliadas conforme o pagamento e os direitos aplicáveis.</p>
      <h2>Eventos e links externos</h2>
      <p>O Noite DF divulga programação e links de fontes. Ingressos, entrada, couvert, cancelamentos de eventos e serviços dos estabelecimentos são tratados diretamente com os respectivos responsáveis.</p>
      <p><Link href="/privacidade">Consultar a Política de Privacidade</Link></p>
    </main>
  );
}

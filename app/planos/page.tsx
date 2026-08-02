import Link from 'next/link';

const plans = [
  { id: 'pro', name: 'Pro', price: 99.9, description: 'Agenda, promoções, gestão da página e métricas essenciais.' },
  { id: 'premium', name: 'Premium', price: 249.9, description: 'Mais destaque, relatórios avançados e campanhas.' },
  { id: 'enterprise', name: 'Enterprise', price: 1500, description: 'Redes, grupos e operação com múltiplas unidades.' },
];

export default function PlansPage() {
  return (
    <main className="container">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><Link href="/parceiro">Painel parceiro</Link></header>
      <section className="page-heading"><span className="badge">Modo vitrine</span><h1>Planos para transformar visibilidade em movimento</h1><p>Conheça as opções planejadas. Assinaturas e cobranças ainda não estão disponíveis.</p></section>
      <div className="pricing-grid">
        <article className="price-card"><span>Gratuito</span><h2>R$ 0</h2><p>Página básica, endereço, contato e presença no guia.</p><Link className="button ghost" href="/parceiro">Conhecer o painel</Link></article>
        {plans.map((plan) => <article className="price-card" key={plan.id}><span>{plan.name}</span><h2>{plan.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}<small>/mês</small></h2><p>{plan.description}</p><button className="button" disabled>Em breve</button></article>)}
      </div>
      <section className="notice"><b>Site em modo vitrine:</b> nenhum pagamento é solicitado ou processado nesta fase.</section>
    </main>
  );
}

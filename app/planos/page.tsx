import Link from 'next/link';
import { PLAN_CATALOG } from '@/lib/plans';
import { SHOWCASE_MODE, PAYMENTS_ENABLED } from '@/lib/env';
import { PlanList } from '@/components/PlanList';

export default function PlansPage() {
  const plans = Object.values(PLAN_CATALOG);

  return (
    <main className="container">
      <header className="topbar"><Link className="brand" href="/">Noite DF</Link><Link href="/parceiro">Painel parceiro</Link></header>
      <section className="page-heading">
        <h1>Planos para transformar visibilidade em movimento</h1>
        <p>Conheça as opções de assinatura pensadas para parceiros do Noite DF.</p>
      </section>
      <PlanList plans={plans} paymentsEnabled={PAYMENTS_ENABLED} showcaseMode={SHOWCASE_MODE} />
      {SHOWCASE_MODE ? (
        <section className="notice"><b>Modo vitrine:</b> nenhum pagamento é solicitado ou processado nesta fase.</section>
      ) : null}
    </main>
  );
}

import Link from 'next/link';
import { PLAN_CATALOG } from '@/lib/plans';
import { SHOWCASE_MODE, PAYMENTS_ENABLED, TRIAL_DAYS, TRIAL_ENABLED } from '@/lib/env';
import { PlanList } from '@/components/PlanList';

export default function PlansPage() {
  const plans = Object.values(PLAN_CATALOG);
  return (
    <main className="container">
      <header className="topbar">
        <Link className="brand" href="/">Noite DF</Link>
        <nav>
          <Link href="/parceiros/sobradinho">Apresentação Sobradinho</Link>
          <Link href="/parceiro">Painel parceiro</Link>
        </nav>
      </header>

      <section className="page-heading">
        <span className="badge">Assinaturas Noite DF</span>
        <h1>Escolha o nível de operação do seu estabelecimento</h1>
        <p>
          Cada plano mostra exatamente os recursos liberados. A cobrança paga é mensal e recorrente pelo Mercado Pago,
          com o meio de pagamento autorizado no checkout. Você pode cancelar quando quiser para interromper novas cobranças.
        </p>
      </section>

      <section className="notice" style={{ marginBottom: 24 }}>
        <b>Sem surpresa:</b> seu cadastro e seus dados continuam salvos mesmo depois de um cancelamento.
        Recursos pagos são liberados somente quando a assinatura ou o teste estiverem ativos.
      </section>

      <PlanList
        plans={plans}
        paymentsEnabled={PAYMENTS_ENABLED}
        showcaseMode={SHOWCASE_MODE}
        trialEnabled={TRIAL_ENABLED}
        trialDays={TRIAL_DAYS}
      />

      <section className="panel" style={{ marginTop: 28 }}>
        <h2>Como funciona a cobrança</h2>
        <p>
          1. Faça login e vincule seu estabelecimento. 2. Escolha o plano. 3. Autorize a assinatura no Mercado Pago.
          4. O webhook confirma a ativação e o Noite DF libera automaticamente os recursos contratados.
        </p>
        <p>
          Depois, a área <b>Cobrança</b> no painel mostra plano, status, valor e renovação e permite cancelar a assinatura sem precisar falar com atendimento.
        </p>
      </section>

      {SHOWCASE_MODE ? (
        <section className="notice">
          <b>Modo vitrine:</b> pagamentos estão temporariamente indisponíveis neste ambiente.
        </section>
      ) : null}
    </main>
  );
}

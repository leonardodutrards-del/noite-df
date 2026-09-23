'use client';

import { useState } from 'react';
import type { PlanDefinition } from '@/lib/plans';
import { track } from '@/lib/analytics';

interface PlanListProps {
  plans: PlanDefinition[];
  paymentsEnabled: boolean;
  showcaseMode: boolean;
  trialEnabled: boolean;
  trialDays: number;
}

export function PlanList({ plans, paymentsEnabled, showcaseMode, trialEnabled, trialDays }: PlanListProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(planId: string, trial = false) {
    setError(null);
    if (!paymentsEnabled || showcaseMode) {
      setError('Pagamentos indisponíveis no momento.');
      return;
    }

    setLoadingPlan(planId);
    try {
      track(trial ? 'trial_start' : 'subscription_checkout', { planId });
      const response = await fetch(
        `/api/payments/checkout?planId=${encodeURIComponent(planId)}&trial=${trial ? 'true' : 'false'}`
      );
      const payload = await response.json();
      if (!response.ok || !payload.url) {
        setError(payload.error || 'Não foi possível iniciar a assinatura.');
        setLoadingPlan(null);
        return;
      }
      window.open(payload.url, '_self');
    } catch {
      setError('Não foi possível iniciar a assinatura. Tente novamente mais tarde.');
      setLoadingPlan(null);
    }
  }

  return (
    <>
      <div className="pricing-grid">
        {plans.map((plan) => {
          const isFree = plan.id === 'free';
          return (
            <article className="price-card" key={plan.id}>
              <span>{plan.name}</span>
              <h2>
                {plan.priceCents === 0
                  ? 'R$ 0,00'
                  : `${(plan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                {plan.priceCents !== 0 ? <small>/mês</small> : null}
              </h2>
              <p>{plan.description}</p>
              <ul className="feature-list">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              {isFree ? (
                <a className="button ghost" href="/parceiro">Conhecer o painel</a>
              ) : (
                <>
                  {trialEnabled ? (
                    <button
                      className="button"
                      type="button"
                      disabled={!paymentsEnabled || showcaseMode || loadingPlan === plan.id}
                      onClick={() => void handleSubscribe(plan.id, true)}
                    >
                      {loadingPlan === plan.id ? 'Abrindo Mercado Pago…' : `Testar ${trialDays} dias grátis`}
                    </button>
                  ) : null}
                  <button
                    className={trialEnabled ? 'button ghost' : 'button'}
                    type="button"
                    disabled={!paymentsEnabled || showcaseMode || loadingPlan === plan.id}
                    onClick={() => void handleSubscribe(plan.id, false)}
                  >
                    {loadingPlan === plan.id ? 'Abrindo Mercado Pago…' : `Assinar ${plan.name}`}
                  </button>
                  {trialEnabled ? (
                    <small style={{ color: 'var(--muted)' }}>
                      A continuidade paga é autorizada no fluxo oficial de assinatura do Mercado Pago.
                    </small>
                  ) : null}
                </>
              )}
            </article>
          );
        })}
      </div>
      {error ? <div className="notice danger">{error}</div> : null}
    </>
  );
}

'use client';

import { useRouter } from 'next/navigation';
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

export function PlanList({ plans, paymentsEnabled, showcaseMode }: PlanListProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function routeForAuthentication(planId: string) {
    return `/login?redirect=${encodeURIComponent(`/planos?plan=${planId}`)}`;
  }

  async function handleSubscribe(planId: string, paymentMethod: 'mercado_pago' | 'pix' = 'mercado_pago') {
    setError(null);
    if (!paymentsEnabled || showcaseMode) {
      setError('Pagamentos indisponíveis no momento.');
      return;
    }

    setLoadingPlan(`${paymentMethod}:${planId}`);
    try {
      const response = await fetch('/api/payments/subscriptions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ planId, paymentMethod }),
      });
      const payload = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push(routeForAuthentication(planId));
        return;
      }
      if (response.status === 403) {
        router.push(`/parceiro/onboarding?plan=${encodeURIComponent(planId)}`);
        return;
      }
      if (!response.ok || !payload.initPoint) {
        setError(payload.error || 'Não foi possível iniciar a contratação.');
        return;
      }

      track('subscription_checkout', { planId, paymentMethod });
      window.location.assign(payload.initPoint);
    } catch {
      setError('Não foi possível iniciar a contratação. Tente novamente mais tarde.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <>
      <div className="pricing-grid">
        {plans.map((plan) => {
          const isFree = plan.id === 'free';
          const recurringLoading = loadingPlan === `mercado_pago:${plan.id}`;
          const pixLoading = loadingPlan === `pix:${plan.id}`;
          return (
            <article className="price-card" key={plan.id}>
              <span>{plan.name}</span>
              <h2>
                {plan.priceCents === 0
                  ? 'R$ 0,00'
                  : (plan.priceCents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                {plan.priceCents !== 0 ? <small>/mês</small> : null}
              </h2>
              <p>{plan.description}</p>
              <ul className="feature-list">
                {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              {isFree ? (
                <a className="button ghost" href="/parceiro/onboarding">Cadastrar estabelecimento</a>
              ) : (
                <>
                  <button
                    className="button"
                    type="button"
                    disabled={!paymentsEnabled || showcaseMode || Boolean(loadingPlan)}
                    onClick={() => void handleSubscribe(plan.id)}
                  >
                    {recurringLoading ? 'Abrindo Mercado Pago…' : `Assinar ${plan.name}`}
                  </button>
                  <button
                    className="button ghost"
                    type="button"
                    disabled={!paymentsEnabled || showcaseMode || Boolean(loadingPlan)}
                    onClick={() => void handleSubscribe(plan.id, 'pix')}
                  >
                    {pixLoading ? 'Abrindo checkout…' : 'Pagar 30 dias com Pix'}
                  </button>
                  <small style={{ color: 'var(--muted)' }}>
                    A assinatura recorrente é autorizada no Mercado Pago. O Pix libera 30 dias após a aprovação e tem renovação manual. O acesso pago depende da confirmação do provedor.
                  </small>
                </>
              )}
            </article>
          );
        })}
      </div>
      {error ? <div className="notice danger" role="alert">{error}</div> : null}
    </>
  );
}

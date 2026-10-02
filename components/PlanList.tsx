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

export function PlanList({ plans, paymentsEnabled, showcaseMode, trialEnabled, trialDays }: PlanListProps) {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function routeForAuthentication(planId: string) {
    return `/login?redirect=${encodeURIComponent(`/planos?plan=${planId}`)}`;
  }

  async function handleTrial(planId: string) {
    setError(null);
    setLoadingPlan(`trial:${planId}`);
    try {
      const response = await fetch('/api/parceiro/trial', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ planId }),
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
      if (!response.ok) {
        setError(payload.error || 'Não foi possível iniciar o teste gratuito.');
        return;
      }

      track('trial_start', { planId });
      router.push('/parceiro');
    } catch {
      setError('Não foi possível iniciar o teste gratuito.');
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleSubscribe(planId: string) {
    setError(null);
    if (!paymentsEnabled || showcaseMode) {
      setError('Pagamentos indisponíveis no momento.');
      return;
    }

    setLoadingPlan(`pay:${planId}`);
    try {
      const response = await fetch('/api/payments/subscriptions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ planId }),
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
        setError(payload.error || 'Não foi possível iniciar a assinatura.');
        return;
      }

      track('subscription_checkout', { planId });
      window.location.assign(payload.initPoint);
    } catch {
      setError('Não foi possível iniciar a assinatura. Tente novamente mais tarde.');
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <>
      <div className="pricing-grid">
        {plans.map((plan) => {
          const isFree = plan.id === 'free';
          const trialLoading = loadingPlan === `trial:${plan.id}`;
          const paymentLoading = loadingPlan === `pay:${plan.id}`;
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
                <a className="button ghost" href="/parceiro/onboarding">Cadastrar estabelecimento</a>
              ) : (
                <>
                  {trialEnabled ? (
                    <button
                      className="button"
                      type="button"
                      disabled={showcaseMode || Boolean(loadingPlan)}
                      onClick={() => void handleTrial(plan.id)}
                    >
                      {trialLoading ? 'Ativando teste…' : `Testar ${trialDays} dias grátis`}
                    </button>
                  ) : null}
                  <button
                    className={trialEnabled ? 'button ghost' : 'button'}
                    type="button"
                    disabled={!paymentsEnabled || showcaseMode || Boolean(loadingPlan)}
                    onClick={() => void handleSubscribe(plan.id)}
                  >
                    {paymentLoading ? 'Abrindo Mercado Pago…' : `Assinar ${plan.name}`}
                  </button>
                  <small style={{ color: 'var(--muted)' }}>
                    O pagamento só é iniciado após login e vínculo confirmado com o estabelecimento.
                  </small>
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

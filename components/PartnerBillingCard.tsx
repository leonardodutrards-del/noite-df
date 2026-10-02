'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type BillingState = {
  entitlements: {
    planCode: 'free' | 'pro' | 'premium' | 'enterprise';
    source: 'free' | 'trial' | 'subscription' | 'admin';
    activeUntil?: string;
  };
  billing: null | {
    id: string;
    planCode: string;
    planName: string;
    status: string;
    amountCents: number;
    currentPeriodEnd?: string | null;
    startedAt: string;
    recurring: boolean;
    provider: string;
    canCancel: boolean;
  };
};

function money(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function PartnerBillingCard() {
  const [state, setState] = useState<BillingState | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const response = await fetch('/api/parceiro/billing', { cache: 'no-store' });
    if (!response.ok) return;
    setState(await response.json());
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/parceiro/billing', { cache: 'no-store' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled && payload) setState(payload);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function cancelSubscription() {
    if (!window.confirm('Cancelar novas cobranças desta assinatura? Seus dados continuarão salvos.')) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/parceiro/billing', { method: 'DELETE' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(payload.error || 'Não foi possível cancelar.');
        return;
      }
      setMessage(
        payload.accessUntil
          ? `Assinatura cancelada. Seu acesso pago permanece até ${new Date(payload.accessUntil).toLocaleDateString('pt-BR')}.`
          : 'Assinatura cancelada. Não haverá novas cobranças.'
      );
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!state) return null;

  const billing = state.billing;
  const isTrial = state.entitlements.source === 'trial';

  return (
    <section className="panel" style={{ marginTop: 24 }}>
      <span className="badge">Cobrança</span>
      <h2 style={{ marginBottom: 8 }}>Assinatura e cobrança automática</h2>

      {billing ? (
        <>
          <p>
            <b>{billing.planName}</b> · {money(billing.amountCents)}/mês · Mercado Pago
          </p>
          <p style={{ color: 'var(--muted)' }}>
            A cobrança é recorrente. O meio de pagamento é escolhido e autorizado no checkout do Mercado Pago.
            Você pode cancelar quando quiser para impedir novas cobranças.
          </p>
          <div className="metrics-grid" style={{ marginTop: 16 }}>
            <article><span>Status</span><strong>{billing.status}</strong></article>
            <article>
              <span>Primeira adesão</span>
              <strong>{new Date(billing.startedAt).toLocaleDateString('pt-BR')}</strong>
            </article>
            <article>
              <span>Próxima renovação / acesso até</span>
              <strong>{billing.currentPeriodEnd ? new Date(billing.currentPeriodEnd).toLocaleDateString('pt-BR') : 'A confirmar'}</strong>
            </article>
          </div>
          {billing.canCancel ? (
            <button
              type="button"
              className="button ghost"
              disabled={busy}
              onClick={() => void cancelSubscription()}
              style={{ marginTop: 16 }}
            >
              {busy ? 'Cancelando…' : 'Cancelar assinatura'}
            </button>
          ) : null}
        </>
      ) : isTrial ? (
        <>
          <p><b>Teste gratuito ativo.</b></p>
          <p style={{ color: 'var(--muted)' }}>
            Nenhuma cobrança é feita pelo Noite DF durante o período de teste. Para continuar depois, escolha um plano e conclua a autorização no Mercado Pago.
          </p>
          <Link className="button" href="/planos">Escolher plano</Link>
        </>
      ) : (
        <>
          <p>Você ainda não possui cobrança recorrente ativa.</p>
          <p style={{ color: 'var(--muted)' }}>
            Seu cadastro permanece salvo. Você pode contratar um plano quando quiser.
          </p>
          <Link className="button" href="/planos">Ver planos</Link>
        </>
      )}

      {message ? <div className="notice" style={{ marginTop: 16 }}>{message}</div> : null}
    </section>
  );
}

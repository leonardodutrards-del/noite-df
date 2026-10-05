'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

type BillingPayload = {
  entitlements?: {
    source?: 'free' | 'trial' | 'subscription' | 'admin';
    planCode?: string;
  };
  billing?: null | {
    status?: string;
    planName?: string;
    amountCents?: number;
  };
};

type ReturnState = 'checking' | 'pending' | 'active' | 'error';

export default function PaymentReturn() {
  const [state, setState] = useState<ReturnState>('checking');
  const [billing, setBilling] = useState<BillingPayload['billing']>(null);
  const [attempts, setAttempts] = useState(0);

  const refreshBilling = useCallback(async () => {
    try {
      const response = await fetch('/api/parceiro/billing', { cache: 'no-store' });
      if (!response.ok) {
        setState('error');
        return;
      }

      const payload = (await response.json()) as BillingPayload;
      setBilling(payload.billing ?? null);

      if (
        payload.entitlements?.source === 'subscription' ||
        payload.billing?.status === 'active'
      ) {
        setState('active');
        return;
      }

      setState('pending');
    } catch {
      setState('error');
    } finally {
      setAttempts((value) => value + 1);
    }
  }, []);

  useEffect(() => {
    if (state === 'active') return;

    const initialCheck = window.setTimeout(() => {
      void refreshBilling();
    }, 0);
    const timer = window.setInterval(() => {
      void refreshBilling();
    }, 5000);

    return () => {
      window.clearTimeout(initialCheck);
      window.clearInterval(timer);
    };
  }, [refreshBilling, state]);

  const title =
    state === 'active'
      ? 'Assinatura confirmada ✓'
      : state === 'pending'
        ? 'Pagamento recebido. Aguardando confirmação'
        : state === 'error'
          ? 'Não foi possível confirmar agora'
          : 'Confirmando sua assinatura…';

  return (
    <main className="container">
      <section className="page-heading">
        <span className="badge">Mercado Pago</span>
        <h1>{title}</h1>

        {state === 'active' ? (
          <>
            <p>
              O Mercado Pago confirmou a assinatura e os benefícios do plano já podem ser usados no painel do parceiro.
            </p>
            {billing?.planName ? (
              <div className="notice" style={{ marginBottom: 18 }}>
                Plano <b>{billing.planName}</b>
                {typeof billing.amountCents === 'number'
                  ? ` · ${new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(billing.amountCents / 100)}/mês`
                  : ''}
              </div>
            ) : null}
          </>
        ) : state === 'pending' ? (
          <p>
            O checkout foi concluído, mas o Noite DF ainda está aguardando a confirmação oficial do Mercado Pago pelo webhook.
            Esta tela verifica automaticamente a cada 5 segundos. Você não precisa pagar novamente.
          </p>
        ) : state === 'error' ? (
          <p>
            Não conseguimos consultar o status neste momento. Isso não significa que o pagamento falhou.
            Você pode tentar novamente ou abrir o painel; a liberação acontece automaticamente quando o webhook for confirmado.
          </p>
        ) : (
          <p>
            Estamos consultando sua assinatura e aguardando a confirmação oficial do Mercado Pago.
          </p>
        )}

        {state !== 'active' && attempts > 0 ? (
          <small style={{ display: 'block', color: 'var(--muted)', marginBottom: 16 }}>
            Verificações realizadas: {attempts}
          </small>
        ) : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="button" href="/parceiro">
            {state === 'active' ? 'Usar benefícios no painel' : 'Voltar ao painel'}
          </Link>
          {state !== 'active' ? (
            <button className="button ghost" type="button" onClick={() => void refreshBilling()}>
              Verificar agora
            </button>
          ) : null}
          <Link className="button ghost" href="/planos">Ver benefícios dos planos</Link>
        </div>
      </section>
    </main>
  );
}

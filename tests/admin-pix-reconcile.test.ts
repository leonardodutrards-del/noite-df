import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const overview = readFileSync(resolve(process.cwd(), 'modules/admin/overview.ts'), 'utf8');
const admin = readFileSync(resolve(process.cwd(), 'app/admin/page.tsx'), 'utf8');

describe('admin Pix reconciliation', () => {
  it('reconciles pending Pix before calculating metrics', () => {
    expect(overview).toContain('reconcilePendingPixPayments');
    expect(overview).toContain('/v1/payments/');
    expect(overview).toContain('syncPaymentResource(payment)');
  });

  it('keeps recurring MRR restricted to recurring Mercado Pago subscriptions', () => {
    expect(overview).toContain('provider=eq.mercado_pago&select=amount_cents');
  });

  it('labels metrics clearly', () => {
    expect(admin).toContain('Planos Pagos Ativos');
    expect(admin).toContain('MRR Recorrente');
  });
});

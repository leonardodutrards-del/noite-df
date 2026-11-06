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
    expect(overview).toContain('lastPixReconciliationAt');
    expect(overview).toContain('5 * 60 * 1000');
    expect(overview).toContain('limit=10');
  });

  it('keeps recurring MRR restricted to recurring Mercado Pago subscriptions', () => {
    expect(overview).toContain('provider=eq.mercado_pago&select=amount_cents');
  });

  it('labels metrics clearly', () => {
    expect(admin).toContain('Planos Pagos Ativos');
    expect(admin).toContain('MRR Recorrente');
    expect(admin).toContain('window.setInterval(refreshOverview, 60000)');
    expect(admin).toContain('atualizadas automaticamente a cada 60 segundos');
  });
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Pagamento conectado a benefícios', () => {
  it('usa um catálogo único de preços e capacidades', () => {
    const plans = readFileSync(resolve(process.cwd(), 'lib/plans.ts'), 'utf8');
    const subscription = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
    expect(plans).toContain('PLAN_CAPABILITIES');
    expect(subscription).toContain('getPlan(planId)');
    expect(subscription).toContain('plan.priceCents / 100');
    expect(subscription).not.toContain('99.9');
    expect(subscription).not.toContain('249.9');
    expect(subscription).not.toContain('1500');
  });

  it('exige login e vínculo antes do checkout', () => {
    const subscription = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
    const plans = readFileSync(resolve(process.cwd(), 'components/PlanList.tsx'), 'utf8');
    expect(subscription).toContain('requireAuth(request)');
    expect(subscription).toContain('PARTNER_REQUIRED');
    expect(plans).toContain('/api/payments/subscriptions');
    expect(plans).toContain('/parceiro/onboarding');
  });

  it('bloqueia recursos pagos no backend', () => {
    const establishment = readFileSync(resolve(process.cwd(), 'app/api/parceiro/establishment/route.ts'), 'utf8');
    const analytics = readFileSync(resolve(process.cwd(), 'app/api/parceiro/analytics/route.ts'), 'utf8');
    expect(establishment).toContain('PLAN_UPGRADE_REQUIRED');
    expect(establishment).toContain('manage_agenda');
    expect(establishment).toContain('manage_promotions');
    expect(analytics).toContain('analytics_basic');
    expect(analytics).toContain('analytics_detailed');
  });

  it('permite cancelamento da assinatura pelo painel', () => {
    const billing = readFileSync(resolve(process.cwd(), 'app/api/parceiro/billing/route.ts'), 'utf8');
    expect(billing).toContain("method: 'PUT'");
    expect(billing).toContain("status: 'cancelled'");
    expect(billing).toContain('preapproval/');
  });
});

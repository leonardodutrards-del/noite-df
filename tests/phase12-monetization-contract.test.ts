import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Fase 12 - monetização', () => {
  it('mantém Mercado Pago e adiciona trial controlado por configuração', () => {
    const checkout = readFileSync(resolve(process.cwd(), 'app/api/payments/checkout/route.ts'), 'utf8');
    const plans = readFileSync(resolve(process.cwd(), 'components/PlanList.tsx'), 'utf8');
    expect(checkout).toContain('TRIAL_ENABLED');
    expect(checkout).toContain('getPaymentLink');
    expect(plans).toContain("'trial_start'");
    expect(plans).toContain("'subscription_checkout'");
  });

  it('não habilita trial implicitamente', () => {
    const env = readFileSync(resolve(process.cwd(), 'lib/env.ts'), 'utf8');
    expect(env).toContain('TRIAL_ENABLED');
    expect(env).toContain('false');
  });
});

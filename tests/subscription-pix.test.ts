import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const planList = readFileSync(resolve(process.cwd(), 'components/PlanList.tsx'), 'utf8');
const subscriptionRoute = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
const mercadoPago = readFileSync(resolve(process.cwd(), 'lib/mercado-pago.ts'), 'utf8');
const migration = readFileSync(resolve(process.cwd(), 'database/migrations/010_subscription_pix_plans.sql'), 'utf8');
const schema = readFileSync(resolve(process.cwd(), 'database/schema.sql'), 'utf8');
const plans = readFileSync(resolve(process.cwd(), 'lib/plans.ts'), 'utf8');

describe('Assinatura mensal com Pix', () => {
  it('oferece Pix sem remover o checkout atual', () => {
    expect(planList).toContain('Assinar com Pix');
    expect(planList).toContain("handleSubscribe(plan.id, 'pix')");
    expect(planList).toContain('QR Code');
    expect(planList).toContain('Copia e Cola');
    expect(planList).toContain('JSON.stringify({ planId, paymentMethod })');
  });

  it('usa os mesmos preços fixos do catálogo publicado', () => {
    expect(plans).toContain("priceCents: 5990");
    expect(plans).toContain("priceCents: 9990");
    expect(plans).toContain("priceCents: 15000");
    expect(subscriptionRoute).toContain('priceCents: plan.priceCents');
    expect(mercadoPago).toContain('transaction_amount: args.priceCents / 100');
  });

  it('cria plano Pix recorrente e checkout específico por assinante', () => {
    expect(subscriptionRoute).toContain("paymentMethod === 'pix'");
    expect(subscriptionRoute).toContain('getOrCreateMercadoPagoPixPlan');
    expect(subscriptionRoute).toContain('createMercadoPagoPixSubscription');
    expect(mercadoPago).toContain("frequency_type: 'months'");
    expect(mercadoPago).toContain("payment_methods: [{ id: 'pix' }]");
    expect(mercadoPago).toContain('preapproval_plan_id');
    expect(mercadoPago).toContain('payer_email: args.payerEmail');
  });

  it('não reutiliza URL de checkout e preserva trial/analytics', () => {
    expect(mercadoPago).not.toContain('return { id: rows[0].provider_plan_id, initPoint: rows[0].checkout_url }');
    expect(subscriptionRoute).toContain("currentStage === 'trial'");
    expect(subscriptionRoute).toContain("currentVisitStatus === 'signed'");
    expect(subscriptionRoute).toContain('subscription-pix-checkout-tracking');
  });

  it('mantém cache de plano no migration e schema canônico', () => {
    expect(migration).toContain('unique(provider, establishment_id, plan_code, payment_method)');
    expect(migration).toContain('payment_provider_plans_clients_denied');
    expect(schema).toContain('create table if not exists payment_provider_plans');
    expect(schema).toContain('payment_provider_plans_clients_denied');
  });
});

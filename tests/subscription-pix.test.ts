import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const planList = readFileSync(resolve(process.cwd(), 'components/PlanList.tsx'), 'utf8');
const subscriptionRoute = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
const mercadoPago = readFileSync(resolve(process.cwd(), 'lib/mercado-pago.ts'), 'utf8');
const plans = readFileSync(resolve(process.cwd(), 'lib/plans.ts'), 'utf8');

describe('Assinatura mensal com Pix', () => {
  it('oferece Pix sem remover o checkout atual', () => {
    expect(planList).toContain('Assinar com Pix');
    expect(planList).toContain("handleSubscribe(plan.id, 'pix')");
    expect(planList).toContain('QR Code');
    expect(planList).toContain('Copia e Cola');
  });

  it('usa os mesmos preços fixos do catálogo publicado', () => {
    expect(plans).toContain('priceCents: 5990');
    expect(plans).toContain('priceCents: 9990');
    expect(plans).toContain('priceCents: 15000');
    expect(subscriptionRoute).toContain('priceCents: plan.priceCents');
    expect(mercadoPago).toContain('transaction_amount: args.priceCents / 100');
  });

  it('usa o checkout padrão de assinatura do Mercado Pago, que oferece Pix', () => {
    expect(subscriptionRoute).toContain('createMercadoPagoPixCheckout');
    expect(mercadoPago).toContain("https://api.mercadopago.com/preapproval_plan");
    expect(mercadoPago).not.toContain("payment_types: [{ id: 'bank_transfer' }]");
    expect(mercadoPago).not.toContain("payment_methods: [{ id: 'pix' }]");
    expect(mercadoPago).toContain('typeof data.init_point');
  });

  it('mapeia a assinatura pelo preapproval_plan_id recebido no webhook', () => {
    expect(mercadoPago).toContain('preapproval_plan_id?: string');
    expect(mercadoPago).toContain('resolveSubscriptionReference');
    expect(mercadoPago).toContain('provider_plan_id=eq.');
    expect(mercadoPago).toContain('payment_provider_plans');
  });

  it('preserva trial e registra analytics no servidor', () => {
    expect(subscriptionRoute).toContain("currentStage === 'trial'");
    expect(subscriptionRoute).toContain("currentVisitStatus === 'signed'");
    expect(subscriptionRoute).toContain('subscription-pix-checkout-tracking');
    expect(subscriptionRoute).toContain('providerPlanId: pixCheckout.id');
  });
});

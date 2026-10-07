import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const planList = readFileSync(resolve(process.cwd(), 'components/PlanList.tsx'), 'utf8');
const subscriptionRoute = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
const mercadoPago = readFileSync(resolve(process.cwd(), 'lib/mercado-pago.ts'), 'utf8');
const migration = readFileSync(resolve(process.cwd(), 'database/migrations/010_subscription_pix_plans.sql'), 'utf8');

describe('Assinatura mensal com Pix', () => {
  it('oferece Pix sem remover o checkout atual', () => {
    expect(planList).toContain('Assinar com Pix');
    expect(planList).toContain("handleSubscribe(plan.id, 'pix')");
    expect(planList).toContain('QR Code');
    expect(planList).toContain('Copia e Cola');
    expect(planList).toContain('JSON.stringify({ planId, paymentMethod })');
  });

  it('cria plano recorrente mensal com Pix no Mercado Pago', () => {
    expect(subscriptionRoute).toContain("paymentMethod === 'pix'");
    expect(subscriptionRoute).toContain('getOrCreateMercadoPagoPixPlan');
    expect(mercadoPago).toContain("frequency_type: 'months'");
    expect(mercadoPago).toContain("payment_methods: [{ id: 'pix' }]");
    expect(mercadoPago).toContain('preapproval_plan');
  });

  it('mantém referência por estabelecimento e cacheia o checkout', () => {
    expect(mercadoPago).toContain('noite-df:${args.establishmentId}:${args.planCode}:pix');
    expect(migration).toContain('unique(provider, establishment_id, plan_code, payment_method)');
    expect(migration).toContain('payment_provider_plans_clients_denied');
  });
});

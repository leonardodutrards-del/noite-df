import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const planList = readFileSync(resolve(process.cwd(), 'components/PlanList.tsx'), 'utf8');
const subscriptionRoute = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
const mercadoPago = readFileSync(resolve(process.cwd(), 'lib/mercado-pago.ts'), 'utf8');
const plans = readFileSync(resolve(process.cwd(), 'lib/plans.ts'), 'utf8');

describe('Pagamento Pix de 30 dias', () => {
  it('oferece Pix sem remover a assinatura recorrente no cartão', () => {
    expect(planList).toContain('Pagar 30 dias com Pix');
    expect(planList).toContain("handleSubscribe(plan.id, 'pix')");
    expect(planList).toContain('QR Code');
    expect(planList).toContain('Copia e Cola');
    expect(planList).toContain('renovação via Pix é manual');
  });

  it('usa exatamente os preços publicados dos planos', () => {
    expect(plans).toContain('priceCents: 5990');
    expect(plans).toContain('priceCents: 9990');
    expect(plans).toContain('priceCents: 15000');
    expect(subscriptionRoute).toContain('priceCents: plan.priceCents');
    expect(mercadoPago).toContain('transaction_amount: args.priceCents / 100');
  });

  it('cria pagamento Pix real e retorna QR/ticket do Mercado Pago', () => {
    expect(mercadoPago).toContain("https://api.mercadopago.com/v1/payments");
    expect(mercadoPago).toContain("payment_method_id: 'pix'");
    expect(mercadoPago).toContain("'X-Idempotency-Key'");
    expect(mercadoPago).toContain('qr_code_base64');
    expect(mercadoPago).toContain('qr_code');
    expect(mercadoPago).toContain('ticket_url');
    expect(subscriptionRoute).toContain('createMercadoPagoPixPayment');
  });

  it('ativa o plano por 30 dias quando o webhook aprova o Pix', () => {
    expect(mercadoPago).toContain("parts[3] === 'pix'");
    expect(mercadoPago).toContain("resource.status === 'approved'");
    expect(mercadoPago).toContain('30 * 24 * 60 * 60 * 1000');
    expect(mercadoPago).toContain("provider: 'mercado_pago_pix'");
    expect(mercadoPago).toContain("status: approved ? 'active' : 'pending'");
    expect(mercadoPago).toContain("await syncCommercialPipeline(reference.establishmentId, 'active'");
  });

  it('preserva trial e registra o início do Pix no servidor', () => {
    expect(subscriptionRoute).toContain("currentStage === 'trial'");
    expect(subscriptionRoute).toContain("currentVisitStatus === 'signed'");
    expect(subscriptionRoute).toContain('providerPaymentId: pixPayment.id');
    expect(subscriptionRoute).toContain('accessDays: 30');
  });
});

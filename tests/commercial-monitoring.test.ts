import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pipeline = readFileSync(resolve(process.cwd(), 'modules/operations/pipeline.ts'), 'utf8');
const operationRoute = readFileSync(resolve(process.cwd(), 'app/api/admin/operacao/route.ts'), 'utf8');
const subscriptionRoute = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
const healthModule = readFileSync(resolve(process.cwd(), 'modules/admin/commercial-health.ts'), 'utf8');
const healthRoute = readFileSync(resolve(process.cwd(), 'app/api/admin/commercial-health/route.ts'), 'utf8');
const operationPage = readFileSync(resolve(process.cwd(), 'app/admin/operacao/page.tsx'), 'utf8');

describe('Acompanhamento comercial e primeira assinatura', () => {
  it('não reinicia trial ao salvar observações do CRM', () => {
    expect(pipeline).toContain("input.stage === 'trial' && input.trialPlanCode");
    expect(operationRoute).not.toContain("visitStatus === 'trial'\n            ? 'pro'");
  });

  it('checkout registra interesse sem rebaixar trial ou parceiro', () => {
    expect(subscriptionRoute).toContain('subscription-checkout-pipeline');
    expect(subscriptionRoute).toContain("currentStage === 'trial'");
    expect(subscriptionRoute).toContain("currentStage === 'partner'");
    expect(subscriptionRoute).toContain("visitStatus: 'interested'");
    expect(subscriptionRoute).toContain("contactChannel: 'mercado_pago_checkout'");
  });

  it('expõe saúde comercial apenas ao Master Admin', () => {
    expect(healthRoute).toContain('requireMasterAdmin');
    expect(healthRoute).toContain('getCommercialHealth');
  });

  it('verifica configuração de cobrança sem expor secrets', () => {
    expect(healthModule).toContain('MERCADO_PAGO_ACCESS_TOKEN');
    expect(healthModule).toContain('MERCADO_PAGO_WEBHOOK_SECRET');
    expect(healthModule).toContain('environmentReady');
    expect(healthModule).not.toContain('accessToken:');
    expect(healthModule).not.toContain('webhookSecret:');
  });

  it('acompanha follow-ups e primeiro pagamento em polling curto', () => {
    expect(operationPage).toContain('/api/admin/commercial-health');
    expect(operationPage).toContain('15000');
    expect(operationPage).toContain('Retornos vencidos');
    expect(operationPage).toContain('Primeira assinatura');
    expect(operationPage).toContain('Mostrar só retornos');
  });
});

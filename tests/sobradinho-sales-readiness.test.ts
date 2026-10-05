import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const onboarding = readFileSync(resolve(process.cwd(), 'app/parceiro/onboarding/page.tsx'), 'utf8');
const pipeline = readFileSync(resolve(process.cwd(), 'modules/operations/pipeline.ts'), 'utf8');
const operation = readFileSync(resolve(process.cwd(), 'app/admin/operacao/page.tsx'), 'utf8');
const places = readFileSync(resolve(process.cwd(), 'data/seeds/places-2026-09.ts'), 'utf8');
const mercadoPago = readFileSync(resolve(process.cwd(), 'lib/mercado-pago.ts'), 'utf8');
const subscription = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');

describe('Prontidão comercial de Sobradinho', () => {
  it('permite onboarding autenticado por cookie e inclui Sobradinho', () => {
    expect(onboarding).toContain("'Sobradinho'");
    expect(onboarding).not.toContain("localStorage.getItem('auth_token')");
    expect(onboarding).not.toContain('Authorization: `Bearer');
    expect(onboarding).toContain('/login?redirect=/parceiro/onboarding');
  });

  it('mantém novos estabelecimentos no CRM sem depender de backfill manual', () => {
    expect(pipeline).toContain("partner_pipeline?on_conflict=establishment_id");
    expect(pipeline).toContain('resolution=merge-duplicates');
    expect(operation).toContain("useState('Sobradinho')");
    expect(operation).toContain('CRM dos {items.length} estabelecimentos');
  });

  it('inclui as duas unidades confirmadas do Palorama', () => {
    expect(places).toContain("'palorama-sobradinho-i'");
    expect(places).toContain("'palorama-sobradinho-ii'");
  });

  it('liga checkout e assinatura ao acompanhamento comercial', () => {
    expect(subscription).toContain("'subscription_checkout'");
    expect(mercadoPago).toContain('syncCommercialPipeline');
    expect(mercadoPago).toContain("stage: subscriptionStatus === 'active' ? 'partner' : 'paused'");
  });
});

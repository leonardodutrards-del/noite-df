import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const onboarding = readFileSync(resolve(process.cwd(), 'app/parceiro/onboarding/page.tsx'), 'utf8');
const pipeline = readFileSync(resolve(process.cwd(), 'modules/operations/pipeline.ts'), 'utf8');
const operation = readFileSync(resolve(process.cwd(), 'app/admin/operacao/page.tsx'), 'utf8');
const operationRoute = readFileSync(resolve(process.cwd(), 'app/api/admin/operacao/route.ts'), 'utf8');
const activationRoute = readFileSync(resolve(process.cwd(), 'app/api/admin/partners/activate/route.ts'), 'utf8');
const partnershipService = readFileSync(resolve(process.cwd(), 'modules/partnerships/service.ts'), 'utf8');
const salesPage = readFileSync(resolve(process.cwd(), 'app/parceiros/sobradinho/page.tsx'), 'utf8');
const migration = readFileSync(resolve(process.cwd(), 'database/migrations/009_sobradinho_sales_crm.sql'), 'utf8');
const places = readFileSync(resolve(process.cwd(), 'data/seeds/places-2026-09.ts'), 'utf8');
const mercadoPago = readFileSync(resolve(process.cwd(), 'lib/mercado-pago.ts'), 'utf8');
const subscription = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
const entitlements = readFileSync(resolve(process.cwd(), 'modules/payments/entitlements.ts'), 'utf8');

describe('Prontidão comercial de Sobradinho', () => {
  it('permite onboarding autenticado por cookie e inclui Sobradinho', () => {
    expect(onboarding).toContain("'Sobradinho'");
    expect(onboarding).not.toContain("localStorage.getItem('auth_token')");
    expect(onboarding).not.toContain('Authorization:');
    expect(onboarding).toContain('/login?redirect=/parceiro/onboarding');
  });

  it('mantém todo estabelecimento novo dentro do CRM', () => {
    expect(pipeline).toContain("partner_pipeline?on_conflict=establishment_id");
    expect(pipeline).toContain('resolution=merge-duplicates');
    expect(migration).toContain('ensure_partner_pipeline_row');
    expect(migration).toContain('establishments_partner_pipeline_after_insert');
  });

  it('transforma a operação em CRM de visita presencial', () => {
    expect(migration).toContain('visit_status');
    expect(migration).toContain('visited_at');
    expect(migration).toContain('visit_notes');
    expect(operation).toContain('Visitei');
    expect(operation).toContain('Falei com o dono');
    expect(operation).toContain('Interessado');
    expect(operation).toContain('Próximo retorno');
    expect(operationRoute).toContain('stageForVisitStatus');
  });

  it('permite ao Master Admin vincular rapidamente uma conta existente', () => {
    expect(activationRoute).toContain('requireMasterAdmin');
    expect(activationRoute).toContain('activatePartnerByEmail');
    expect(partnershipService).toContain('partner_manual_activation');
    expect(partnershipService).toContain("role: 'partner'");
    expect(operation).toContain('Ativar parceiro');
  });

  it('possui página comercial específica para Sobradinho', () => {
    expect(salesPage).toContain('Sobradinho · operação local');
    expect(salesPage).toContain('Estabelecimentos mapeados');
    expect(salesPage).toContain('/cadastro');
    expect(salesPage).toContain('/planos');
    expect(places).toContain("'palorama-sobradinho-i'");
    expect(places).toContain("'palorama-sobradinho-ii'");
  });

  it('liga checkout, trial e assinatura ao acompanhamento comercial', () => {
    expect(subscription).toContain("'subscription_checkout'");
    expect(entitlements).toContain("visit_status: 'trial'");
    expect(mercadoPago).toContain('syncCommercialPipeline');
    expect(mercadoPago).toContain("stage: subscriptionStatus === 'active' ? 'partner' : 'paused'");
    expect(mercadoPago).toContain("visit_status: 'signed'");
  });
});

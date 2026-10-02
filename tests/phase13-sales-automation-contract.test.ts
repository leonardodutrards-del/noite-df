import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(resolve(process.cwd(), 'database/migrations/009_sales_automation.sql'), 'utf8');
const subscription = readFileSync(resolve(process.cwd(), 'app/api/payments/subscriptions/route.ts'), 'utf8');
const trial = readFileSync(resolve(process.cwd(), 'app/api/parceiro/trial/route.ts'), 'utf8');
const mercadoPago = readFileSync(resolve(process.cwd(), 'lib/mercado-pago.ts'), 'utf8');
const operation = readFileSync(resolve(process.cwd(), 'app/admin/operacao/page.tsx'), 'utf8');

describe('Fase 13 — automação comercial', () => {
  it('inclui novos estabelecimentos automaticamente no funil', () => {
    expect(migration).toContain('establishments_create_pipeline');
    expect(migration).toContain('ensure_partner_pipeline_record');
    expect(migration).toContain("values (new.id, 'uncontacted'");
  });

  it('move assinatura ativa para parceiro', () => {
    expect(migration).toContain('subscription_accounts_sync_pipeline');
    expect(migration).toContain("new.status = 'active'");
    expect(mercadoPago).toContain("stage: 'partner'");
  });

  it('registra trial e checkout como eventos comerciais', () => {
    expect(subscription).toContain("action: 'subscription_checkout'");
    expect(trial).toContain("action: 'trial_start'");
  });

  it('oferece operação presencial e filtros comerciais', () => {
    expect(operation).toContain('Apresentado hoje');
    expect(operation).toContain('regionFilter');
    expect(operation).toContain('stageFilter');
    expect(operation).toContain('nextFollowUpAt');
  });
});

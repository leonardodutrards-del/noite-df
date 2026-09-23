import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const overview = readFileSync(resolve(process.cwd(), 'modules/admin/overview.ts'), 'utf8');
const route = readFileSync(resolve(process.cwd(), 'app/api/admin/overview/route.ts'), 'utf8');
const adminPage = readFileSync(resolve(process.cwd(), 'app/admin/page.tsx'), 'utf8');
const authService = readFileSync(resolve(process.cwd(), 'modules/auth/service.ts'), 'utf8');

describe('Fase 9 — visão geral real do Master Admin', () => {
  it('protege a visão geral com Master Admin', () => {
    expect(route).toContain('requireMasterAdmin(request)');
  });

  it('agrega números reais do Supabase', () => {
    expect(overview).toContain("countRows('profiles')");
    expect(overview).toContain("countRows('establishments')");
    expect(overview).toContain("countRows('partner_claims'");
    expect(overview).toContain("countRows('subscription_accounts'");
    expect(overview).toContain('monthlyRecurringRevenueCents');
    expect(overview).toContain('interactions30d');
  });

  it('exibe métricas reais no painel Master', () => {
    expect(adminPage).toContain("fetch('/api/admin/overview')");
    expect(adminPage).toContain('overview?.users');
    expect(adminPage).toContain('overview?.monthlyRecurringRevenueCents');
    expect(adminPage).toContain('overview?.views30d');
  });

  it('lê auditoria persistida no Supabase em produção', () => {
    expect(authService).toContain('/rest/v1/audit_log?select=*');
    expect(authService).toContain('order=created_at.desc');
  });
});

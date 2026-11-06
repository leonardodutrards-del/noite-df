import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve(process.cwd(), 'app/parceiro/page.tsx'), 'utf8');
const route = readFileSync(resolve(process.cwd(), 'app/api/parceiro/analytics/route.ts'), 'utf8');

describe('períodos de analytics por plano', () => {
  it('oferece períodos estendidos apenas a quem tem analytics detalhado', () => {
    expect(page).toContain("entitlements?.capabilities.includes('analytics_detailed')");
    expect(page).toContain('<option value={90}>Últimos 90 dias</option>');
    expect(page).toContain('<option value={180}>Últimos 180 dias</option>');
    expect(page).toContain('<option value={365}>Últimos 12 meses</option>');
  });

  it('mantém o limite do servidor alinhado ao benefício contratado', () => {
    expect(route).toContain("const maxDays = detailed ? 365 : 30");
    expect(page).toContain('effectivePeriodDays');
    expect(page).toContain('Math.min(periodDays, 30)');
  });
});

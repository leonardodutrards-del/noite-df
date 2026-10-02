import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const admin = readFileSync(resolve(process.cwd(), 'app/admin/page.tsx'), 'utf8');
const operation = readFileSync(resolve(process.cwd(), 'app/admin/operacao/page.tsx'), 'utf8');
const overview = readFileSync(resolve(process.cwd(), 'modules/admin/overview.ts'), 'utf8');

describe('Fase 14 — painel quase em tempo real', () => {
  it('atualiza a visão geral automaticamente', () => {
    expect(admin).toContain('setInterval');
    expect(admin).toContain('/api/admin/overview');
    expect(admin).toContain('Atualização automática');
  });

  it('mantém CRM atualizado automaticamente', () => {
    expect(operation).toContain('setInterval');
    expect(operation).toContain('15000');
  });

  it('expõe métricas de trial e checkout no overview', () => {
    expect(overview).toContain('trialStarts30d');
    expect(overview).toContain('checkoutStarts30d');
  });
});

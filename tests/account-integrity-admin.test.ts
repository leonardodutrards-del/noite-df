import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const moduleSource = readFileSync(resolve(process.cwd(), 'modules/admin/account-integrity.ts'), 'utf8');
const routeSource = readFileSync(resolve(process.cwd(), 'app/api/admin/account-integrity/route.ts'), 'utf8');
const pageSource = readFileSync(resolve(process.cwd(), 'app/admin/page.tsx'), 'utf8');

describe('Integridade das contas no Master Admin', () => {
  it('compara Supabase Auth com profiles', () => {
    expect(moduleSource).toContain('/auth/v1/admin/users');
    expect(moduleSource).toContain('authWithoutProfile');
    expect(moduleSource).toContain('profilesWithoutAuth');
    expect(moduleSource).toContain('duplicateEmailGroups');
  });

  it('expõe a verificação apenas ao Master Admin', () => {
    expect(routeSource).toContain('requireMasterAdmin');
    expect(routeSource).toContain('getAccountIntegrity');
  });

  it('mostra o estado no painel administrativo e atualiza periodicamente', () => {
    expect(pageSource).toContain('Integridade das contas');
    expect(pageSource).toContain('Auth sem profile');
    expect(pageSource).toContain('Profile sem Auth');
    expect(pageSource).toContain('E-mails duplicados');
    expect(pageSource).toContain('60000');
  });
});

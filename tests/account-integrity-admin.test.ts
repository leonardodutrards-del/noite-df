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
    expect(moduleSource).toContain('PAGE_SIZE = 1000');
    expect(moduleSource).toContain("Range:");
    expect(moduleSource).toContain("Prefer: 'count=exact'");
    expect(moduleSource).toContain("order=created_at.desc,id.asc");
    expect(moduleSource).toContain("content-range");
    expect(moduleSource).toContain('!profile.auth_user_id || !authIds.has(profile.auth_user_id)');
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
    expect(pageSource).toContain('accountIntegrityError');
    expect(pageSource).toContain('Indisponível');
    expect(pageSource).toContain('A última leitura foi descartada');
    expect(pageSource).toContain('let inFlight = false');
    expect(pageSource).toContain('if (inFlight) return');
  });
});

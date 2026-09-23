import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const session = readFileSync(resolve(process.cwd(), 'modules/auth/session.ts'), 'utf8');
const adminLayout = readFileSync(resolve(process.cwd(), 'app/admin/layout.tsx'), 'utf8');
const signup = readFileSync(resolve(process.cwd(), 'app/api/auth/signup/route.ts'), 'utf8');
const supabaseAuth = readFileSync(resolve(process.cwd(), 'lib/supabase-auth.ts'), 'utf8');
const login = readFileSync(resolve(process.cwd(), 'app/api/auth/login/route.ts'), 'utf8');
const middleware = readFileSync(resolve(process.cwd(), 'middleware.ts'), 'utf8');
const adminPage = readFileSync(resolve(process.cwd(), 'app/admin/page.tsx'), 'utf8');

describe('Fase 8 — Master Admin e hardening geral', () => {
  it('exige papel admin e e-mail secreto para Master Admin', () => {
    expect(session).toContain('MASTER_ADMIN_EMAIL');
    expect(session).toContain("user.role !== 'admin'");
    expect(session).toContain("user.email.trim().toLowerCase() === allowedEmail");
  });

  it('oculta /admin de usuários não autorizados com 404 server-side', () => {
    expect(adminLayout).toContain('requireMasterAdmin');
    expect(adminLayout).toContain('notFound()');
  });

  it('impede elevação de privilégio pelo cadastro público', () => {
    expect(signup).toContain("role: 'visitor'");
    expect(supabaseAuth).toContain("const role: UserRole = 'visitor'");
    expect(supabaseAuth).not.toContain("role: (metadata.role as UserRole)");
  });

  it('protege login contra força bruta', () => {
    expect(login).toContain('checkAuthRateLimit');
    expect(login).toContain('status: 429');
  });

  it('aplica headers de segurança globais', () => {
    expect(middleware).toContain('Strict-Transport-Security');
    expect(middleware).toContain('Content-Security-Policy');
    expect(middleware).toContain("X-Frame-Options', 'DENY'");
    expect(middleware).toContain("X-Content-Type-Options', 'nosniff'");
  });

  it('leva a moderação de claims para o painel Master', () => {
    expect(adminPage).toContain("fetch('/api/admin/claims')");
    expect(adminPage).toContain('handleClaimReview');
    expect(adminPage).toContain('Solicitações');
  });
});

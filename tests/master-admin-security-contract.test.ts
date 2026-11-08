import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const session = readFileSync(resolve(process.cwd(), 'modules/auth/session.ts'), 'utf8');
const authorization = readFileSync(resolve(process.cwd(), 'modules/auth/authorization.ts'), 'utf8');
const schema = readFileSync(resolve(process.cwd(), 'database/schema.sql'), 'utf8');
const hardening = readFileSync(resolve(process.cwd(), 'database/migrations/015_profile_and_rate_limit_hardening.sql'), 'utf8');
const adminLayout = readFileSync(resolve(process.cwd(), 'app/admin/layout.tsx'), 'utf8');
const signup = readFileSync(resolve(process.cwd(), 'app/api/auth/signup/route.ts'), 'utf8');
const supabaseAuth = readFileSync(resolve(process.cwd(), 'lib/supabase-auth.ts'), 'utf8');
const login = readFileSync(resolve(process.cwd(), 'app/api/auth/login/route.ts'), 'utf8');
const middleware = readFileSync(resolve(process.cwd(), 'middleware.ts'), 'utf8');
const adminPage = readFileSync(resolve(process.cwd(), 'app/admin/page.tsx'), 'utf8');

describe('Fase 8 — Master Admin e hardening geral', () => {
  it('aceita papel master_admin e mantém compatibilidade com admin + e-mail secreto', () => {
    expect(authorization).toContain("user.role === 'master_admin'");
    expect(authorization).toContain('MASTER_ADMIN_EMAIL');
    expect(authorization).toContain("user.role !== 'admin'");
    expect(authorization).toContain("user.email.trim().toLowerCase() === allowedEmail");
    expect(session).toContain("export { isMasterAdminUser } from './authorization'");
  });

  it('bloqueia atualização direta de papel e mantém rate limit em search_path seguro', () => {
    expect(schema).toContain("'master_admin'");
    expect(schema).not.toContain('create policy "users_update_own_profile" on profiles');
    expect(hardening).toContain('drop policy if exists users_update_own_profile on public.profiles');
    expect(hardening).toContain("set search_path = ''");
    expect(hardening).toContain('pg_catalog.pg_advisory_xact_lock');
  });

  it('oculta /admin de usuários não autorizados e redireciona sessão expirada', () => {
    expect(adminLayout).toContain('requireMasterAdmin');
    expect(adminLayout).toContain("redirect('/login?redirect=/admin')");
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

  it('renova sessão Supabase antes de proteger o Master Admin', () => {
    expect(login).toContain('REFRESH_COOKIE_NAME');
    expect(middleware).toContain("REFRESH_COOKIE_NAME = 'noite_df_refresh'");
    expect(middleware).toContain('grant_type=refresh_token');
    expect(middleware).toContain('refresh_token: refreshToken');
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

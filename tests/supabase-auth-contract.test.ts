import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const authAdapter = readFileSync(resolve(process.cwd(), 'lib/supabase-auth.ts'), 'utf8');
const authService = readFileSync(resolve(process.cwd(), 'modules/auth/service.ts'), 'utf8');
const resetRoute = readFileSync(resolve(process.cwd(), 'app/api/auth/password-reset/route.ts'), 'utf8');
const schema = readFileSync(resolve(process.cwd(), 'database/schema.sql'), 'utf8');

describe('Fase 3 — Supabase Auth', () => {
  it('usa Supabase Auth para cadastro, login e validação de sessão em produção', () => {
    expect(authService).toContain('isSupabaseAuthEnabled()');
    expect(authService).toContain('supabasePasswordSignUp(input)');
    expect(authService).toContain('supabasePasswordLogin(');
    expect(authService).toContain('supabaseValidateAccessToken(token)');
  });

  it('vincula o usuário autenticado ao perfil pelo auth_user_id', () => {
    expect(authAdapter).toContain('auth_user_id');
    expect(authAdapter).toContain('getProfileByAuthId');
    expect(schema).toContain('auth_user_id uuid unique references auth.users(id)');
  });

  it('não persiste senha no perfil da aplicação', () => {
    expect(authAdapter).not.toContain('password_hash');
    expect(schema).not.toContain('password_hash');
  });

  it('oferece recuperação de senha sem revelar se o e-mail existe', () => {
    expect(resetRoute).toContain('supabaseSendPasswordReset');
    expect(resetRoute).toContain('Se o e-mail estiver cadastrado');
  });
});

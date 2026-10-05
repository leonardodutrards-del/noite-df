import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migration = readFileSync(
  resolve(process.cwd(), 'database/migrations/010_auth_profile_persistence_guard.sql'),
  'utf8'
);
const schema = readFileSync(resolve(process.cwd(), 'database/schema.sql'), 'utf8');
const auth = readFileSync(resolve(process.cwd(), 'lib/supabase-auth.ts'), 'utf8');
const signupRoute = readFileSync(resolve(process.cwd(), 'app/api/auth/signup/route.ts'), 'utf8');
const resendRoute = readFileSync(
  resolve(process.cwd(), 'app/api/auth/resend-confirmation/route.ts'),
  'utf8'
);
const loginPage = readFileSync(resolve(process.cwd(), 'app/login/page.tsx'), 'utf8');

describe('Persistência crítica de contas', () => {
  it('cria perfil automaticamente no mesmo fluxo do Supabase Auth', () => {
    expect(migration).toContain('sync_profile_from_auth_user');
    expect(migration).toContain('after insert on auth.users');
    expect(migration).toContain('auth_user_profile_sync_after_insert');
    expect(migration).toContain("'visitor'");
    expect(schema).toContain('auth_user_profile_sync_after_insert');
  });

  it('recupera contas antigas que ficaram sem profile', () => {
    expect(migration).toContain('from auth.users u');
    expect(migration).toContain('left join public.profiles p on p.auth_user_id = u.id');
    expect(migration).toContain("where p.id is null");
  });

  it('não transforma timeout secundário de profile em falso fracasso do signup', () => {
    expect(auth).toContain('getProfileByAuthIdOnce');
    expect(auth).toContain('for (let attempt = 0; attempt < 4; attempt += 1)');
    expect(auth).toContain("console.error('profile-read-after-retries'");
    expect(auth).toContain("id: `usr_${authUserId}`");
    expect(auth).not.toContain('const user = await upsertProfile({\n    authUserId: payload.user.id');
  });

  it('protege cadastro contra repetição abusiva', () => {
    expect(signupRoute).toContain('checkAuthRateLimit');
    expect(signupRoute).toContain('limit: 5');
    expect(signupRoute).toContain('windowSeconds: 15 * 60');
  });

  it('permite recuperar confirmação de e-mail sem recriar a conta', () => {
    expect(auth).toContain('supabaseResendSignupConfirmation');
    expect(auth).toContain("type: 'signup'");
    expect(resendRoute).toContain('checkAuthRateLimit');
    expect(loginPage).toContain('Reenviar confirmação de e-mail');
    expect(loginPage).toContain('/api/auth/resend-confirmation');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { authService } from '@/modules/auth/service';

describe('AuthService — Login, Signup, Logout e Sessão', () => {
  beforeEach(() => {
    authService.resetToDefaults();
  });

  it('permite login com credenciais válidas e retorna dados do usuário sanitizados', async () => {
    const result = await authService.login({
      email: 'parceiro@fivebar.com.br',
      password: 'Parceiro@123456',
    });

    expect(result.token).toBeDefined();
    expect(result.token.length).toBeGreaterThan(20);
    expect(result.user.email).toBe('parceiro@fivebar.com.br');
    expect(result.user.role).toBe('partner');
    expect(result.user.establishmentId).toBe('five-sport-bar');
    // Segredos como senha não devem ser expostos no objeto retornado
    expect((result.user as unknown as { passwordHash?: string }).passwordHash).toBeUndefined();
  });

  it('rejeita login com senha inválida', async () => {
    await expect(
      authService.login({
        email: 'parceiro@fivebar.com.br',
        password: 'SenhaIncorreta@999',
      })
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('rejeita login com e-mail não cadastrado', async () => {
    await expect(
      authService.login({
        email: 'naoexiste@bar.com.br',
        password: 'Parceiro@123456',
      })
    ).rejects.toThrow('Credenciais inválidas');
  });

  it('atualiza lastSignInAt no login e registra evento na auditoria', async () => {
    const beforeLogin = new Date().toISOString();

    const result = await authService.login({
      email: 'admin@noitedf.com.br',
      password: 'Admin@123456',
    });

    expect(result.user.lastSignInAt).toBeDefined();
    expect(new Date(result.user.lastSignInAt!).getTime()).toBeGreaterThanOrEqual(
      new Date(beforeLogin).getTime() - 1000
    );

    const logs = await authService.getAuditLogs();
    const loginLog = logs.find((l) => l.action === 'login' && l.actorEmail === 'admin@noitedf.com.br');
    expect(loginLog).toBeDefined();
    expect(loginLog?.entityType).toBe('auth');
  });

  it('permite cadastro de novo parceiro sem exigir 2FA e com papel partner', async () => {
    const signupResult = await authService.signUp({
      name: 'João Silva',
      email: 'joao@bardogalego.com.br',
      password: 'SenhaForte@2026',
      establishmentName: 'Bar do Galego',
    });

    expect(signupResult.token).toBeDefined();
    expect(signupResult.user.name).toBe('João Silva');
    expect(signupResult.user.email).toBe('joao@bardogalego.com.br');
    expect(signupResult.user.role).toBe('partner');
    expect(signupResult.user.establishmentId).toBe('bar-do-galego');
    expect(signupResult.user.createdAt).toBeDefined();
    expect(signupResult.user.lastSignInAt).toBeDefined();

    // Valida que a conta criada pode logar normalmente
    const loginResult = await authService.login({
      email: 'joao@bardogalego.com.br',
      password: 'SenhaForte@2026',
    });
    expect(loginResult.user.id).toBe(signupResult.user.id);
  });

  it('impede cadastro com e-mail duplicado', async () => {
    await expect(
      authService.signUp({
        name: 'Carlos Duplicado',
        email: 'parceiro@fivebar.com.br',
        password: 'OutraSenha@123',
      })
    ).rejects.toThrow('Este e-mail já está cadastrado');
  });

  it('valida sessão ativa e invalida no logout', async () => {
    const { token, user } = await authService.login({
      email: 'parceiro@pinella.com.br',
      password: 'Parceiro@123456',
    });

    const activeSessionUser = await authService.validateSession(token);
    expect(activeSessionUser).not.toBeNull();
    expect(activeSessionUser?.id).toBe(user.id);

    // Logout
    await authService.logout(token);

    const expiredSessionUser = await authService.validateSession(token);
    expect(expiredSessionUser).toBeNull();
  });
});

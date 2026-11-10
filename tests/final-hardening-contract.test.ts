import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const authService = readFileSync(resolve(process.cwd(), 'modules/auth/service.ts'), 'utf8');
const signupRoute = readFileSync(resolve(process.cwd(), 'app/api/auth/signup/route.ts'), 'utf8');
const signupPage = readFileSync(resolve(process.cwd(), 'app/cadastro/usuario/page.tsx'), 'utf8');
const signupChoicePage = readFileSync(resolve(process.cwd(), 'app/cadastro/page.tsx'), 'utf8');
const partnerSignupPage = readFileSync(resolve(process.cwd(), 'app/cadastro/estabelecimento/page.tsx'), 'utf8');
const partnerOnboardingPage = readFileSync(resolve(process.cwd(), 'app/parceiro/onboarding/page.tsx'), 'utf8');
const loginPage = readFileSync(resolve(process.cwd(), 'app/login/page.tsx'), 'utf8');
const visitorSignupPage = readFileSync(resolve(process.cwd(), 'app/visitante/cadastro/page.tsx'), 'utf8');
const visitorLoginPage = readFileSync(resolve(process.cwd(), 'app/visitante/login/page.tsx'), 'utf8');
const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf8');

describe('Hardening final de produção', () => {
  it('remove identidade administrativa demo do runtime', () => {
    expect(authService).not.toContain('admin@noitedf.com.br');
    expect(authService).not.toContain("input.role ?? 'partner'");
  });

  it('mantém cadastro público sem elevação de privilégios', () => {
    expect(signupRoute).toContain("role: 'visitor'");
    expect(signupChoicePage).toContain('/cadastro/usuario');
    expect(signupChoicePage).toContain('/cadastro/estabelecimento');
    expect(signupChoicePage).toContain('acompanhe a programação');
    expect(signupPage).toContain('Não é necessário cadastrar um estabelecimento.');
    expect(partnerSignupPage).toContain('/parceiro/onboarding');
    expect(partnerOnboardingPage).toContain('Solicitação enviada');
    expect(partnerOnboardingPage).not.toContain('Abrir painel do parceiro');
    const partnershipService = readFileSync(resolve(process.cwd(), 'modules/partnerships/service.ts'), 'utf8');
    expect(partnershipService).toContain("if (!selectedId && existingRows.length > 0)");
    expect(partnershipService).toContain("CLAIM_ESTABLISHMENT_ALREADY_EXISTS");
  });

  it('aposenta telas legadas de autenticação de visitante', () => {
    expect(visitorSignupPage).toContain("redirect('/cadastro')");
    expect(visitorLoginPage).toContain("redirect('/login')");
    expect(loginPage).not.toContain('/api/auth/visitor-login');
    expect(loginPage).toContain("router.push('/');");
    expect(loginPage).toContain("role === 'partner'");
  });

  it('não cria cookie vazio quando Supabase exige confirmação de e-mail', () => {
    expect(signupRoute).toContain('requiresEmailConfirmation');
    expect(signupRoute).toContain('if (token)');
    expect(signupPage).toContain('confirmacao=pendente');
    expect(loginPage).toContain('confirmationPending');
  });

  it('documenta a arquitetura real de produção', () => {
    expect(readme).toContain('Supabase Auth');
    expect(readme).toContain('MASTER_ADMIN_EMAIL');
    expect(readme).not.toContain('Ainda não há Supabase');
  });
});

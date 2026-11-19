import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const plansRoute = readFileSync(resolve(process.cwd(), 'app/planos/page.tsx'), 'utf8');
const legacyOffer = readFileSync(resolve(process.cwd(), 'app/divulgar/page.tsx'), 'utf8');
const home = readFileSync(resolve(process.cwd(), 'components/ExperienceHub.tsx'), 'utf8');
const planList = readFileSync(resolve(process.cwd(), 'components/PlanList.tsx'), 'utf8');

describe('navegação e oferta comercial', () => {
  it('mantém /planos como página canônica dos planos regulares', () => {
    expect(plansRoute).toContain('PLAN_CATALOG');
    expect(plansRoute).toContain('PlanList');
    expect(plansRoute).toContain('Escolha o plano ideal para sua operação');
  });

  it('redireciona a rota antiga de divulgação assistida para os planos', () => {
    expect(legacyOffer).toContain("redirect('/planos')");
  });

  it('apresenta planos regulares na página inicial', () => {
    expect(home).toContain('href="/planos"');
    expect(home).not.toContain('Divulgação assistida por R$30');
  });

  it('não exibe checkout promocional de teste gratuito', () => {
    expect(planList).not.toContain('handleTrial');
    expect(planList).not.toContain('Ativar 1 mês grátis');
  });
});

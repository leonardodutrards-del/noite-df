import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const plansRoute = readFileSync(resolve(process.cwd(), 'app/planos/page.tsx'), 'utf8');

describe('navegação dos planos', () => {
  it('direciona a oferta comercial assistida para a página de divulgação', () => {
    expect(plansRoute).toContain("redirect('/divulgar')");
    expect(plansRoute).not.toContain("redirect('/assinaturas')");
  });
});

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const plansRoute = readFileSync(resolve(process.cwd(), 'app/planos/page.tsx'), 'utf8');

describe('navegação dos planos', () => {
  it('direciona CTAs de planos para o catálogo de assinaturas', () => {
    expect(plansRoute).toContain("redirect('/assinaturas')");
    expect(plansRoute).not.toContain("redirect('/divulgar')");
  });
});

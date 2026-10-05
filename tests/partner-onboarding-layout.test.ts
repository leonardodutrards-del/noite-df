import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const page = readFileSync(resolve(process.cwd(), 'app/parceiro/onboarding/page.tsx'), 'utf8');
const css = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');

describe('Layout do onboarding do parceiro', () => {
  it('não depende de classes Tailwind inexistentes', () => {
    expect(page).not.toContain('min-h-screen');
    expect(page).not.toContain('grid md:grid-cols-2');
    expect(page).not.toContain('bg-white rounded-lg shadow-lg');
  });

  it('usa a grade responsiva nativa do Noite DF', () => {
    expect(page).toContain('partner-form-grid');
    expect(page).toContain('partner-onboarding-card');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toContain('@media(max-width:700px)');
  });

  it('usa validação visual própria em vez do balão nativo do navegador', () => {
    expect(page).toContain('noValidate');
    expect(page).toContain('Preencha nome do estabelecimento, região e endereço');
  });
});

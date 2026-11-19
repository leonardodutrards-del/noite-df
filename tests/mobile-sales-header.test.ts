import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const plans = readFileSync(resolve(process.cwd(), 'app/assinaturas/page.tsx'), 'utf8');
const pitch = readFileSync(resolve(process.cwd(), 'app/planos/page.tsx'), 'utf8');
const legacy = readFileSync(resolve(process.cwd(), 'app/divulgar/page.tsx'), 'utf8');
const css = readFileSync(resolve(process.cwd(), 'app/globals.css'), 'utf8');

describe('Cabeçalho comercial no mobile', () => {
  it('usa cabeçalho comercial na página canônica de planos e redireciona a rota antiga', () => {
    expect(plans).toContain('topbar sales-topbar');
    expect(pitch).toContain('topbar sales-topbar');
    expect(legacy).toContain("redirect('/planos')");
  });

  it('organiza os links em grade sem scroll horizontal no celular', () => {
    expect(css).toContain('.sales-topbar nav');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))');
    expect(css).toContain('overflow: visible');
    expect(css).toContain('white-space: normal');
  });
});

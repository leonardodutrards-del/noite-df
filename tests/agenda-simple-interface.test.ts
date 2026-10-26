import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const editor = readFileSync('components/AgendaEditor.tsx', 'utf8');
const page = readFileSync('app/admin/agenda/page.tsx', 'utf8');
describe('simplified administrative agenda', () => {
  it('groups the essential fields and separates optional artwork', () => {
    for (const text of ['1. Onde e o quê?', '2. Quando acontece?', '3. Confira e salve', 'Adicionar imagem · opcional', 'Salvar rascunho', 'Publicar programação']) expect(editor).toContain(text);
    expect(editor).toContain('<details className="agenda-extra"');
  });
  it('preserves source confirmation, concurrency protection and admin authentication', () => {
    expect(editor).toContain('sourceConfirmed: confirmed');
    expect(editor).toContain('expectedUpdatedAt: editing.updated_at');
    expect(page).toContain('requireMasterAdmin()');
    expect(editor).toContain('Conferi a fonte oficial, data, horário e local');
  });
});

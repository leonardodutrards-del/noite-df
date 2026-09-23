import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repository = readFileSync(
  resolve(process.cwd(), 'infrastructure/repositories/supabase-establishment-repository.ts'),
  'utf8'
);
const schema = readFileSync(resolve(process.cwd(), 'database/schema.sql'), 'utf8');
const migration = readFileSync(
  resolve(process.cwd(), 'database/migrations/007_establishment_operational_content.sql'),
  'utf8'
);

describe('Conteúdo operacional estruturado dos estabelecimentos', () => {
  it('versiona agenda, horários, cardápio, entrada e fonte de contato', () => {
    for (const field of [
      'agenda_url text',
      'operating_hours jsonb',
      'menu jsonb',
      'admission_note text',
      'contact_source_url text',
      'contact_checked_at date',
    ]) {
      expect(schema).toContain(field);
      expect(migration).toContain(field);
    }
  });

  it('mapeia os campos operacionais do Supabase para o domínio', () => {
    expect(repository).toContain('row.agenda_url');
    expect(repository).toContain('row.operating_hours');
    expect(repository).toContain('row.menu');
    expect(repository).toContain('row.admission_note');
    expect(repository).toContain('row.contact_source_url');
  });
});

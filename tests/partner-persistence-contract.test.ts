import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schema = readFileSync(resolve(process.cwd(), 'database/schema.sql'), 'utf8');
const migration = readFileSync(
  resolve(process.cwd(), 'database/migrations/004_partner_operational_snapshot.sql'),
  'utf8'
);
const repository = readFileSync(
  resolve(process.cwd(), 'infrastructure/repositories/supabase-establishment-repository.ts'),
  'utf8'
);

describe('Fase 4 — persistência do painel parceiro', () => {
  it('persiste os campos operacionais editáveis', () => {
    for (const field of [
      'vibe text[]',
      'music text[]',
      'audience text[]',
      'crowd_status text',
      'weekly_schedule jsonb',
      'current_promotion jsonb',
      'owner_managed boolean',
      'public_ratings jsonb',
    ]) {
      expect(schema).toContain(field);
      expect(migration).toContain(field.split(' ')[0]);
    }
  });

  it('mapeia os campos snake_case do Supabase para o domínio', () => {
    expect(repository).toContain('row.crowd_status');
    expect(repository).toContain('row.weekly_schedule');
    expect(repository).toContain('row.current_promotion');
    expect(repository).toContain('row.maps_query');
  });

  it('faz PATCH somente dos campos recebidos para evitar perda de dados', () => {
    expect(repository).toContain('establishmentPatchToRow(updates)');
    expect(repository).not.toContain('...establishmentToRow(existing)');
  });
});

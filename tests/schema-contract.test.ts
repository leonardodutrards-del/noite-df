import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const schema = readFileSync(resolve(process.cwd(), 'database/schema.sql'), 'utf8');
const migration001 = readFileSync(resolve(process.cwd(), 'database/migrations/001_auth_and_partner_roles.sql'), 'utf8');
const migration002 = readFileSync(resolve(process.cwd(), 'database/migrations/002_lgpd_consent.sql'), 'utf8');
const migration003 = readFileSync(resolve(process.cwd(), 'database/migrations/003_align_domain_identifiers.sql'), 'utf8');
const repository = readFileSync(
  resolve(process.cwd(), 'infrastructure/repositories/supabase-establishment-repository.ts'),
  'utf8'
);

describe('Contrato de IDs e schema de produção', () => {
  it('mantém user_role sem valores duplicados', () => {
    expect(schema).toContain(
      "create type user_role as enum ('visitor', 'partner', 'operator', 'admin');"
    );
    expect(schema).not.toContain("'admin', 'partner', 'admin'");
    expect(migration001).not.toContain("'admin', 'partner', 'admin'");
  });

  it('usa IDs textuais do domínio para perfis e estabelecimentos', () => {
    expect(schema).toContain('create table profiles (\n  id text primary key,');
    expect(schema).toContain('create table establishments (\n  id text primary key,');
    expect(schema).toContain('establishment_id text');
    expect(schema).not.toContain('establishment_id uuid');
    expect(migration002).toContain(
      'user_id text not null references profiles(id) on delete cascade'
    );
  });

  it('separa identidade do Supabase Auth do ID estável do domínio', () => {
    expect(schema).toContain(
      'auth_user_id uuid unique references auth.users(id) on delete set null'
    );
    expect(schema).toContain('for select using (auth.uid() = auth_user_id)');
    expect(schema).toContain('with check (auth.uid() = auth_user_id)');
  });

  it('protege a conversão de bancos legados com dados existentes', () => {
    expect(migration003).toContain('Migration 003 requires empty profiles and establishments tables');
    expect(migration003).toContain('ALTER COLUMN id TYPE text USING id::text');
    expect(migration003).toContain('auth_user_id uuid UNIQUE REFERENCES auth.users(id)');
  });

  it('monta filtros PATCH do PostgREST com chave e operador separados', () => {
    expect(repository).toContain("params.append(key, `eq.\${value}`);");
    expect(repository).toContain("updateRow('establishments', { id }, updateData)");
    expect(repository).not.toContain("params.append(`\${key}=eq.\${value}`, '')");
  });
});

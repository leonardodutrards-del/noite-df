-- Migração 007: conteúdo operacional estruturado dos estabelecimentos.
alter table establishments
  add column if not exists agenda_url text,
  add column if not exists operating_hours jsonb,
  add column if not exists menu jsonb,
  add column if not exists admission_note text,
  add column if not exists contact_source_url text,
  add column if not exists contact_checked_at date;

create index if not exists establishments_updated_at_idx
  on establishments(updated_at);

create table if not exists public.agenda_source_checks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources(id) on delete cascade,
  check_status text not null check (check_status in ('baseline', 'ok', 'changed', 'http_error', 'blocked', 'error')),
  http_status integer,
  content_sha256 text,
  checked_at timestamptz not null default now(),
  note text
);

create index if not exists agenda_source_checks_source_checked_idx
  on public.agenda_source_checks (source_id, checked_at desc);

alter table public.agenda_source_checks enable row level security;
revoke all on table public.agenda_source_checks from anon, authenticated;
grant all on table public.agenda_source_checks to service_role;

-- Noite DF — pipeline de ingestão editorial de eventos.
-- Migration aditiva. Aplicada em produção em 2026-11-08.
-- O acesso operacional ocorre pelo backend com service_role; clientes anon/authenticated não recebem acesso.

create table if not exists public.event_source_connectors (
  id uuid primary key default gen_random_uuid(),
  data_source_id uuid not null unique references public.data_sources(id) on delete cascade,
  connector_type text not null check (connector_type in ('api', 'rss', 'atom', 'ics', 'html', 'webhook', 'manual')),
  status text not null default 'paused' check (status in ('active', 'paused', 'needs_attention', 'disabled')),
  poll_interval_minutes integer not null default 180 check (poll_interval_minutes between 5 and 10080),
  next_check_at timestamptz,
  last_checked_at timestamptz,
  last_success_at timestamptz,
  last_error_at timestamptz,
  last_error_code text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_source_connectors_due_idx
  on public.event_source_connectors(status, next_check_at)
  where status = 'active';

create table if not exists public.event_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  connector_id uuid not null references public.event_source_connectors(id) on delete cascade,
  status text not null check (status in ('running', 'succeeded', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  discovered_count integer not null default 0 check (discovered_count >= 0),
  created_count integer not null default 0 check (created_count >= 0),
  updated_count integer not null default 0 check (updated_count >= 0),
  rejected_count integer not null default 0 check (rejected_count >= 0),
  error_count integer not null default 0 check (error_count >= 0),
  error_code text,
  summary jsonb not null default '{}'::jsonb
);

create index if not exists event_ingestion_runs_connector_started_idx
  on public.event_ingestion_runs(connector_id, started_at desc);

create table if not exists public.event_candidates (
  id uuid primary key default gen_random_uuid(),
  connector_id uuid not null references public.event_source_connectors(id) on delete cascade,
  ingestion_run_id uuid references public.event_ingestion_runs(id) on delete set null,
  source_event_key text,
  fingerprint text not null,
  source_url text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  confidence numeric(4,3) not null default 0 check (confidence between 0 and 1),
  auto_publish_eligible boolean not null default false,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'rejected', 'duplicate', 'published', 'failed')),
  event_id uuid references public.events(id) on delete set null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists event_candidates_source_key_unique_idx
  on public.event_candidates(connector_id, source_event_key)
  where source_event_key is not null;

create unique index if not exists event_candidates_fingerprint_without_key_unique_idx
  on public.event_candidates(connector_id, fingerprint)
  where source_event_key is null;

create index if not exists event_candidates_review_queue_idx
  on public.event_candidates(status, confidence desc, first_seen_at)
  where status = 'pending_review';

create index if not exists event_candidates_event_id_idx
  on public.event_candidates(event_id)
  where event_id is not null;

create table if not exists public.event_publication_jobs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.event_candidates(id) on delete cascade,
  idempotency_key text not null unique,
  status text not null default 'queued'
    check (status in ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  completed_at timestamptz,
  last_error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_publication_jobs_due_idx
  on public.event_publication_jobs(status, available_at)
  where status in ('queued', 'failed');

create table if not exists public.event_change_log (
  id bigserial primary key,
  event_id uuid references public.events(id) on delete set null,
  candidate_id uuid references public.event_candidates(id) on delete set null,
  action text not null check (action in ('created', 'updated', 'cancelled', 'expired', 'unpublished', 'reviewed')),
  actor_id text references public.profiles(id) on delete set null,
  before_data jsonb,
  after_data jsonb,
  source_url text,
  created_at timestamptz not null default now()
);

create index if not exists event_change_log_event_created_idx
  on public.event_change_log(event_id, created_at desc);

-- As tabelas são internas. RLS + ausência de policies para clientes mantém negação por padrão.
alter table public.event_source_connectors enable row level security;
alter table public.event_ingestion_runs enable row level security;
alter table public.event_candidates enable row level security;
alter table public.event_publication_jobs enable row level security;
alter table public.event_change_log enable row level security;

revoke all on table public.event_source_connectors from anon, authenticated;
revoke all on table public.event_ingestion_runs from anon, authenticated;
revoke all on table public.event_candidates from anon, authenticated;
revoke all on table public.event_publication_jobs from anon, authenticated;
revoke all on table public.event_change_log from anon, authenticated;

grant all on table public.event_source_connectors to service_role;
grant all on table public.event_ingestion_runs to service_role;
grant all on table public.event_candidates to service_role;
grant all on table public.event_publication_jobs to service_role;
grant all on table public.event_change_log to service_role;
grant usage, select on sequence public.event_change_log_id_seq to service_role;

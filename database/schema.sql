-- Modelo inicial de domínio. Execute somente após escolher o provedor PostgreSQL.
create extension if not exists pgcrypto;

create type publication_status as enum ('draft', 'pending_review', 'published', 'expired', 'suspended');
create type user_role as enum ('visitor', 'partner', 'operator', 'admin');
create type review_status as enum ('pending', 'published', 'rejected', 'removed');
create type claim_status as enum ('pending', 'approved', 'rejected', 'revoked');

create table profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role user_role not null default 'visitor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table establishments (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text not null,
  description text,
  region text not null,
  address text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  phone text,
  whatsapp text,
  instagram text,
  website text,
  price_range text,
  accessibility jsonb not null default '{}'::jsonb,
  publication_status publication_status not null default 'draft',
  verified_at timestamptz,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table establishment_tags (
  establishment_id uuid references establishments(id) on delete cascade,
  kind text not null check (kind in ('vibe', 'music', 'audience')),
  value text not null,
  primary key (establishment_id, kind, value)
);

create table opening_hours (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  valid_from date,
  valid_until date
);

create table events (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid references establishments(id) on delete set null,
  title text not null,
  category text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price_description text,
  official_url text,
  publication_status publication_status not null default 'draft',
  verified_at timestamptz,
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table promotions (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  title text not null,
  description text not null,
  weekday smallint check (weekday between 0 and 6),
  starts_at time,
  ends_at time,
  valid_from date not null,
  valid_until date not null,
  recurrence_rule text,
  publication_status publication_status not null default 'draft',
  created_by uuid references profiles(id),
  updated_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table partner_claims (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  requester_id uuid not null references profiles(id),
  evidence jsonb not null default '{}'::jsonb,
  status claim_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table data_sources (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  source_kind text not null,
  label text not null,
  url text,
  captured_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references profiles(id)
);

create table moderation_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  notes text,
  reviewed_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key,
  actor_id uuid references profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  establishment_id uuid not null references establishments(id) on delete cascade,
  author_id uuid references profiles(id),
  overall numeric(2,1) not null check (overall between 1 and 5),
  food numeric(2,1) check (food between 1 and 5),
  drinks numeric(2,1) check (drinks between 1 and 5),
  service numeric(2,1) check (service between 1 and 5),
  music numeric(2,1) check (music between 1 and 5),
  atmosphere numeric(2,1) check (atmosphere between 1 and 5),
  price_benefit numeric(2,1) check (price_benefit between 1 and 5),
  safety numeric(2,1) check (safety between 1 and 5),
  structure numeric(2,1) check (structure between 1 and 5),
  crowd numeric(2,1) check (crowd between 1 and 5),
  comment text,
  visited_at date,
  status review_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table interactions (
  id bigserial primary key,
  anonymous_session_id text,
  user_id uuid references profiles(id),
  establishment_id uuid references establishments(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  action text not null check (action in ('search', 'view', 'map_click', 'whatsapp_click', 'instagram_click', 'save', 'report', 'recommendation_accept')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index interactions_created_at_idx on interactions(created_at);
create index events_starts_at_idx on events(starts_at);
create index establishments_region_idx on establishments(region);

-- Assinaturas e faturamento (Mercado Pago)
CREATE TABLE IF NOT EXISTS subscription_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id UUID,
  plan_code TEXT NOT NULL CHECK (plan_code IN ('pro','premium','enterprise')),
  provider TEXT NOT NULL DEFAULT 'mercado_pago',
  provider_subscription_id TEXT UNIQUE,
  payer_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'mercado_pago',
  provider_event_id TEXT,
  event_type TEXT,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_event_id)
);

-- Segurança inicial para Supabase. Ajuste após implementar autenticação.
alter table profiles enable row level security;
alter table establishments enable row level security;
alter table events enable row level security;
alter table promotions enable row level security;
alter table reviews enable row level security;
alter table interactions enable row level security;

-- Conteúdo público somente quando publicado.
create policy "public_read_published_establishments" on establishments for select using (publication_status = 'published');
create policy "public_read_published_events" on events for select using (publication_status = 'published');
create policy "public_read_published_promotions" on promotions for select using (publication_status = 'published');
create policy "public_read_published_reviews" on reviews for select using (status = 'published');

-- Escritas administrativas e de parceiros devem ser feitas pelo backend usando service role
-- até que as políticas por usuário e reivindicação sejam implementadas.

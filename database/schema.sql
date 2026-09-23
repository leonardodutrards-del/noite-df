-- Modelo inicial de domínio Noite DF. Execute no Supabase SQL Editor.
create extension if not exists pgcrypto;

create type publication_status as enum ('draft', 'pending_review', 'published', 'expired', 'suspended');
create type user_role as enum ('visitor', 'partner', 'operator', 'admin');
create type review_status as enum ('pending', 'published', 'rejected', 'removed');
create type claim_status as enum ('pending', 'approved', 'rejected', 'revoked');

create table profiles (
  id text primary key,
  auth_user_id uuid unique references auth.users(id) on delete set null,
  name text not null,
  email text unique not null,
  role user_role not null default 'partner',
  establishment_id text,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table establishments (
  id text primary key,
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
  agenda_url text,
  operating_hours jsonb,
  menu jsonb,
  admission_note text,
  contact_source_url text,
  contact_checked_at date,
  price_range text,
  vibe text[] not null default '{}',
  music text[] not null default '{}',
  audience text[] not null default '{}',
  maps_query text,
  owner_managed boolean not null default false,
  crowd_status text not null default 'a confirmar'
    check (crowd_status in ('tranquilo','movimentado','lotado','a confirmar')),
  weekly_schedule jsonb not null default '[]'::jsonb,
  current_promotion jsonb,
  public_ratings jsonb not null default '[]'::jsonb,
  public_rating_summary jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  publication_status publication_status not null default 'draft',
  verified_at timestamptz,
  created_by text references profiles(id),
  updated_by text references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles add constraint fk_profiles_establishment foreign key (establishment_id) references establishments(id) on delete set null;

create table establishment_tags (
  establishment_id text references establishments(id) on delete cascade,
  kind text not null check (kind in ('vibe', 'music', 'audience')),
  value text not null,
  primary key (establishment_id, kind, value)
);

create table opening_hours (
  id uuid primary key default gen_random_uuid(),
  establishment_id text not null references establishments(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time,
  closes_at time,
  is_closed boolean not null default false,
  valid_from date,
  valid_until date
);

create table events (
  id uuid primary key default gen_random_uuid(),
  establishment_id text references establishments(id) on delete set null,
  title text not null,
  category text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price_description text,
  official_url text,
  publication_status publication_status not null default 'draft',
  verified_at timestamptz,
  created_by text references profiles(id),
  updated_by text references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table promotions (
  id uuid primary key default gen_random_uuid(),
  establishment_id text not null references establishments(id) on delete cascade,
  title text not null,
  description text not null,
  weekday smallint check (weekday between 0 and 6),
  starts_at time,
  ends_at time,
  valid_from date not null,
  valid_until date not null,
  recurrence_rule text,
  publication_status publication_status not null default 'draft',
  created_by text references profiles(id),
  updated_by text references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table partner_claims (
  id uuid primary key default gen_random_uuid(),
  establishment_id text not null references establishments(id) on delete cascade,
  requester_id text not null references profiles(id),
  evidence jsonb not null default '{}'::jsonb,
  status claim_status not null default 'pending',
  reviewed_by text references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table data_sources (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  source_kind text not null,
  label text not null,
  url text,
  captured_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by text references profiles(id)
);

create table moderation_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  action text not null,
  notes text,
  reviewed_by text not null references profiles(id),
  created_at timestamptz not null default now()
);

create table audit_log (
  id bigserial primary key,
  actor_id text references profiles(id),
  actor_email text,
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default gen_random_uuid(),
  establishment_id text not null references establishments(id) on delete cascade,
  author_id text references profiles(id),
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
  user_id text references profiles(id),
  establishment_id text references establishments(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  action text not null check (action in ('search', 'view', 'map_click', 'whatsapp_click', 'instagram_click', 'save', 'report', 'recommendation_accept')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index interactions_created_at_idx on interactions(created_at);
create index events_starts_at_idx on events(starts_at);
create index establishments_region_idx on establishments(region);
create index establishments_updated_at_idx on establishments(updated_at);

-- Assinaturas e faturamento (Mercado Pago)
create table if not exists subscription_accounts (
  id uuid primary key default gen_random_uuid(),
  establishment_id text references establishments(id) on delete set null,
  plan_code text not null check (plan_code in ('pro','premium','enterprise')),
  provider text not null default 'mercado_pago',
  provider_subscription_id text unique,
  provider_payment_id text,
  payer_email text not null,
  status text not null default 'pending',
  amount_cents integer not null,
  current_period_end timestamptz,
  refunded_at timestamptz,
  refund_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mercado_pago',
  provider_event_id text,
  event_type text,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

-- Políticas RLS
alter table profiles enable row level security;
alter table establishments enable row level security;
alter table events enable row level security;
alter table promotions enable row level security;
alter table reviews enable row level security;
alter table interactions enable row level security;
alter table audit_log enable row level security;
alter table subscription_accounts enable row level security;

create policy "public_read_published_establishments" on establishments for select using (publication_status = 'published');
create policy "public_read_published_events" on events for select using (publication_status = 'published');
create policy "public_read_published_promotions" on promotions for select using (publication_status = 'published');
create policy "public_read_published_reviews" on reviews for select using (status = 'published');

-- Perfis usam um ID textual estável do domínio. O UUID do Supabase Auth,
-- quando existir, fica em auth_user_id e não substitui URLs/slugs do aplicativo.
create policy "users_read_own_profile" on profiles
  for select using (auth.uid() = auth_user_id);

create policy "users_update_own_profile" on profiles
  for update using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);


-- Fases 9-12: growth, CRM operacional, retenção e monetização.
-- Fases 9-12: growth, CRM operacional, retenção e funil de monetização.
create table if not exists partner_pipeline (
  establishment_id text primary key references establishments(id) on delete cascade,
  stage text not null default 'uncontacted'
    check (stage in ('uncontacted','contacted','replied','trial','partner','paused','lost')),
  contact_channel text,
  last_contact_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  trial_plan_code text check (trial_plan_code is null or trial_plan_code in ('pro','premium','enterprise')),
  subscription_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into partner_pipeline (establishment_id)
select id from establishments
on conflict (establishment_id) do nothing;

create index if not exists partner_pipeline_stage_idx on partner_pipeline(stage);
create index if not exists partner_pipeline_follow_up_idx on partner_pipeline(next_follow_up_at);

create table if not exists user_preferences (
  profile_id text primary key references profiles(id) on delete cascade,
  regions text[] not null default '{}',
  music text[] not null default '{}',
  vibes text[] not null default '{}',
  budget text,
  updated_at timestamptz not null default now()
);

create table if not exists user_favorites (
  profile_id text not null references profiles(id) on delete cascade,
  establishment_id text not null references establishments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, establishment_id)
);
create index if not exists user_favorites_establishment_idx on user_favorites(establishment_id);

create table if not exists saved_lists (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists saved_lists_profile_idx on saved_lists(profile_id);

create table if not exists saved_list_items (
  list_id uuid not null references saved_lists(id) on delete cascade,
  establishment_id text not null references establishments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (list_id, establishment_id)
);
create index if not exists saved_list_items_establishment_idx on saved_list_items(establishment_id);

alter table interactions drop constraint if exists interactions_action_check;
alter table interactions add constraint interactions_action_check check (
  action in ('search','view','map_click','whatsapp_click','instagram_click','save','report','recommendation_accept','trial_start','subscription_checkout')
);

alter table partner_pipeline enable row level security;
alter table user_preferences enable row level security;
alter table user_favorites enable row level security;
alter table saved_lists enable row level security;
alter table saved_list_items enable row level security;

drop policy if exists partner_pipeline_clients_denied on partner_pipeline;
create policy partner_pipeline_clients_denied on partner_pipeline for all to anon, authenticated using (false) with check (false);
drop policy if exists user_preferences_clients_denied on user_preferences;
create policy user_preferences_clients_denied on user_preferences for all to anon, authenticated using (false) with check (false);
drop policy if exists user_favorites_clients_denied on user_favorites;
create policy user_favorites_clients_denied on user_favorites for all to anon, authenticated using (false) with check (false);
drop policy if exists saved_lists_clients_denied on saved_lists;
create policy saved_lists_clients_denied on saved_lists for all to anon, authenticated using (false) with check (false);
drop policy if exists saved_list_items_clients_denied on saved_list_items;
create policy saved_list_items_clients_denied on saved_list_items for all to anon, authenticated using (false) with check (false);

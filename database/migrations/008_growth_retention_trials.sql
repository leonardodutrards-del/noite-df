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
alter table interactions
  add constraint interactions_action_check check (
    action in (
      'search','view','map_click','whatsapp_click','instagram_click','save','report',
      'recommendation_accept','trial_start','subscription_checkout'
    )
  );

alter table partner_pipeline enable row level security;
alter table user_preferences enable row level security;
alter table user_favorites enable row level security;
alter table saved_lists enable row level security;
alter table saved_list_items enable row level security;

drop policy if exists partner_pipeline_clients_denied on partner_pipeline;
create policy partner_pipeline_clients_denied on partner_pipeline
  for all to anon, authenticated using (false) with check (false);

drop policy if exists user_preferences_clients_denied on user_preferences;
create policy user_preferences_clients_denied on user_preferences
  for all to anon, authenticated using (false) with check (false);

drop policy if exists user_favorites_clients_denied on user_favorites;
create policy user_favorites_clients_denied on user_favorites
  for all to anon, authenticated using (false) with check (false);

drop policy if exists saved_lists_clients_denied on saved_lists;
create policy saved_lists_clients_denied on saved_lists
  for all to anon, authenticated using (false) with check (false);

drop policy if exists saved_list_items_clients_denied on saved_list_items;
create policy saved_list_items_clients_denied on saved_list_items
  for all to anon, authenticated using (false) with check (false);

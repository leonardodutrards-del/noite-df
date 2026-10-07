-- Migração 010: cache de planos de assinatura por estabelecimento e meio de pagamento.
create table if not exists public.payment_provider_plans (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  establishment_id text not null references public.establishments(id) on delete cascade,
  plan_code text not null check (plan_code in ('pro','premium','enterprise')),
  payment_method text not null,
  provider_plan_id text not null,
  amount_cents integer not null,
  checkout_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, establishment_id, plan_code, payment_method),
  unique(provider, provider_plan_id)
);

alter table public.payment_provider_plans enable row level security;

drop policy if exists payment_provider_plans_clients_denied on public.payment_provider_plans;
create policy payment_provider_plans_clients_denied
  on public.payment_provider_plans
  for all
  to anon, authenticated
  using (false)
  with check (false);

create index if not exists payment_provider_plans_establishment_idx
  on public.payment_provider_plans(establishment_id);

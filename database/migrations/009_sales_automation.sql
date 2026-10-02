-- Fase 13: automação comercial do funil de vendas.
-- Garante que todo novo estabelecimento entre no CRM e que uma assinatura ativa
-- avance automaticamente o estabelecimento para parceiro.

create or replace function public.ensure_partner_pipeline_record()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.partner_pipeline (establishment_id, stage, created_at, updated_at)
  values (new.id, 'uncontacted', now(), now())
  on conflict (establishment_id) do nothing;
  return new;
end;
$$;

drop trigger if exists establishments_create_pipeline on public.establishments;
create trigger establishments_create_pipeline
after insert on public.establishments
for each row execute function public.ensure_partner_pipeline_record();

insert into public.partner_pipeline (establishment_id, stage)
select id, 'uncontacted'
from public.establishments
on conflict (establishment_id) do nothing;

create or replace function public.sync_partner_pipeline_from_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.establishment_id is null then
    return new;
  end if;

  insert into public.partner_pipeline (establishment_id, stage, updated_at)
  values (
    new.establishment_id,
    case when new.status = 'active' then 'partner' else 'uncontacted' end,
    now()
  )
  on conflict (establishment_id) do update
  set stage = case
        when new.status = 'active' then 'partner'
        else public.partner_pipeline.stage
      end,
      updated_at = case
        when new.status = 'active' then now()
        else public.partner_pipeline.updated_at
      end;

  return new;
end;
$$;

drop trigger if exists subscription_accounts_sync_pipeline on public.subscription_accounts;
create trigger subscription_accounts_sync_pipeline
after insert or update of status, establishment_id on public.subscription_accounts
for each row execute function public.sync_partner_pipeline_from_subscription();

create index if not exists interactions_action_created_at_idx
  on public.interactions(action, created_at desc);

create index if not exists interactions_establishment_created_at_idx
  on public.interactions(establishment_id, created_at desc);

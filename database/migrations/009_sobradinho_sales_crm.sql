-- CRM de campo para a operação comercial regional.
alter table public.partner_pipeline
  add column if not exists visit_status text not null default 'not_visited',
  add column if not exists visited_at timestamptz,
  add column if not exists visit_notes text;

alter table public.partner_pipeline
  drop constraint if exists partner_pipeline_visit_status_check;

alter table public.partner_pipeline
  add constraint partner_pipeline_visit_status_check
  check (visit_status in (
    'not_visited',
    'visited',
    'owner_contacted',
    'interested',
    'follow_up',
    'trial',
    'signed',
    'lost'
  ));

create index if not exists partner_pipeline_visit_status_idx
  on public.partner_pipeline(visit_status);

create or replace function public.ensure_partner_pipeline_row()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into public.partner_pipeline (establishment_id)
  values (new.id)
  on conflict (establishment_id) do nothing;
  return new;
end;
$$;

drop trigger if exists establishments_partner_pipeline_after_insert on public.establishments;
create trigger establishments_partner_pipeline_after_insert
after insert on public.establishments
for each row execute function public.ensure_partner_pipeline_row();

insert into public.partner_pipeline (establishment_id)
select id from public.establishments
on conflict (establishment_id) do nothing;

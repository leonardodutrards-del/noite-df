-- Serialize calls to the public Nominatim service across serverless instances.
create table if not exists public.nominatim_request_guard (
  id smallint primary key check (id = 1),
  next_slot_at timestamptz not null default now()
);

insert into public.nominatim_request_guard (id, next_slot_at)
values (1, now())
on conflict (id) do nothing;

alter table public.nominatim_request_guard enable row level security;
revoke all on public.nominatim_request_guard from public, anon, authenticated, service_role;

create or replace function public.claim_nominatim_request_slot()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_slot timestamptz;
  wait_ms integer;
  now_at timestamptz := clock_timestamp();
begin
  select next_slot_at
    into current_slot
    from public.nominatim_request_guard
    where id = 1
    for update;

  if not found then
    insert into public.nominatim_request_guard (id, next_slot_at)
    values (1, now_at + interval '1100 milliseconds')
    on conflict (id) do nothing;
    select next_slot_at into current_slot
      from public.nominatim_request_guard where id = 1 for update;
  end if;

  wait_ms := greatest(0, ceil(extract(epoch from (current_slot - now_at)) * 1000)::integer);

  if wait_ms > 2000 then
    return wait_ms;
  end if;

  update public.nominatim_request_guard
    set next_slot_at = greatest(current_slot, now_at) + interval '1100 milliseconds'
    where id = 1;

  return wait_ms;
end;
$$;

revoke all on function public.claim_nominatim_request_slot() from public, anon, authenticated;
grant execute on function public.claim_nominatim_request_slot() to service_role;

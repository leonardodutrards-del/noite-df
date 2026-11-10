-- Serialize calls to the public Nominatim service across serverless instances.
create table if not exists public.nominatim_request_guard (
  id smallint primary key check (id = 1),
  next_slot_at timestamptz not null default now(),
  lease_until timestamptz not null default '-infinity'::timestamptz
);

alter table public.nominatim_request_guard
  add column if not exists lease_until timestamptz not null default '-infinity'::timestamptz;

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
  current_lease timestamptz;
  wait_ms integer;
  now_at timestamptz := clock_timestamp();
begin
  select next_slot_at, lease_until
    into current_slot, current_lease
    from public.nominatim_request_guard
    where id = 1
    for update;

  if not found then
    insert into public.nominatim_request_guard (id, next_slot_at, lease_until)
    values (1, now_at, '-infinity'::timestamptz)
    on conflict (id) do nothing;
    select next_slot_at, lease_until
      into current_slot, current_lease
      from public.nominatim_request_guard where id = 1 for update;
  end if;

  wait_ms := greatest(0, ceil(extract(epoch from (greatest(current_slot, current_lease) - now_at)) * 1000)::integer);

  if wait_ms > 2000 then
    return wait_ms;
  end if;

  -- Hold a lease for longer than the six-second upstream timeout. This prevents
  -- overlapping requests from concurrent Vercel instances.
  update public.nominatim_request_guard
    set lease_until = greatest(current_slot, current_lease, now_at) + interval '8 seconds'
    where id = 1;

  return wait_ms;
end;
$$;

create or replace function public.release_nominatim_request_slot()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.nominatim_request_guard
    set lease_until = clock_timestamp(),
        next_slot_at = greatest(next_slot_at, clock_timestamp() + interval '1100 milliseconds')
    where id = 1;
end;
$$;

revoke all on function public.claim_nominatim_request_slot() from public, anon, authenticated;
grant execute on function public.claim_nominatim_request_slot() to service_role;
revoke all on function public.release_nominatim_request_slot() from public, anon, authenticated;
grant execute on function public.release_nominatim_request_slot() to service_role;

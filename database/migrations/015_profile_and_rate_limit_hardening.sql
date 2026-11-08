-- Noite DF — hardening complementar de perfil e rate limit.
-- Mantém search_path vazio em SECURITY DEFINER e qualifica objetos explicitamente.

drop policy if exists users_update_own_profile on public.profiles;

revoke all on table public.security_rate_limits from anon, authenticated;

create or replace function public.security_check_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_attempts integer;
  started_at timestamptz;
begin
  if p_key_hash is null
     or p_key_hash !~ '^[0-9a-f]{64}$'
     or p_limit is null or p_limit < 1 or p_limit > 100
     or p_window_seconds is null or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'INVALID_RATE_LIMIT_ARGUMENTS';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_key_hash, 0));

  select attempts, window_started_at
    into current_attempts, started_at
    from public.security_rate_limits
   where key_hash = p_key_hash
   for update;

  if not found then
    insert into public.security_rate_limits(key_hash, attempts, window_started_at, updated_at)
    values (p_key_hash, 1, pg_catalog.now(), pg_catalog.now());
    return true;
  end if;

  if started_at + pg_catalog.make_interval(secs => p_window_seconds) <= pg_catalog.now() then
    update public.security_rate_limits
       set attempts = 1, window_started_at = pg_catalog.now(), updated_at = pg_catalog.now()
     where key_hash = p_key_hash;
    return true;
  end if;

  if current_attempts >= p_limit then
    return false;
  end if;

  update public.security_rate_limits
     set attempts = attempts + 1, updated_at = pg_catalog.now()
   where key_hash = p_key_hash;

  return true;
end;
$$;

revoke all on function public.security_check_rate_limit(text, integer, integer) from public;
revoke all on function public.security_check_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.security_check_rate_limit(text, integer, integer) to service_role;

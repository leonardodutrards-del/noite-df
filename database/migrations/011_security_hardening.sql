-- Noite DF — hardening incremental de segurança
-- Aplicar somente após revisão em homologação. Não altera dados de negócio.

-- 1) Alinha o enum ao papel privilegiado utilizado pela aplicação.
alter type public.user_role add value if not exists 'master_admin';

-- 2) Remove a possibilidade de um usuário editar o próprio papel ou vínculo
-- diretamente pela API do Supabase. Atualizações administrativas seguem pelo
-- backend com service_role, nunca pelo cliente.
drop policy if exists users_update_own_profile on public.profiles;

-- 3) Ativa RLS nas tabelas que ainda estavam sem proteção.
alter table public.establishment_tags enable row level security;
alter table public.opening_hours enable row level security;
alter table public.partner_claims enable row level security;
alter table public.data_sources enable row level security;
alter table public.moderation_reviews enable row level security;
alter table public.payment_webhook_events enable row level security;
alter table public.security_rate_limits enable row level security;

-- 4) Tags e horários continuam públicos somente quando pertencem a
-- estabelecimentos publicados. Não há política de escrita para clientes.
drop policy if exists public_read_published_establishment_tags on public.establishment_tags;
create policy public_read_published_establishment_tags
  on public.establishment_tags for select to anon, authenticated
  using (
    exists (
      select 1 from public.establishments e
      where e.id = establishment_tags.establishment_id
        and e.publication_status = 'published'
    )
  );

drop policy if exists public_read_published_opening_hours on public.opening_hours;
create policy public_read_published_opening_hours
  on public.opening_hours for select to anon, authenticated
  using (
    exists (
      select 1 from public.establishments e
      where e.id = opening_hours.establishment_id
        and e.publication_status = 'published'
    )
  );

-- 5) Dados de reivindicações, fontes internas, moderação, webhooks e rate
-- limiting não ficam disponíveis diretamente para anon/authenticated.
drop policy if exists partner_claims_clients_denied on public.partner_claims;
create policy partner_claims_clients_denied
  on public.partner_claims for all to anon, authenticated
  using (false) with check (false);

drop policy if exists data_sources_clients_denied on public.data_sources;
create policy data_sources_clients_denied
  on public.data_sources for all to anon, authenticated
  using (false) with check (false);

drop policy if exists moderation_reviews_clients_denied on public.moderation_reviews;
create policy moderation_reviews_clients_denied
  on public.moderation_reviews for all to anon, authenticated
  using (false) with check (false);

drop policy if exists payment_webhook_events_clients_denied on public.payment_webhook_events;
create policy payment_webhook_events_clients_denied
  on public.payment_webhook_events for all to anon, authenticated
  using (false) with check (false);

drop policy if exists security_rate_limits_clients_denied on public.security_rate_limits;
create policy security_rate_limits_clients_denied
  on public.security_rate_limits for all to anon, authenticated
  using (false) with check (false);

-- 6) Serializa tentativas por chave e limita a execução ao backend confiável.
create or replace function public.security_check_rate_limit(
  p_key_hash text,
  p_limit integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_attempts integer;
  started_at timestamptz;
begin
  if p_key_hash is null or length(p_key_hash) < 16
     or p_limit is null or p_limit < 1
     or p_window_seconds is null or p_window_seconds < 1 then
    raise exception 'INVALID_RATE_LIMIT_ARGUMENTS';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_key_hash, 0));

  select attempts, window_started_at
    into current_attempts, started_at
    from public.security_rate_limits
   where key_hash = p_key_hash
   for update;

  if not found then
    insert into public.security_rate_limits(key_hash, attempts, window_started_at, updated_at)
    values (p_key_hash, 1, now(), now());
    return true;
  end if;

  if started_at + make_interval(secs => p_window_seconds) <= now() then
    update public.security_rate_limits
       set attempts = 1, window_started_at = now(), updated_at = now()
     where key_hash = p_key_hash;
    return true;
  end if;

  if current_attempts >= p_limit then
    return false;
  end if;

  update public.security_rate_limits
     set attempts = attempts + 1, updated_at = now()
   where key_hash = p_key_hash;

  return true;
end;
$$;

revoke all on function public.security_check_rate_limit(text, integer, integer) from public;
revoke all on function public.security_check_rate_limit(text, integer, integer) from anon, authenticated;
grant execute on function public.security_check_rate_limit(text, integer, integer) to service_role;

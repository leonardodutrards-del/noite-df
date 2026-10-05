create or replace function public.sync_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  existing_profile_id text;
  safe_name text;
begin
  if new.email is null or btrim(new.email) = '' then
    raise exception 'AUTH_USER_EMAIL_REQUIRED';
  end if;

  safe_name := coalesce(
    nullif(btrim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );

  select p.id
    into existing_profile_id
  from public.profiles p
  where lower(p.email) = lower(new.email)
  limit 1;

  if existing_profile_id is not null then
    update public.profiles
       set auth_user_id = case
             when auth_user_id is null or auth_user_id = new.id then new.id
             else auth_user_id
           end,
           name = case
             when name is null or btrim(name) = '' then safe_name
             else name
           end,
           updated_at = now()
     where id = existing_profile_id;

    return new;
  end if;

  insert into public.profiles (
    id,
    auth_user_id,
    email,
    name,
    role,
    establishment_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    'usr_' || new.id::text,
    new.id,
    lower(new.email),
    safe_name,
    'visitor',
    null,
    new.last_sign_in_at,
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (auth_user_id) do update
    set email = excluded.email,
        name = case
          when public.profiles.name is null or btrim(public.profiles.name) = ''
            then excluded.name
          else public.profiles.name
        end,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists auth_user_profile_sync_after_insert on auth.users;
create trigger auth_user_profile_sync_after_insert
after insert on auth.users
for each row execute function public.sync_profile_from_auth_user();

update public.profiles p
   set auth_user_id = u.id,
       updated_at = now()
  from auth.users u
 where p.auth_user_id is null
   and lower(p.email) = lower(u.email)
   and not exists (
     select 1
       from public.profiles px
      where px.auth_user_id = u.id
   );

insert into public.profiles (
  id,
  auth_user_id,
  email,
  name,
  role,
  establishment_id,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  'usr_' || u.id::text,
  u.id,
  lower(u.email),
  coalesce(
    nullif(btrim(u.raw_user_meta_data->>'name'), ''),
    split_part(u.email, '@', 1)
  ),
  'visitor',
  null,
  u.last_sign_in_at,
  u.created_at,
  now()
from auth.users u
left join public.profiles p on p.auth_user_id = u.id
where p.id is null
on conflict (id) do nothing;

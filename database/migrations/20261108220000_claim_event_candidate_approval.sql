-- Atomic claim and recovery for editorial event approvals.
-- A short lease prevents concurrent publication and lets a retry recover an
-- interrupted approval without creating a second published event.

create or replace function public.claim_event_candidate_for_approval(
  p_candidate_id uuid,
  p_actor_id text
)
returns table (
  candidate_status text,
  candidate_event_id uuid,
  claimed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_event_id uuid;
  v_reviewed_at timestamptz;
begin
  select c.status, c.event_id, c.reviewed_at
    into v_status, v_event_id, v_reviewed_at
    from public.event_candidates c
   where c.id = p_candidate_id
   for update;

  if not found then
    return query select 'not_found'::text, null::uuid, false;
    return;
  end if;

  if v_status = 'published' and v_event_id is not null then
    return query select v_status, v_event_id, false;
    return;
  end if;

  if v_status = 'pending_review'
     or (v_status = 'approved' and coalesce(v_reviewed_at, '-infinity'::timestamptz)
         < pg_catalog.now() - interval '2 minutes') then
    update public.event_candidates
       set status = 'approved',
           reviewed_at = pg_catalog.now(),
           reviewed_by = p_actor_id,
           review_note = 'Aprovação em processamento; uma nova tentativa poderá retomá-la após 2 minutos.',
           updated_at = pg_catalog.now()
     where id = p_candidate_id;

    return query select 'approved'::text, v_event_id, true;
    return;
  end if;

  return query select v_status, v_event_id, false;
end;
$$;

revoke all on function public.claim_event_candidate_for_approval(uuid, text) from public;
revoke all on function public.claim_event_candidate_for_approval(uuid, text) from anon, authenticated;
grant execute on function public.claim_event_candidate_for_approval(uuid, text) to service_role;

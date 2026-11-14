-- Expire only events whose explicit end time is already in the past.
-- On 2026-11-14, 24 published records met this condition; one future event remains.
update public.events
set publication_status = 'expired',
    updated_at = now()
where publication_status = 'published'
  and ends_at is not null
  and ends_at < now();

-- Covering indexes for the event ingestion pipeline foreign keys.
create index if not exists event_candidates_ingestion_run_id_idx
  on public.event_candidates(ingestion_run_id);
create index if not exists event_candidates_reviewed_by_idx
  on public.event_candidates(reviewed_by);
create index if not exists event_change_log_actor_id_idx
  on public.event_change_log(actor_id);
create index if not exists event_change_log_candidate_id_idx
  on public.event_change_log(candidate_id);

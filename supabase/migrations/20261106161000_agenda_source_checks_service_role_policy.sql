create policy agenda_source_checks_service_role_only
  on public.agenda_source_checks
  for all
  to service_role
  using (true)
  with check (true);

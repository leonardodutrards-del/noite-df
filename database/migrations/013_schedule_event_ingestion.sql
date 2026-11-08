-- Noite DF — agendamento recorrente da ingestão estruturada de eventos.
-- Aplicada em produção em 2026-11-08 após o deploy do endpoint /api/cron/event-ingestion.
-- A credencial é lida do Supabase Vault; nenhum segredo fica versionado no repositório.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.unschedule(jobid)
from cron.job
where jobname = 'noite-df-event-ingestion';

select cron.schedule(
  'noite-df-event-ingestion',
  '*/5 * * * *',
  $job$
    select net.http_post(
      url := 'https://www.noitedf.com.br/api/cron/event-ingestion',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'noite_df_event_ingestion_cron_secret'
          limit 1
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 55000
    );
  $job$
);

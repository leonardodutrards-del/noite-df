-- Noite DF — agendamento recorrente da ingestão estruturada de eventos.
-- Executar somente depois do deploy do endpoint /api/cron/event-ingestion.
-- A credencial é lida do Supabase Vault; nenhum segredo fica versionado no repositório.

create extension if not exists pg_cron;
create extension if not exists pg_net;

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

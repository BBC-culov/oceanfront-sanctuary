-- 1) Svuota i log storici di cron (recupera ~5,37 GB di disco)
TRUNCATE TABLE cron.job_run_details;

-- 2) Job giornaliero di pulizia: elimina log di esecuzione > 7 giorni
--    (evita che la tabella si rigonfi nuovamente)
SELECT cron.schedule(
  'cleanup-cron-run-logs',
  '0 4 * * *',
  $cron$ DELETE FROM cron.job_run_details WHERE start_time < now() - interval '7 days'; $cron$
);
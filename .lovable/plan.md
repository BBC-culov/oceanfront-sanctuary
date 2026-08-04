# Analisi costi runtime + ottimizzazione DB

## Analisi dei consumi (credit usage runtime, non build)

Costo runtime totale: **35,3 crediti/mese**. Ripartizione:

| Voce | Crediti/mese | % |
|---|---|---|
| Cloud compute pico (istanza Tiny sempre attiva) | 34,96 | 99% |
| Cloud egress | 0,13 | <1% |
| Cloud cached egress | 0,12 | <1% |
| Cloud Worker Days | 0,11 | <1% |
| Cloud file storage | 0,014 | ~0% |
| Cloud functions | 0,006 | ~0% |
| AI Gateway | 0,00 | 0% (non usato) |

**Conclusione sui costi:** il 99% del runtime è il compute dell'istanza Tiny, fatturato finché il backend è attivo. Per un sito di prenotazioni live (auth, booking, webhook pagamento, realtime 24/7) questo costo è **fisso e non riducibile** — non si può mettere in pausa un backend di produzione, e Tiny è già l'istanza più piccola. Non ci sono sprechi significativi: storage, egress, functions e AI gateway sono trascurabili.

## La vera ottimizzazione: bloat del database

Il DB risulta 5,37 GB e disco al 71%, ma la composizione reale è:

```
cron.job_run_details   5.368 MB   ← 99,99% del DB
net._http_response       3,4 MB
tutte le tabelle app      ~4 MB   (bookings, apartments, email_send_log, ecc.)
```

I dati dell'applicazione sono ~4 MB. Quasi tutto il "peso" del DB sono i log di cron. Il cron `process-email-queue` (ogni 5 secondi quando armato) ha generato milioni di righe in `job_run_details` nei 148 giorni di uptime. Questo:
- porta il disco al 71% → verso un **upgrade disco a pagamento** (costo separato dal compute)
- causa i timeout sulle query (la tabella è enorme)
- gonfia il WAL

### Cosa fare

1. **Truncate `cron.job_run_details`** — recupero immediato di ~5,37 GB. La tabella contiene solo log storici di esecuzione cron, nessun dato applicativo. Sicuro da svuotare.
   ```sql
   TRUNCATE cron.job_run_details;
   ```
   `TRUNCATE` rilascia subito lo spazio al disco (nessun VACUUM FULL necessario).

2. **Aggiungere un job cron di pulizia automatica** — elimina i log più vecchi di 7 giorni ogni notte, così la tabella non si rigonfia:
   ```sql
   SELECT cron.schedule(
     'cleanup-cron-run-logs',
     '0 4 * * *',
     $cron$ DELETE FROM cron.job_run_details WHERE start_time < now() - interval '7 days'; $cron$
   );
   ```

3. **Verificare il risultato** — dopo il truncate, controllare che il disco scenda da 71% a ~0% e che le query su cron non vadano più in timeout.

### Impatto atteso

- Disco: 71% → ~0% (evita upgrade disco a pagamento)
- DB size: 5,37 GB → ~4 MB
- Query su cron tornano veloci
- WAL si riduce
- **Nessun impatto sui costi compute** (restano ~35 crediti/mese, fissi) — ma si evita un costo futuro di upgrade disco

### Note
- I job cron attivi (balance-reminders giornaliero, booking-recovery orario, retention giornaliero) sono già ben tarati e non necessitano modifiche.
- Il cron email a 5 secondi è già correttamente disattivato (code vuote); il problema è solo il log storico accumulato.
- Le 39.686 transazioni rollbackate in 148 giorni (~268/giorno) sono basse e derivano dai lock advisory del dispatch email — non sono un problema.

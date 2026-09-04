# Monitoraggio e recupero errori

Risultato dell'audit: il sito non ha rete di sicurezza sugli errori. Se qualcosa si rompe in produzione su bazhouse.com, il cliente vede una pagina bianca e tu non lo sai.

## Cosa è già a posto

- Pagina 404 dedicata, in italiano, `noindex`, con link alla home.
- Progetto collegato a GitHub (copia del codice fuori dalla piattaforma).
- Backup del database gestiti dalla piattaforma; export manuale non richiesto.

## Cosa sistemare

### 1. Schermata di errore invece della pagina bianca (critico)

Oggi un singolo errore JavaScript in un componente (es. un dato mancante in una prenotazione) fa sparire tutto il sito, non solo quella sezione.

Interventi:
- Nuovo componente `ErrorBoundary` con schermata di fallback nello stile Bazhouse: titolo, messaggio in italiano, pulsante "Ricarica la pagina" e link alla home più contatto WhatsApp/email.
- Avvolgere `<App />` in `src/main.tsx` con l'error boundary.
- Boundary aggiuntivo attorno alle aree critiche (wizard di prenotazione e dashboard admin/proprietario) così un errore lì non abbatte navbar e navigazione.

### 2. Notifica degli errori dei clienti (critico)

Oggi non esiste tracciamento errori: se un ospite non riesce a pagare la caparra lo scopri solo se ti scrive.

Interventi:
- Integrare Sentry (piano gratuito) inizializzato all'avvio dell'app, con DSN come valore pubblico in configurazione.
- Inviare a Sentry gli errori catturati dall'error boundary e le richieste fallite verso le funzioni di pagamento/email.
- Filtrare i dati sensibili: nessun documento d'identità, codice fiscale, telefono o email dell'ospite nei report inviati.
- Serve il DSN del progetto Sentry: creo prima il codice e poi ti indico dove inserirlo.

### 3. Uptime monitoring (da fare fuori dal codice)

Non hai nessun servizio attivo: se Hostinger cade, nessuno viene avvisato. Non è risolvibile nel codice, quindi ti preparo le istruzioni pronte:
- UptimeRobot (gratuito, controllo ogni 5 minuti) con alert email.
- URL da monitorare: `https://bazhouse.com/` e `https://bazhouse.com/appartamenti`.
- Istruzioni passo-passo in un file `MONITORING.md` nel progetto.

## Note tecniche

- `ErrorBoundary` come class component (`componentDidCatch`) in `src/components/ErrorBoundary.tsx`, con `onError` che inoltra a Sentry.
- Sentry via `@sentry/react` inizializzato in `src/main.tsx`; `tracesSampleRate` basso per contenere il consumo del piano free; `beforeSend` per rimuovere i campi ospite/fatturazione.
- Il DSN Sentry è un valore pubblico lato browser: va in configurazione, non nei secret del backend.
- Nessuna modifica alla logica di prenotazione, pagamenti o email.

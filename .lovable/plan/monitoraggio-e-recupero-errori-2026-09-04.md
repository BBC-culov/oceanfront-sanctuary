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

## Note tecniche

- `ErrorBoundary` come class component (`componentDidCatch`) in `src/components/ErrorBoundary.tsx`, con `onError` che inoltra a Sentry.
- Nessuna modifica alla logica di prenotazione, pagamenti o email.
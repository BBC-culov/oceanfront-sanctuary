# Refactor punti 1, 2, 3 dell'audit qualità

Obiettivo: spezzare le quattro pagine più grandi in pezzi più piccoli e leggibili, **senza cambiare nulla di quello che l'utente vede o può fare**. Nessuna modifica a grafica, testi, prezzi o regole di prenotazione.

## 1. Registro/Accesso (916 righe)

Oggi una sola schermata gestisce accesso, registrazione, password dimenticata, validazione, chiamate al server e grafica.

Divisione:
- validazione (schemi login/registrazione) in un file dedicato
- logica di accesso, registrazione e recupero password in un hook `useAuthForms`
- tre blocchi visivi separati: modulo di accesso, modulo di registrazione, recupero password
- la pagina resta lo stesso indirizzo e mantiene identiche animazioni, icone, messaggi e redirect post-accesso

## 2. Creazione/modifica appartamento (813 righe)

Oggi la procedura guidata gestisce insieme grafica, caricamento foto e video, cancellazioni e salvataggio.

Divisione:
- un hook per il salvataggio e lo stato della procedura
- un hook per i caricamenti media (usando le funzioni già centralizzate in `mediaStorage`)
- un file per ogni passaggio della procedura guidata
- stessi passaggi, stesse validazioni, stesso comportamento

## 3. Area personale cliente (832 righe) e Dettaglio prenotazione (758 righe)

Oggi entrambe mescolano interrogazioni al database, calcoli di prezzo e grafica.

Divisione:
- `useProfiloData` e `useBookingDetail` per i dati (prenotazioni, saldo, ospiti, pagamenti)
- calcoli di importi tramite le funzioni condivise già esistenti (caparra 20%, notti)
- blocchi visivi separati: elenco prenotazioni, dati personali, privacy/GDPR; e per il dettaglio: soggiorno, ospiti, pagamenti, azioni
- restano identici export dati GDPR, annullamento con "ANNULLA", richiesta di modifica e saldo residuo

## Dettagli tecnici

- Nuovi file: `src/lib/authValidation.ts`, `src/hooks/useAuthForms.ts`, `src/components/auth/*`, `src/hooks/useApartmentWizard.ts`, `src/components/admin/apartment-wizard/*`, `src/hooks/useProfiloData.ts`, `src/hooks/useBookingDetail.ts`, `src/components/profilo/*`, `src/components/booking-detail/*`.
- Nessuna modifica al database, alle policy RLS o alle edge function.
- Le sottoscrizioni realtime esistenti vengono spostate dentro gli hook mantenendo gli stessi canali e tabelle.
- Nessuna modifica alle rotte in `App.tsx` (solo eventuale mantenimento degli ErrorBoundary già presenti).

## Verifica

1. Typecheck + build senza errori.
2. Test esistenti (`nights`) verdi.
3. Prova nel browser: pagina accesso/registrazione (validazioni ed errori), redirect se non autenticato per area personale e admin, apertura procedura appartamento se la sessione admin è disponibile.
4. Controllo del log errori runtime dopo le modifiche.

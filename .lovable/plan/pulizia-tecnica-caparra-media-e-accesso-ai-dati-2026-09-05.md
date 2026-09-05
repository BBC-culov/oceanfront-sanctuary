# Pulizia tecnica: caparra, media e accesso ai dati

Obiettivo: sistemare i punti 6, 7 e 8 dell'audit senza cambiare nulla di ciò che si vede o di come funziona il sito. Stesse pagine, stessi prezzi, stessi upload.

## Punto 6 — Percentuale caparra in un unico posto

Oggi il 20% è scritto a mano in più punti (creazione prenotazione admin, aggiornamento prenotazione, testi della pagina "Nuova prenotazione"). Cambiarlo richiederebbe quattro modifiche separate, con il rischio che una resti indietro.

Cosa faccio: una sola costante condivisa (percentuale + calcolo dell'importo), usata sia dal backend sia dai testi in pagina, così la scritta "20%" e il calcolo restano sempre coerenti. Il valore resta 20%: nessuna differenza sugli importi.

## Punto 7 — Gestione foto/video/brochure centralizzata

Oggi caricamento, indirizzo pubblico e cancellazione dei file sono copiati in tre file diversi (appartamenti, progetti, procedura guidata appartamento), con i nomi degli archivi ripetuti come testo libero.

Cosa faccio: un unico modulo che si occupa di caricare immagini, video e PDF, ricavarne il link pubblico ed eliminarli in sicurezza (compreso il controllo anti-percorsi malevoli già presente). Le tre schermate lo richiamano al posto del codice duplicato. Comportamento identico, inclusi i messaggi di errore.

## Punto 8 — Accesso ai dati nelle schermate (ambito ridotto)

L'audit segnalava circa 90 letture/scritture dirette sparse nelle pagine. Rifarle tutte in un colpo sarebbe rischioso, quindi procedo solo dove il beneficio è alto e il rischio basso:

- Gestione appartamenti admin: elenco, salvataggio, attivazione, evidenza, ordinamento e cancellazione spostati in un unico punto riutilizzabile.
- Progetti admin: elenco e salvataggio spostati allo stesso modo.

Le altre pagine (profilo cliente, dettaglio prenotazione, area admin prenotazioni) restano come sono: sono legate a prenotazioni e pagamenti e le tratterei in un intervento dedicato, con test più ampi.

## Verifica dopo le modifiche

- Controllo che il progetto compili senza errori.
- Prova in anteprima del percorso admin: apertura elenco appartamenti, modifica di una scheda, attivazione/disattivazione, riordino, apertura pagina progetti.
- Controllo dei messaggi di errore in console durante la navigazione.
- Confronto degli importi caparra su una prenotazione esistente prima/dopo, per confermare che non cambiano.

## Dettagli tecnici

- Nuovo `src/lib/bookingDeposit.ts` con `DEPOSIT_RATE = 0.2`, `DEPOSIT_PERCENT_LABEL` e `calcDeposit(total)`; gemello lato edge in `supabase/functions/_shared/booking-pricing.ts` (esportato da lì per non duplicare). Aggiornati `admin-create-booking/index.ts:226`, `admin-update-booking/index.ts:138`, `AdminPrenotazioneNuova.tsx:345,354`, e la descrizione riga Stripe.
- Nuovo `src/lib/mediaStorage.ts`: `BUCKETS`, `uploadImage`, `uploadVideo`, `uploadPdf`, `getPublicUrl`, `removeFiles`, `extractStoragePath` (spostato da `AdminAppartamenti.tsx`). Consumato da `AdminAppartamenti.tsx`, `AdminProgetti.tsx`, `ApartmentWizard.tsx`.
- Nuovo `src/hooks/useAdminApartments.ts` (query + mutation con invalidazione di `apartments-public`/`apartment-public`) e `src/hooks/useAdminProjects.ts`. Le pagine mantengono la stessa UI e gli stessi toast.
- Nessuna migrazione di database, nessun cambio di RLS, nessun ridispiego di funzioni oltre alle due toccate dal punto 6.

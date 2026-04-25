# Piano di intervento – Feedback Bazhouse

Il report contiene 11 aree di intervento più la conclusione. Le raggruppo per fasi logiche, dalle modifiche più impattanti (flusso prenotazioni / pagamenti) a quelle UX/branding.

## ✅ Fase 1 – Riallineamento stati prenotazione (Punto 5) — COMPLETATA

Stato attuale: dopo il pagamento Stripe, la prenotazione passa automaticamente a `confirmed`. Va invertita la logica.

- Estendere l'enum `booking_status` con i valori mancanti: `awaiting_verification` (pagato online ma in attesa conferma admin), mantenere `pending`, `confirmed`, `cancelled`, aggiungere `paid` (saldata).
- Aggiungere stato `incomplete` per prenotazioni dove l'utente non ha completato il pagamento (vedi Fase 4).
- Modificare `confirm-booking-payment`: dopo pagamento Stripe → stato `awaiting_verification` invece di `confirmed`.
- Aggiungere bottone admin "Conferma prenotazione" su `AdminPrenotazioneDetail` per passare manualmente da `awaiting_verification` → `confirmed`.
- Aggiornare etichette/badge di stato in tutta l'app con colori distinti.

## ✅ Fase 2 – Pagamenti manuali admin (Punto 6.2) — COMPLETATA

- Nuova sezione "Salda prenotazione" in `AdminPrenotazioneDetail` con dialog:
  - Metodo di pagamento (select): contanti, all'arrivo, bonifico bancario, altro
  - Campo libero "Altro metodo" (visibile solo se selezionato "altro")
  - Note opzionali
  - Importo (precompilato col saldo residuo)
- Nuova tabella `manual_payments` (booking_id, method, custom_method, amount, notes, created_by, created_at) per tracciamento.
- Al conferma: aggiorna `bookings.amount_paid`, se totale raggiunto → `status = 'paid'` e automaticamente `confirmed`.
- Mantiene la funzione esistente "Genera link pagamento" (Punto 6.1 già OK).

## ✅ Fase 3 – Sistema notifiche admin (Punto 4) — COMPLETATA

- Nuovo hook `useAdminNotifications` che conta in realtime prenotazioni in `pending`, `awaiting_verification`, `incomplete`.
- Pallino rosso animato sulla voce "Prenotazioni" della sidebar admin con badge numerico.
- Filtri rapidi nella lista `AdminPrenotazioni` per stato + ordinamento "da gestire prima".
- Sottoscrizione realtime su `bookings` (mantenere se già attiva, altrimenti polling ogni 60s per ridurre cloud usage).

## ✅ Fase 4 – Recupero prenotazioni non completate (Punto 7) — COMPLETATA

- Prenotazione salvata con `status='incomplete'` già al checkout (prima era solo dopo pagamento riuscito).
- Colonna `resume_token` univoca + colonna `recovery_email_sent_at` per evitare invii multipli.
- Template email `booking-recovery` con link "Riprendi prenotazione".
- Edge function `send-booking-recovery` schedulata via pg_cron ogni ora (minuto 15): trova prenotazioni incomplete da più di 24h non ancora notificate.
- Route pubblica `/riprendi/:token` che mostra riepilogo e ripristina lo stato del wizard saltando direttamente al recap.
- Le prenotazioni incomplete sono già visibili in dashboard admin con badge arancione (Fase 3).

## ✅ Fase 5 – Calendario disponibilità admin (Punto 2) — COMPLETATA

- Nuova tabella `apartment_availability_blocks` (apartment_id, start_date, end_date, reason, created_by) con RLS: lettura pubblica, scrittura solo admin.
- Nuovo componente `AvailabilityManagerDialog` accessibile dalla card di ogni appartamento in `AdminAppartamenti` (icona calendario):
  - Calendario shadcn `Calendar` mode="range" con date passate disabilitate
  - Date già prenotate visualizzate barrate (rosso) e non selezionabili
  - Date già bloccate manualmente evidenziate (arancione)
  - Campo motivo opzionale + lista blocchi attivi con eliminazione
  - Sidebar con elenco prenotazioni attive
- `AvailabilityCalendar` pubblico aggiornato: legge sia `bookings` (tutti gli stati attivi) sia `apartment_availability_blocks`.

## ✅ Fase 6 – Ordinamento appartamenti homepage (Punto 3) — COMPLETATA

- Aggiunte colonne `display_order` (int, default 999) e `is_featured` (bool, default false) ad `apartments`. Backfill iniziale basato sull'ordine alfabetico.
- Drag & drop in `AdminAppartamenti` tramite `@dnd-kit/core` + `@dnd-kit/sortable`. Handle visibile in hover sulla card, con persistenza ottimistica (incrementi da 10 in 10 per future inserzioni).
- Toggle "In evidenza" con icona stella sulla card admin: badge dorato visivo + ring sul card per gli appartamenti featured.
- `useApartments` aggiornato con ordinamento `is_featured DESC, display_order ASC, name ASC` (riflettuto in homepage e listing pubblico).
- Componente `SortableApartmentCard` estratto per pulizia e riusabilità.

## Fase 7 – Google Places autocomplete (Punto 1)

- Integrare Google Places Autocomplete nell'`ApartmentWizard` campo indirizzo.
- Richiede chiave API Google: chiederò all'utente di fornirla via Cloud Secrets (`GOOGLE_MAPS_API_KEY`).
- Componente `AddressAutocomplete` con debounce, suggerimenti e validazione automatica (popola anche città, CAP, paese, lat/lng).
- Salvataggio coordinate per uso futuro in mappa.

## ✅ Fase 8 – P.IVA internazionale (Punto 9) — COMPLETATA

- `isValidFiscalCode(value, country?)` ora accetta formati internazionali con validazione adattiva:
  - IT → CF (16 alfanumerici) o P.IVA (11 cifre)
  - Paesi UE → formato VAT EU (con/senza prefisso paese, 8-12 alfanumerici)
  - Altri paesi → 4-20 caratteri alfanumerici
- Helpers `getFiscalCodeLabel`, `getFiscalCodePlaceholder`, `getFiscalCodeHint`, `resolveCountryCode` (riconosce nome italiano/inglese o codice ISO).
- Etichetta dinamica del campo nel wizard: "Codice Fiscale / P.IVA" (IT) → "VAT / P.IVA" (UE) → "Tax ID / VAT / P.IVA" (altri).
- Validazione + placeholder + hint del messaggio di errore aggiornati in `StepBilling.tsx`, `Prenota.tsx`, `AdminPrenotazioneNuova.tsx`.

## ✅ Fase 9 – UX comunicazione & email (Punto 8 + 10.1) — COMPLETATA

- Nuovo file `src/lib/contacts.ts` come single source of truth per email/telefono/WhatsApp.
- `PrenotazioneSuccesso.tsx`: messaggio "Verrai contattato per organizzare il pagamento…" ora in tipografia grande (`text-xl/2xl serif`), centrato, con box dedicato. Sotto: CTA WhatsApp prominente (verde, pieno-larghezza) + numero telefono cliccabile.
- Nuovo componente email `_brand-footer.tsx` con bottone WhatsApp + recapiti completi (email, telefono, indirizzo, anno).
- Tutti i template transazionali (`booking-confirmation`, `booking-recovery`, `balance-paid`, `balance-payment-request`, `balance-reminder`, `welcome`) aggiornati per usare `<BrandFooter />`.
- Edge function `send-transactional-email` ridistribuita.

## ✅ Fase 10 – Logo browser/favicon (Punto 10.2) — COMPLETATA

- Sostituito `public/favicon.ico` con `public/favicon.png` (logo H bag con sfondo trasparente).
- Aggiornato `index.html`: `<link rel="icon">` PNG, `apple-touch-icon` e `theme-color` brand verde scuro.

---

## Approccio proposto

Procediamo per fasi indipendenti, ciascuna verificabile. Suggerisco quest'ordine di priorità (alto impatto operativo prima):

1. **Fase 1 + 2 + 3** insieme – cuore operativo (stati, pagamenti manuali, notifiche)
2. **Fase 4** – recupero prenotazioni
3. **Fase 5** – calendario disponibilità
4. **Fase 6** – ordinamento homepage
5. **Fase 8 + 9** – validazione P.IVA + UX email
6. **Fase 7** – Google Places (richiede API key)
7. **Fase 10** – favicon (richiede asset)

## Domande per te

- Confermi di voler procedere su **tutte** le fasi nell'ordine sopra, oppure preferisci concentrarti prima solo su un sottoinsieme (es. Fasi 1-3)?
- Per la **Fase 7** (Google Places), hai già una chiave Google Maps API o vuoi che ti guidi nel crearla?
- Per la **Fase 10** (favicon/logo), hai già gli asset aggiornati di Valentina pronti da caricare?

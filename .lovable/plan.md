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

## Fase 4 – Recupero prenotazioni non completate (Punto 7)

- Quando il wizard pubblico arriva al checkout Stripe, salvare già la prenotazione con `status='incomplete'` (oggi viene salvata solo a pagamento riuscito).
- Token univoco per ripresa: nuova colonna `resume_token` in `bookings`.
- Email automatica al cliente dopo X ore con link "Riprendi prenotazione" che ripopola il wizard.
- Sezione admin "Prenotazioni non concluse" con azioni: contatta via WhatsApp, completa manualmente, cancella.

## Fase 5 – Calendario disponibilità admin (Punto 2)

- Nuova tabella `apartment_availability_blocks` (apartment_id, start_date, end_date, reason, created_by).
- Sezione "Disponibilità" nella scheda appartamento (`AdminAppartamenti` → dialog dettaglio):
  - Calendario interattivo basato su `react-day-picker` (già installato per shadcn `Calendar`)
  - Selezione range per bloccare/sbloccare periodi
  - Visualizzazione date già occupate da prenotazioni confermate (non modificabili)
- Aggiornare `AvailabilityCalendar` lato pubblico per leggere anche i blocchi manuali.

## Fase 6 – Ordinamento appartamenti homepage (Punto 3)

- Aggiungere colonne ad `apartments`: `display_order` (integer, default 999) e `is_featured` (boolean, default false).
- Drag & drop nella pagina `AdminAppartamenti` per riordinare (libreria leggera tipo `@dnd-kit/core`).
- Toggle "In evidenza" per appartamento; gli featured ottengono badge visivo + posizione prioritaria.
- Aggiornare `useApartments` con ordinamento `is_featured DESC, display_order ASC, name ASC`.

## Fase 7 – Google Places autocomplete (Punto 1)

- Integrare Google Places Autocomplete nell'`ApartmentWizard` campo indirizzo.
- Richiede chiave API Google: chiederò all'utente di fornirla via Cloud Secrets (`GOOGLE_MAPS_API_KEY`).
- Componente `AddressAutocomplete` con debounce, suggerimenti e validazione automatica (popola anche città, CAP, paese, lat/lng).
- Salvataggio coordinate per uso futuro in mappa.

## Fase 8 – P.IVA internazionale (Punto 9)

- Aggiornare `isValidFiscalCode` in `bookingValidation.ts` per accettare formati internazionali.
- Validazione adattiva basata su `billing_country`:
  - IT → CF 16 char o P.IVA 11 cifre
  - UE → formato VAT EU (IT12345678901, DE123456789, ecc.)
  - Altri paesi → 4-20 caratteri alfanumerici
- Etichetta dinamica del campo: "P.IVA / VAT / Tax ID".

## Fase 9 – UX comunicazione & email (Punto 8 + 10.1)

- `PrenotazioneSuccesso.tsx`: rendere il messaggio "Verrai contattato per organizzare il pagamento e il saldo finale prima del check-in." in tipografia grande e centrata.
- Aggiungere CTA WhatsApp diretto (link `wa.me`) sotto il messaggio.
- Template email `booking-confirmation.tsx` e tutti i template transazionali:
  - footer con recapiti completi (telefono, email, indirizzo)
  - bottone WhatsApp cliccabile
- Template email `recovery.tsx` (reset password): aggiungere logo Bazhouse in header (già presente in altri template, allineare).

## Fase 10 – Logo browser/favicon (Punto 10.2)

- Sostituire `public/favicon.ico` con asset corretto fornito da Valentina.
- Aggiornare `index.html` con `<link rel="icon">` multi-size (16, 32, 192, 512) e apple-touch-icon.
- Verificare logo nella navbar non sia compresso.

**Nota**: per questa fase servirà che l'utente carichi gli asset aggiornati dal designer.

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

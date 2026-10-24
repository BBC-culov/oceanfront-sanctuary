# Correzione dei finding del secondo audit qualità del codice

Obiettivo: risolvere i finding rimasti senza cambiare nulla di quello che l'utente vede o può fare. Grafica, testi, prezzi, caparra 20%, saldo 80%, regole di prenotazione, pagamenti, database ed email restano identici. Si procede a fasi; dopo ogni fase si verifica che tutto funzioni ancora e, se qualcosa si rompe, si annulla quella fase.

## Fase 1 — Correzioni piccole e sicure

1. **Selezione appartamenti nella gestione proprietari**: la riga che aggiunge/toglie un appartamento dalla selezione viene riscritta in forma chiara (stesso comportamento).
2. **Controlli dei campi "slug"** (progetti e modulo richieste): si tolgono caratteri inutili dalle regole di controllo. Accettano esattamente gli stessi valori.
3. **Export PDF proprietario**: il blocco di errore vuoto registra l'errore in console invece di ignorarlo in silenzio. Il PDF resta identico.
4. **Meta Pixel**: il codice di avvio viene riscritto senza costrutti deprecati. Stessi eventi, stesso rispetto del consenso cookie.
5. **Avvisi di aggiornamento dati** (pannello richieste di modifica, dettaglio prenotazione cliente): funzioni rese stabili e dipendenze completate, senza ricaricamenti in loop.
6. Rimozione di 2 commenti di disattivazione controlli non più necessari.

## Fase 2 — Notifiche a schermo unificate

7. Oggi convivono due sistemi di notifiche (17 file con uno, 10 con l'altro). Si passa tutto a un solo sistema, mantenendo l'aspetto attuale: i messaggi di errore restano rossi, quelli di successo restano come ora. Il secondo sistema viene rimosso solo quando nessun file lo usa più. Se un messaggio cambiasse aspetto, quel file resta com'è.

## Fase 3 — Pagine admin ancora troppo grandi

8. **Nuova prenotazione admin**: i controlli dei 4 passaggi vengono spostati in un file dedicato, un controllo per passaggio. Stessi messaggi, stesso ordine.
9. **Controlli del modulo Prenota cliente**: stessa separazione per passaggio. Stessi messaggi.
10. **Servizi extra admin**: caricamento, salvataggio, eliminazione e riordino spostati in un hook. Stesso riordino drag-and-drop.
11. **Proprietari admin**: dati e assegnazione appartamenti spostati in un hook; dialoghi in componenti separati.
12. **Progetti admin**: modulo e caricamento foto/video/brochure spostati in componenti separati. Stessi limiti di dimensione file.

## Fase 4 — Tipi di dato

13. Sostituzione progressiva dei tipi generici ("any", ~185 punti) con tipi precisi, partendo da hook e pagine admin. Nessun cambiamento di comportamento: è solo descrizione dei dati, verificata dal controllo dei tipi.

## Cosa non viene toccato

- Database, regole di accesso, funzioni server, Stripe.
- Testi, colori, font, layout, indirizzi delle pagine, caricamento differito delle pagine.
- File generati automaticamente e componenti di libreria.

## Dettagli tecnici

- Fase 1: `AdminProprietari.tsx:131` if/else; `AdminProgetti.tsx:36`, `ProjectInquiryForm.tsx:73` regex senza `\-`; `ownerPdfExport.ts:24` catch con `console.error`; `metaPixel.ts:32` rest params; `useCallback` per `load` in `ModificationRequestsPanel.tsx` e `reloadBooking` in `useBookingDetail.ts`; rimozione `eslint-disable` in `AdminUserFormDialog.tsx`/`AdminUserDeleteDialog.tsx`.
- Fase 2: migrazione `@/hooks/use-toast` → `sonner` (`variant: "destructive"` → `toast.error`, title+description → `toast(title, { description })`); poi rimozione `<Toaster />` da `App.tsx`.
- Fase 3: nuovi `src/lib/adminBookingValidation.ts`, `src/lib/bookingWizardValidation.ts`, `src/hooks/useAdminServices.ts`, `src/hooks/useAdminOwners.ts`, `src/components/admin/progetti/*`, `src/components/admin/proprietari/*`.
- Fase 4: tipi da `src/integrations/supabase/types.ts` (`Tables<...>`), `unknown` + narrowing nei catch.

## Verifica (dopo ogni fase)

1. Build, controllo tipi e ESLint senza nuovi errori; test esistenti verdi.
2. Nuovi test: controlli dei passaggi prenotazione (date mancanti, ospiti, telefono, codice fiscale) con gli stessi esiti di oggi.
3. Prova nel browser con account di test: home, catalogo, prenotazione fino al riepilogo, area personale, admin (nuova prenotazione, servizi, proprietari, progetti, notifiche di conferma ed errore), panoramica proprietario ed export PDF.
4. Controllo errori a runtime; in caso di problemi si ripristina la fase.

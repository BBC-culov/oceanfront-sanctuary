# Correzione di tutti i finding dell'audit qualità del codice

Obiettivo: risolvere i 10 finding senza cambiare nulla di quello che l'utente vede o può fare. Grafica, testi, prezzi, regole di prenotazione, pagamenti, database ed email restano identici. Si lavora a piccoli passi e dopo ogni passo si verifica che tutto funzioni ancora.

## Fase 1 — Correzioni rapide e sicure

1. **Caparra nel riepilogo prenotazione**: il riepilogo usa la funzione condivisa della caparra al 20% invece del numero scritto a mano. L'importo mostrato resta lo stesso.
2. **Numero WhatsApp nella pagina "Pagamento non riuscito"**: il pulsante "Richiedi assistenza" porta al numero ufficiale +39 347 750 4352 (preso dai contatti centralizzati) invece del vecchio numero. È l'unico cambiamento visibile: il link ora funziona.
3. **Provvigione proprietari 15%**: spostata in una costante condivisa con nome chiaro. Stesso valore, stessi calcoli.
4. **Calendario disponibilità admin**: si sistema il caricamento dei dati per evitare avvisi e dati vecchi. Stesso comportamento.
5. **Pagina Affitta non più usata**: si elimina il file (l'indirizzo /affitta continua a portare a /appartamenti).

## Fase 2 — Dialoghi di modifica prenotazione (cliente e admin)

6. I campi uguali nei due dialoghi (date, ospite principale, documenti, voli, orari, servizi extra, elenco ospiti) diventano un unico blocco condiviso. Ogni dialogo mantiene le sue regole: il cliente invia una richiesta, l'admin salva direttamente. Stesse validazioni, stessi messaggi, stesso prezzo ricalcolato dal server.

## Fase 3 — Pagine troppo grandi

7. **Panoramica proprietario**: calcoli delle metriche in un hook dedicato, creazione del PDF in un file a parte, grafici in blocchi separati. Stessi numeri, stesso PDF.
8. **Gestione amministratori**: i dialoghi (nuovo utente, modifica, eliminazione) diventano componenti separati; le chiamate al server in un hook. Stessa email con credenziali, stessi ruoli.
9. **Pagina Prenota**: lo stato della procedura in 4 passaggi in un hook `useBookingWizard`. Restano identici: obbligo di accesso, ripresa prenotazione da link, eventi Meta Pixel, pagamento caparra/totale con Stripe.
10. **Mappa transfer**: coordinate e percorsi spostati in un file di dati. Mappa identica.

## Fase 4 — Notifiche a schermo

11. Oggi convivono due sistemi di notifiche. Si uniscono su uno solo, mantenendo l'aspetto attuale dei messaggi (inclusi quelli di errore rossi). Se la conversione di un messaggio cambiasse l'aspetto, quel file resta com'è.

## Cosa non viene toccato

- Database, regole di accesso ai dati e funzioni server.
- Testi, colori, font, layout, indirizzi delle pagine.
- Prezzi, caparra 20%, saldo 80%, notti, servizi per notte, orari check-in/check-out.

## Dettagli tecnici

- Nuovi file previsti: `src/lib/ownerFees.ts`, `src/lib/ownerPdfExport.ts`, `src/hooks/useOwnerOverviewMetrics.ts`, `src/components/proprietario/overview/*`, `src/components/admin/gestione/*`, `src/hooks/useAdminUsers.ts`, `src/hooks/useBookingWizard.ts`, `src/components/booking/BookingModificationFormFields.tsx`, `src/components/sections/transferMapData.ts`.
- `StepRecap.tsx` usa `calcDeposit()`; `PagamentoFallito.tsx` usa `BRAND_CONTACTS.whatsappUrl`.
- `AvailabilityManagerDialog.tsx`: `loadData` in `useCallback` con dipendenze `apartmentId`/`open`.
- Notifiche: migrazione da `use-toast` a `sonner` mappando `variant: "destructive"` su `toast.error`; rimozione di `<Toaster />` da `App.tsx` solo a migrazione completata.
- Lazy loading delle route in `App.tsx` invariato (regola di progetto).

## Verifica (dopo ogni fase)

1. Build senza errori e test esistenti verdi.
2. Nuovi test: caparra del riepilogo = 20% del totale; provvigione proprietario = 15%.
3. Prova nel browser con account di test: home, catalogo, dettaglio appartamento, prenotazione fino al riepilogo (importo caparra corretto), pagina pagamento fallito (link WhatsApp corretto), area personale e richiesta modifica, admin (prenotazioni, modifica prenotazione, gestione utenti, calendario), panoramica proprietario ed export PDF.
4. Controllo degli errori a runtime. Se una fase mostra un problema, si ripristina quella fase prima di passare alla successiva.

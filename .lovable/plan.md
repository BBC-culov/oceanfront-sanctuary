
# Piano: Doppio percorso Affitta / Compra

## 1. Homepage (`/`) — Hero con due percorsi
- Mantenere l'attuale homepage come hub
- Sostituire il pulsante "Scopri gli appartamenti" con due CTA:
  - **Voglio affittare** → `/affitta` (la homepage attuale dei contenuti affitti)
  - **Voglio comprare** → `/compra`
- Nel menu principale (Navbar) sostituire la voce "Appartamenti" con due voci: **Affitta** e **Compra**

## 2. Sezione Affitta (`/affitta`)
- Replica della homepage attuale (hero, descrizione, elenco appartamenti, calendario, servizi, mappa, chi siamo, contatti)
- Menu mostra le voci attuali + voce extra **Compra** che porta a `/compra`
- Nessuna modifica alle logiche esistenti di prenotazione/calendario

## 3. Nuova sezione Compra (`/compra`)
- Stesso linguaggio visivo (font Cormorant + Outfit, palette sand/beige/ocean/green)
- **Menu dedicato**: Home (`/compra`), Chi siamo, Contatti — niente Appartamenti/Servizi/Calendario
- **Hero** con copy provvisorio orientato all'investimento (es. "Investi in Boa Vista. Progetti immobiliari curati, rendita e lifestyle.") + CTA "Scopri i progetti" che scrolla alla lista progetti
- **Sezione progetti**: griglia di card alimentate da nuova tabella `projects`
- **Footer/Chi siamo/Contatti**: riusati con stesse pagine

## 4. Scheda dettaglio progetto (`/compra/progetti/:slug`)
Campi mostrati:
- Galleria fotografica (lightbox come per appartamenti)
- Video render (player se presente)
- Descrizione completa
- Posizione con link **Google Maps** e **Apple Maps**
- Servizi inclusi (lista)
- Prezzo del progetto
- Modalità di prenotazione / opzione di acquisto (testo libero)
- **Form richiesta informazioni** (nome, email, telefono con prefisso, messaggio) → invia email via funzione esistente
- Informazioni di contatto
- Nessun check-in/check-out, nessun calendario, nessuna logica di booking

## 5. Database — nuova tabella `projects`
Campi principali:
- titolo, slug, sottotitolo, descrizione
- prezzo (numero) + label prezzo opzionale (es. "A partire da")
- immagini (array URL), video URL
- coordinate (lat/lng) + indirizzo testuale, link Google Maps, link Apple Maps
- servizi inclusi (array)
- modalità acquisto (testo)
- contatto referente (email/telefono)
- pubblicato (boolean), ordinamento

Richieste informazioni salvate in tabella `project_inquiries` (nome, email, telefono, messaggio, project_id).

Storage: nuovo bucket pubblico `project-media` per foto/video.

## 6. Admin panel
- Nuova voce sidebar **Progetti** → `/admin/progetti`
- Lista progetti con CRUD, riordino drag-and-drop, toggle pubblicato
- Form progetto con upload multiplo immagini e upload video
- Nuova voce **Richieste Progetti** → lista inquiries con stato letto/non letto

## 7. Dettagli tecnici
- Routing: aggiungere `/affitta`, `/compra`, `/compra/progetti/:slug` in `App.tsx`. La rotta `/` diventa una landing minimal con hero + 2 CTA (riusando layout esistente); in alternativa, `/` resta l'attuale homepage affitti e i due CTA puntano a `/` e `/compra` — **scelta proposta**: `/` = hub con 2 CTA, `/affitta` = ex homepage.
- Navbar: rendere link configurabile in base alla "sezione" corrente (affitta vs compra) per mostrare il menu giusto.
- Email inquiry: riuso edge function `send-transactional-email` con nuovo template `project-inquiry`.
- Memoria progetto: aggiornare l'index per riflettere la nuova architettura a due percorsi.

## Copy provvisorio Hero Compra
> **Investi a Boa Vista.**
> Progetti immobiliari selezionati, costruiti con la stessa cura con cui ospitiamo. Rendita, lifestyle, una casa al mare che lavora per te.
> CTA: *Scopri i progetti*

## Fuori scope (per ora)
- Pagamento online del progetto
- Area cliente lato acquirente
- Multilingua della sezione Compra (resta in italiano come il resto)

# Dashboard autonoma su gestione.bazhouse.com

Obiettivo: questo progetto diventa solo la dashboard di gestione su `gestione.bazhouse.com`. Le pagine del vecchio sito vengono **disattivate, non eliminate** (file conservati, ripristinabili in qualsiasi momento). Dati, prenotazioni, pagamenti Stripe, email e funzioni admin restano identici.

## Cosa cambia per te

1. Aprendo `gestione.bazhouse.com` compare subito la schermata di accesso. Dopo l'accesso:
   - admin / super admin → dashboard `/admin`
   - proprietario → area `/proprietario`
   - chiunque altro → messaggio "Accesso non autorizzato" con pulsante Esci.
2. Tutte le vecchie pagine pubbliche (home, appartamenti, compra, servizi, chi siamo, contatti, prenota, profilo, registrati) non sono più raggiungibili: rimandano alla schermata di accesso.
3. Restano attive solo le pagine che servono ai clienti dopo un'azione della dashboard:
   - conferma pagamento riuscito e pagamento fallito (ritorno da Stripe)
   - reset password e annullamento iscrizione email
   - privacy policy, refund policy, rental agreement (linkate in email e pagamenti)
4. Nessuna navbar, footer, banner cookie, pulsante WhatsApp o pixel Meta del vecchio sito.
5. Il sito non viene più indicizzato da Google (noindex + robots che blocca tutto, sitemap rimossa dalla pubblicazione).

## Cosa devi fare tu (dopo che ho finito)

1. Nelle impostazioni dominio del progetto: aggiungere `gestione.bazhouse.com`, impostarlo come Primary, poi scollegare `bazhouse.com` e `www.bazhouse.com` (così restano liberi per il nuovo sito vetrina).
2. Su Hostinger aggiungere i record che Lovable mostra per `gestione` (A + TXT `_lovable.gestione`). Non toccare MX, TXT posta e `thewomanreset`.
3. Pubblicare.
Ti guiderò passo per passo e verificherò i DNS.

## Dettagli tecnici

- `src/App.tsx`: le route pubbliche vengono commentate/racchiuse in un flag `PUBLIC_SITE_ENABLED = false` (in `src/lib/siteMode.ts`); con il flag spento reindirizzano a `/`. Import lazy delle pagine disattivate non eseguiti. File delle pagine intatti.
- Nuova pagina `src/pages/GestioneLogin.tsx` su `/`: login email/password (stile esistente), recupero password, redirect per ruolo usando la logica ruoli già presente (`user_roles`). Utente loggato senza ruolo → schermata non autorizzato.
- `AdminLayout` / `ProprietarioLayout`: link "torna al sito" e redirect di logout puntati a `/`.
- Layout globale: Navbar, Footer, CookieBanner, WhatsApp FAB, Meta Pixel e SiteLoader del sito vetrina disattivati con lo stesso flag; `MaintenanceGuard` non blocca più la dashboard.
- Pagine conservate (`/prenotazione-successo/:id`, `/pagamento-fallito`, `/reset-password`, `/unsubscribe`, policy): versione senza navbar/footer, link "torna al sito" rimossi o sostituiti.
- Indirizzi nelle funzioni backend ed email: una costante unica `SITE_URL = https://gestione.bazhouse.com` in `supabase/functions/_shared/`, usata per success/cancel URL Stripe (`create-booking-payment`, `pay-booking-balance`, `create-balance-payment-link`, `create-modification-payment-link`, `admin-create-booking`, `admin-update-booking`), link reset/invito in `auth-email-hook`, `manage-admin`, template email. Logo e contatti nelle email (info@bazhouse.com) invariati. Allowlist redirect/CORS aggiornata includendo il nuovo dominio (mantenendo temporaneamente bazhouse.com per i link già inviati).
- Link email che puntavano a pagine ora disattivate (es. `/profilo`, `/prenotazione/:id`, `/riprendi/:token`): rimossi dalle email o sostituiti con contatto diretto; segnalo prima eventuali casi dubbi.
- Auth: Site URL e redirect consentiti aggiornati a `https://gestione.bazhouse.com`.
- SEO: `index.html` title/description "BAZHOUSE Gestione", `noindex,nofollow`; `public/robots.txt` → `Disallow: /`; sitemap e llms.txt spostati fuori da `public/` (conservati).
- `AGENTS.md`: regola sul flag sito pubblico; memoria aggiornata con il nuovo dominio.

## Verifiche

- Test esistenti + nuovi test: route disattivate reindirizzano a `/`; redirect per ruolo; URL backend usano il nuovo dominio.
- Playwright: login admin → tutte le sezioni admin si aprono; vecchie pagine → login; pagina pagamento riuscito/fallito e reset password visibili.
- Prova reale: prenotazione manuale di test con link Stripe → ritorno su `gestione.bazhouse.com/prenotazione-successo`, poi cancellazione della prova.
- Deploy funzioni backend modificate e controllo log.

## Escluso

Nessuna modifica a database, prezzi, logica pagamenti, permessi o grafica della dashboard. Nessun file eliminato.

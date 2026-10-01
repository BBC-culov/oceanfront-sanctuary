# Pacchetto SEO finale — implementazione (impatto visivo zero)

Il sito deve restare identico: nessun cambio di grafica, testi visibili, Navbar, prenotazione, Stripe, login, database o tracciamento Meta Pixel. Si lavora solo su metadati invisibili, dati strutturati e file per i motori di ricerca.

## Cosa verrà fatto

1. **Velocità di caricamento**: collegamento anticipato ai server dei font di Google, così i caratteri arrivano prima.
2. **Logo per Google**: nella scheda aziendale per Google si usa il logo ad alta risoluzione al posto della piccola icona.
3. **Indirizzo ufficiale pulito**: ogni pagina dichiara a Google sempre lo stesso indirizzo, senza barre finali doppie.
4. **Percorso di navigazione per Google** (Home › Pagina) su Servizi, Chi siamo, Contatti, Compra, Appartamenti.
5. **Servizi descritti a Google**: transfer aeroporto A/R, concierge e pulizie, noleggio veicoli.
6. **Pagine legali riconosciute** come parte del sito (Privacy, Contratto di affitto, Rimborsi).
7. **Anteprime social dedicate**: condividendo Servizi, Chi siamo e Contatti appare la foto principale di quella pagina invece di quella generica.
8. **Regole per Bing allineate a Google**: anche Bing ignora prenotazione, pagamenti, reset password, disiscrizione.

## Verifica

- Controllo tecnico ed esecuzione dei test.
- Controllo nel browser: le pagine si caricano senza errori, il percorso di prenotazione resta uguale, il codice letto da Google contiene i nuovi dati.
- Revisione SEO rapida finale.

## Escluso (richiede modifiche visibili o esterne)

Testi geolocalizzati, FAQ visibili, guide/blog, versione inglese, Google Business Profile, link da partner.

## Dettagli tecnici

- `index.html`: preconnect `fonts.googleapis.com` / `fonts.gstatic.com` (crossorigin); `LodgingBusiness.image` → `https://bazhouse.com/logo-bazhouse-dark.png`.
- `src/components/Seo.tsx`: `canonical = SITE_URL + (pathname.replace(/\/+$/, "") || "/")`, usato anche per `og:url`.
- `BreadcrumbList` aggiunto via prop `jsonLd` (convertita in array dove già presente) in Servizi, ChiSiamo, Contatti, Compra, Appartamenti.
- `Servizi.tsx`: 3 nodi `Service` con `provider: { "@id": "https://bazhouse.com/#lodging" }`, `areaServed: Boa Vista`.
- PrivacyPolicy / RentalAgreement / RefundPolicy: `WebPage` con `isPartOf: { "@id": "https://bazhouse.com/#website" }`.
- `image` su `<Seo />` con le immagini hero già importate nelle pagine (Seo le rende assolute).
- `public/robots.txt`: blocco Bingbot con gli stessi Disallow di Googlebot; resto invariato.
- Verifica: `tsgo`, `vitest`, Playwright sulle pagine toccate + `/prenota`.

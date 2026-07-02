# Perché bazhouse.com non appare (ancora) su Google

## Diagnosi

Il sito è online da meno di 1 settimana e non è mai stato segnalato a Google. In questa condizione **è normale non apparire per nessuna ricerca**, inclusa `site:bazhouse.com`. Google deve prima:

1. **Scoprire** il dominio (via link esterni o segnalazione manuale in Search Console)
2. **Scansionare** le pagine (Googlebot le visita)
3. **Indicizzarle** (decidere di metterle nel proprio indice)
4. **Classificarle** (per keyword competitive: settimane/mesi + autorità)

Per un sito nuovo senza backlink e senza Search Console, il punto 1 può richiedere settimane. Va forzato manualmente.

Nota sulle aspettative:
- `site:bazhouse.com` → apparirà entro **1–3 settimane** dopo aver inviato la sitemap
- Ricerca brand `bazhouse` → **2–6 settimane**
- Keyword generiche tipo *"appartamenti Boa Vista"* → **3–12 mesi**, richiede contenuti + backlink + tempo. Nessuno può garantire la prima pagina in tempi brevi su query competitive.

Il lato tecnico SEO è già a posto (title, meta, canonical, JSON-LD, sitemap, robots.txt, hreflang, geo tag). Il collo di bottiglia oggi è **la comunicazione a Google**, non il codice.

## Cosa faccio in build mode

### 1. Collegamento Google Search Console via connector Lovable
- Aggiungo la proprietà `https://bazhouse.com/` tramite l'API Site Verification
- Genero il **token meta-tag** di verifica Google
- Inserisco il tag `<meta name="google-site-verification" content="..." />` nell'`<head>` di `index.html`
- Ti chiedo di **pubblicare** il sito (necessario perché Google deve leggere il tag sul dominio live)
- Dopo la pubblicazione, chiamo l'endpoint di verifica e aggiungo il sito alle proprietà di Search Console

### 2. Submit della sitemap
- Invio `https://bazhouse.com/sitemap.xml` a Search Console via API
- Richiedo l'ispezione URL delle pagine chiave (home, `/affitta`, `/compra`, `/appartamenti`) per accelerare la scoperta

### 3. Report di stato
- Ti dico esattamente quali pagine risultano *indicizzate*, *scoperte ma non indicizzate*, o *escluse*, con la motivazione fornita da Google
- Se emergono errori tecnici (canonical duplicato, blocco robots, ecc.) li correggo subito

## Cosa NON posso fare al posto tuo

- **Backlink**: Google dà autorità in base a chi ti linka. Serve strategia off-page (directory turismo Capo Verde, PR, partnership, social).
- **Google Business Profile**: se offri servizi locali a Boa Vista, va creata una scheda GBP (fuori dal codice).
- **Contenuti freschi**: un blog con articoli su Boa Vista, guide di viaggio, ecc. aumenta drasticamente le pagine indicizzabili e le query intercettate.

## Prerequisiti da parte tua

- Il connector **Google Search Console** deve essere collegato al workspace Lovable (te lo chiederò al primo step in build mode se non lo è già)
- Devi **pubblicare il sito** dopo che inserisco il meta-tag di verifica, altrimenti Google non può leggerlo

## Dettagli tecnici

- Endpoint usati: `siteVerification/v1/token` (META), `siteVerification/v1/webResource?verificationMethod=META`, `webmasters/v3/sites/{siteUrl}` (PUT), `webmasters/v3/sites/{siteUrl}/sitemaps/{feedpath}` (PUT), `v1/urlInspection/index:inspect`
- Nessuna modifica alla logica applicativa, solo aggiunta di **un meta tag** in `index.html`
- Zero rischi di rottura funzionalità

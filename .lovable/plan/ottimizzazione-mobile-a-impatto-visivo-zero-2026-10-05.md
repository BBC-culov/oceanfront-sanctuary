# Ottimizzazione mobile a impatto visivo zero

## Obiettivo
Ridurre il tempo di caricamento iniziale e il lavoro del browser su smartphone, senza cambiare grafica, testi, navigazione o funzioni.

## Modifiche
- Caricare le pagine solo quando vengono aperte, anziché includere subito anche prenotazioni, profilo, area admin e proprietario.
- Limitare la schermata iniziale al contenuto davvero necessario per la pagina corrente, evitando di scaricare in anticipo quattro immagini principali.
- Dare priorità all'immagine visibile nella prima schermata e riservarle dimensioni stabili.
- Rispettare la preferenza di movimento ridotto del dispositivo e contenere il lavoro delle animazioni sui telefoni meno potenti.
- Mantenere invariati aspetto, testi, URL, pagamenti, autenticazione e dati.

## Verifica
- Controllo automatico dei tipi e test esistenti.
- Controllo del risultato di compilazione e confronto delle dimensioni dei file caricati inizialmente.
- Prova su smartphone simulato di homepage, elenco appartamenti, dettaglio e accesso alla prenotazione.
- Controllo assenza di errori nella console e di sovrapposizioni visive.

## Dettagli tecnici
- `React.lazy` e `Suspense` per suddividere le pagine in file caricati su richiesta.
- Precaricamento selettivo della sola immagine principale, con priorità alta.
- Nessuna modifica al backend o alle regole commerciali.

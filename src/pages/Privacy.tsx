import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const Privacy = () => (
  <PageTransition>
    <Navbar />
    <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl sm:text-4xl text-foreground mb-8"
        >
          Privacy Policy &amp; Cookie Policy
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-sm max-w-none font-sans text-muted-foreground space-y-6"
        >
          <section>
            <h2 className="font-serif text-xl text-foreground mt-0">1. Titolare del Trattamento</h2>
            <p>
              Il titolare del trattamento dei dati è BAZHOUSE, con sede in Boa Vista, Capo Verde.
              Per qualsiasi richiesta: <a href="mailto:info@bazhouse.it" className="text-primary">info@bazhouse.it</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">2. Dati Raccolti</h2>
            <p>Raccogliamo i seguenti dati personali:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dati di registrazione:</strong> nome, cognome, email, telefono</li>
              <li><strong>Dati di prenotazione:</strong> date soggiorno, dati di fatturazione, dati documentali degli ospiti, informazioni sui voli</li>
              <li><strong>Dati tecnici:</strong> cookie tecnici necessari al funzionamento del sito</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">3. Finalità e Base Giuridica</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Esecuzione contrattuale:</strong> gestione prenotazioni e soggiorni</li>
              <li><strong>Obbligo legale:</strong> adempimenti fiscali e comunicazioni alle autorità</li>
              <li><strong>Legittimo interesse:</strong> miglioramento del servizio e sicurezza</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">4. Conservazione dei Dati</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dati del profilo:</strong> conservati fino alla cancellazione dell'account da parte dell'utente</li>
              <li><strong>Dati di prenotazione:</strong> conservati per 10 anni per adempimenti fiscali</li>
              <li><strong>Dati documentali ospiti:</strong> conservati secondo gli obblighi di legge per le strutture ricettive</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">5. Diritti dell'Utente</h2>
            <p>In conformità al GDPR (Regolamento UE 2016/679), hai diritto a:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Accesso:</strong> visualizzare i tuoi dati personali</li>
              <li><strong>Portabilità:</strong> esportare i tuoi dati in formato leggibile (disponibile dal profilo)</li>
              <li><strong>Rettifica:</strong> modificare i tuoi dati personali dal profilo</li>
              <li><strong>Cancellazione:</strong> eliminare il tuo account e tutti i dati associati</li>
              <li><strong>Opposizione:</strong> opporti al trattamento dei tuoi dati</li>
            </ul>
            <p>Per esercitare i tuoi diritti, contattaci a <a href="mailto:info@bazhouse.it" className="text-primary">info@bazhouse.it</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">6. Cookie Policy</h2>
            <p>
              Questo sito utilizza esclusivamente <strong>cookie tecnici</strong> necessari al funzionamento del sito e alla gestione dell'autenticazione. 
              Non utilizziamo cookie di profilazione, cookie analitici di terze parti, né cookie pubblicitari.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Cookie di sessione:</strong> necessari per l'autenticazione e la navigazione</li>
              <li><strong>Cookie di preferenza:</strong> memorizzano le preferenze sui cookie dell'utente</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">7. Sicurezza</h2>
            <p>
              Adottiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati, tra cui: crittografia dei dati in transito (HTTPS), 
              autenticazione sicura con protezione contro password compromesse, politiche di accesso basate sui ruoli (RBAC), 
              e Row-Level Security (RLS) nel database.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">8. Trasferimento Dati</h2>
            <p>
              I dati possono essere trasferiti e trattati al di fuori dell'UE tramite i nostri fornitori di servizi cloud, 
              nel rispetto delle garanzie previste dal GDPR (clausole contrattuali standard).
            </p>
          </section>

          <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border/40">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </motion.div>
      </div>
    </main>
    <Footer />
  </PageTransition>
);

export default Privacy;

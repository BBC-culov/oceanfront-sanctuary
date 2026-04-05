import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const RentalAgreement = () => (
  <PageTransition>
    <Navbar />
    <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl sm:text-4xl text-foreground mb-8"
        >
          Rental Agreement – BAZHOUSE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-sm max-w-none font-sans text-muted-foreground space-y-6"
        >
          <section>
            <h2 className="font-serif text-xl text-foreground mt-0">1. Parties</h2>
            <p>This Rental Agreement ("Agreement") is entered into between:</p>
            <p>EasyClick d.o.o., a company incorporated under Slovenian law, with registered office at Kidričeva ulica 19, 5000 Nova Gorica, Slovenia, VAT No. SI17046459, operating under the brand Bazhouse ("Company"),</p>
            <p>and</p>
            <p>The Customer / Guest ("Guest"), whose details are provided during the booking process.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">2. Subject of the Agreement</h2>
            <p>The Company grants the Guest a temporary, non-exclusive right to use the selected apartment located in Boa Vista, Cabo Verde ("Property") for short-term rental purposes.</p>
            <p>The rental includes the period, price, and conditions specified in the booking confirmation.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">3. Booking and Confirmation</h2>
            <p>A booking is considered confirmed when:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Guest completes the reservation via website, email, or WhatsApp; and</li>
              <li>The Guest pays the required deposit (typically 20% of the total rental price).</li>
            </ul>
            <p>The Company reserves the right to refuse or cancel a booking in case of errors, fraud suspicion, or unavailability.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">4. Payment Terms</h2>
            <p>A deposit of approximately 20% of the total booking amount is required to confirm the reservation. The remaining balance must be paid before check-in or upon arrival, as agreed.</p>
            <p>Accepted payment methods:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>PayPal</li>
              <li>Credit/Debit Card</li>
              <li>Bank Transfer (IBAN)</li>
            </ul>
            <p>Payments are processed via secure third-party providers.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">5. Cancellation Policy</h2>
            <p>Unless otherwise specified:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Deposits are non-refundable.</li>
              <li>Cancellation terms may vary depending on the specific booking conditions communicated at the time of reservation.</li>
            </ul>
            <p>The Company may offer rescheduling at its discretion.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">6. Check-in and Check-out</h2>
            <p>Check-in and check-out times will be communicated before arrival.</p>
            <p>The Guest must provide valid identification upon arrival, as required by local laws.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">7. Guest Obligations</h2>
            <p>The Guest agrees to use the Property with care and respect.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">8. Damages and Liability</h2>
            <p>The Guest is responsible for any damages caused to the Property during their stay.</p>
            <p>The Company reserves the right to charge the Guest for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Property damage</li>
              <li>Missing items</li>
              <li>Excessive cleaning costs</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">9. Security Deposit (if applicable)</h2>
            <p>The Company may require a refundable security deposit, which will be returned after inspection of the Property.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">10. Company Liability</h2>
            <p>The Company shall not be liable for:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Loss or theft of personal belongings</li>
              <li>Injuries occurring during the stay, except in cases of gross negligence</li>
              <li>Service interruptions beyond its control (e.g. utilities, internet)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">11. Force Majeure</h2>
            <p>The Company shall not be held responsible for failure to perform obligations due to events beyond its control, including but not limited to natural disasters, government actions, or travel restrictions.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">12. Data Protection</h2>
            <p>Personal data is processed in accordance with the <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> available on the Website.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">13. Governing Law and Jurisdiction</h2>
            <p>This Agreement is governed by:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Slovenian law (for contractual and corporate matters);</li>
              <li>Applicable laws of Cabo Verde (for property use and local compliance).</li>
            </ul>
            <p>Any disputes shall be subject to the competent courts of Slovenia, unless otherwise required by mandatory law.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">14. Amendments</h2>
            <p>The Company reserves the right to update these terms at any time. The version applicable is the one accepted at the time of booking.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">15. Acceptance</h2>
            <p>By completing a booking, the Guest confirms that:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>They have read and understood this Agreement;</li>
              <li>They accept all terms and conditions;</li>
              <li>They are legally capable of entering into this Agreement.</li>
            </ul>
          </section>

          <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border/40">
            Company: EasyClick d.o.o. (Bazhouse brand) · Last updated: March 2026
          </p>
        </motion.div>
      </div>
    </main>
    <Footer />
  </PageTransition>
);

export default RentalAgreement;

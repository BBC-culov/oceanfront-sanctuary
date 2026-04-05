import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const RefundPolicy = () => (
  <PageTransition>
    <Navbar />
    <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl sm:text-4xl text-foreground mb-8"
        >
          Refund &amp; Cancellation Policy – BAZHOUSE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-sm max-w-none font-sans text-muted-foreground space-y-6"
        >
          <section>
            <h2 className="font-serif text-xl text-foreground mt-0">1. Introduction</h2>
            <p>This Refund &amp; Cancellation Policy ("Policy") governs all bookings made through www.bazhouse.com and related channels (including email and WhatsApp) for apartment rentals in Boa Vista, Cabo Verde.</p>
            <p>Bazhouse is a brand of EasyClick d.o.o., a company incorporated under Slovenian law, with registered office at Kidričeva ulica 19, 5000 Nova Gorica, Slovenia, VAT No. SI17046459 ("Company", "we", "us").</p>
            <p>By making a booking, the Guest agrees to this Policy.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">2. Deposit and Payment Structure</h2>
            <p>A non-refundable deposit equal to 20% of the total booking price is required to confirm the reservation.</p>
            <p>The remaining balance must be paid prior to arrival or at check-in, as specified in the booking confirmation.</p>
            <p>Accepted payment methods include PayPal, credit/debit card, and bank transfer (IBAN), processed via secure third-party providers.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">3. Non-Refundable Deposit</h2>
            <p>The 20% deposit paid at the time of booking is strictly non-refundable, regardless of:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Cancellation date</li>
              <li>Reason for cancellation (including personal reasons, travel issues, or unforeseen events)</li>
              <li>No-show by the Guest</li>
            </ul>
            <p><strong>Liquidated Damages</strong></p>
            <p>The Guest expressly acknowledges and agrees that the 20% deposit constitutes liquidated damages and not a penalty. This amount represents a reasonable pre-estimate of the losses suffered by the Company in the event of cancellation, including but not limited to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Loss of booking opportunity</li>
              <li>Administrative and operational costs</li>
              <li>Marketing and acquisition costs</li>
              <li>Calendar blocking and inventory risk</li>
            </ul>
            <p>The Guest agrees that such amount is fair, proportionate, and justified at the time of booking, and therefore shall not be subject to refund under any circumstances, except where explicitly required by applicable law.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">4. Cancellation by the Guest</h2>
            <p>If the Guest cancels the booking:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The 20% deposit is forfeited in all cases.</li>
              <li>Any additional amounts already paid may be retained or refunded at the Company's sole discretion, unless otherwise agreed in writing.</li>
            </ul>
            <p>The Company may, at its discretion, offer a date change or booking credit, subject to availability and internal policies. Such alternatives are not guaranteed.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">5. No-Show Policy</h2>
            <p>In case of no-show (failure to arrive without prior notice):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The deposit is forfeited;</li>
              <li>The Company reserves the right to cancel the booking and reassign the Property;</li>
              <li>Any additional payments made may be retained.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">6. Changes to Booking</h2>
            <p>Requests for changes (dates, property, number of guests) are subject to availability and approval by the Company.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Price differences may apply;</li>
              <li>Administrative fees may be charged;</li>
              <li>Previously paid amounts remain subject to this Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">7. Extra Services</h2>
            <p>Any additional services requested by the Guest (e.g. transfers, cleaning, special arrangements) are considered part of the booking.</p>
            <p>Payments made for such services are non-refundable once confirmed, unless otherwise agreed in writing.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">8. Cancellation by the Company</h2>
            <p>In rare cases where the Company must cancel a booking due to unforeseen circumstances (e.g. property unavailability, force majeure):</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The Guest will receive a full refund of any amounts paid, including the deposit; or</li>
              <li>An alternative accommodation or date change may be offered.</li>
            </ul>
            <p>The Company shall not be liable for additional costs (e.g. flights, external bookings).</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">9. Force Majeure</h2>
            <p>The Company shall not be held responsible for cancellations or service disruptions caused by events beyond its control, including but not limited to natural disasters, government restrictions, and travel disruptions.</p>
            <p>In such cases, refunds are not guaranteed and will be assessed at the Company's discretion.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">10. Chargebacks and Payment Disputes</h2>
            <p>By completing a booking, the Guest agrees not to initiate unjustified chargebacks or payment disputes.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Any dispute must first be communicated to the Company;</li>
              <li>The Company reserves the right to provide booking records, communications, and acceptance of terms as evidence in dispute resolution processes.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">11. Governing Law</h2>
            <p>This Policy is governed by Slovenian law and applicable laws of Cabo Verde.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">12. Contact</h2>
            <p>For any inquiries regarding this Policy:</p>
            <p>Email: <a href="mailto:privacy@easyclickweb.com" className="text-primary">privacy@easyclickweb.com</a></p>
          </section>

          <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border/40">
            Last updated: March 2026
          </p>
        </motion.div>
      </div>
    </main>
    <Footer />
  </PageTransition>
);

export default RefundPolicy;

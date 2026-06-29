import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import { motion } from "framer-motion";

const PrivacyPolicy = () => (
  <PageTransition>
    <Seo
      title="Privacy Policy | BAZHOUSE"
      description="Informativa sulla privacy di BAZHOUSE: come raccogliamo, usiamo e proteggiamo i dati personali degli utenti del sito."
    />
    <Navbar />
    <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-3xl sm:text-4xl text-foreground mb-8"
        >
          Privacy Policy – BAZHOUSE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-sm max-w-none font-sans text-muted-foreground space-y-6"
        >
          <section>
            <h2 className="font-serif text-xl text-foreground mt-0">1. Introduction</h2>
            <p>
              This Privacy Policy describes how personal data is collected, used, and protected when users access and use the website www.bazhouse.com and related domains (including .it) (the "Website").
            </p>
            <p>
              Bazhouse is a brand of EasyClick d.o.o., a company incorporated under Slovenian law, with registered office at Kidričeva ulica 19, 5000 Nova Gorica, Slovenia, VAT No. SI17046459 ("Company", "we", "us", or "our").
            </p>
            <p>The Website provides services related to the rental of apartments located in Boa Vista, Cabo Verde.</p>
            <p>We are committed to protecting your personal data in compliance with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Regulation (EU) 2016/679 (General Data Protection Regulation – GDPR);</li>
              <li>Slovenian data protection legislation (including ZVOP-2);</li>
              <li>Applicable data protection laws of Cabo Verde.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">2. Data Controller</h2>
            <p>
              EasyClick d.o.o.<br />
              Kidričeva ulica 19<br />
              5000 Nova Gorica, Slovenia<br />
              VAT No. SI17046459<br />
              Email: <a href="mailto:privacy@easyclickweb.com" className="text-primary">privacy@easyclickweb.com</a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">3. Categories of Personal Data Collected</h2>
            <p>We may collect and process the following categories of personal data:</p>
            <p><strong>a) Identification Data</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name and surname</li>
              <li>Nationality</li>
              <li>Identification document details (when required by law)</li>
            </ul>
            <p><strong>b) Contact Data</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address</li>
              <li>Phone number</li>
              <li>WhatsApp contact</li>
            </ul>
            <p><strong>c) Booking and Communication Data</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Booking details (dates, apartment selected, number of guests)</li>
              <li>Communication via Website, email, and WhatsApp</li>
              <li>Requests, preferences, and customer support interactions</li>
            </ul>
            <p><strong>d) Payment Data</strong></p>
            <p>Payments may be made via PayPal, Credit card, Debit card, Bank transfer (IBAN).</p>
            <p>We process payment-related information necessary to manage bookings and deposits (typically 20% of the total booking value). Sensitive payment data (e.g. full card numbers) are processed exclusively by secure third-party payment providers and are not stored by us.</p>
            <p><strong>e) Technical and Tracking Data</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address</li>
              <li>Device and browser information</li>
              <li>Navigation data</li>
              <li>Cookies and tracking technologies</li>
            </ul>
            <p><strong>f) Profiling Data</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>User preferences</li>
              <li>Browsing behavior</li>
              <li>Interaction with services and communications</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">4. Purposes of Processing</h2>
            <p>Personal data is processed for the following purposes:</p>
            <p><strong>a) Booking and Service Provision</strong> – Managing apartment reservations, providing rental services, handling customer requests via Website, email, and WhatsApp.</p>
            <p><strong>b) Payment Management</strong> – Processing booking deposits (approximately 20%), managing payments and confirmations.</p>
            <p><strong>c) Customer Communication</strong> – Sending booking confirmations, providing assistance before, during, and after the stay, sending service-related notifications.</p>
            <p><strong>d) Marketing and Promotional Communications</strong> – Sending promotional offers and updates related to similar services, follow-up communications after booking. These communications are sent based on legitimate interest and/or prior customer relationship, in compliance with applicable laws. Users may opt out at any time.</p>
            <p><strong>e) Profiling</strong> – Improving user experience, personalizing offers and services, analyzing customer behavior for business optimization.</p>
            <p><strong>f) Legal Obligations</strong> – Compliance with Slovenian and Cabo Verde regulations, guest registration and local authority requirements.</p>
            <p><strong>g) Security and Analytics</strong> – Preventing fraud and misuse, monitoring Website performance and traffic.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">5. Legal Basis for Processing</h2>
            <p>We process personal data based on:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Performance of a contract (booking and rental services)</li>
              <li>Compliance with legal obligations</li>
              <li>Legitimate interest (service improvement, marketing to existing customers, fraud prevention)</li>
              <li>Consent (where required, particularly for tracking technologies and profiling)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">6. Data Sharing and Recipients</h2>
            <p>Personal data may be shared with:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payment providers (PayPal, banks, card processors)</li>
              <li>IT and hosting providers</li>
              <li>CRM and communication tools (including email and WhatsApp integrations)</li>
              <li>Property management and local partners in Cabo Verde</li>
              <li>Legal, accounting, and tax advisors</li>
              <li>Public authorities when required by law</li>
            </ul>
            <p>All third parties process data in accordance with applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">7. International Data Transfers</h2>
            <p>Due to the nature of the services, personal data may be transferred outside the European Economic Area, including to Cabo Verde. Such transfers are carried out in compliance with GDPR, using appropriate safeguards where required.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">8. Data Retention</h2>
            <p>Personal data is retained:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>For the duration of the contractual relationship</li>
              <li>Up to 24 months for marketing and profiling purposes</li>
              <li>As required by applicable legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">9. User Rights</h2>
            <p>Users have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access their personal data</li>
              <li>Request rectification or deletion</li>
              <li>Restrict processing</li>
              <li>Object to processing (including marketing)</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>Requests can be sent to: <a href="mailto:privacy@easyclickweb.com" className="text-primary">privacy@easyclickweb.com</a></p>
            <p>Users also have the right to lodge a complaint with the competent supervisory authority.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">10. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect personal data, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Secure infrastructure and servers</li>
              <li>Encryption and secure communication protocols</li>
              <li>Access control and internal data protection procedures</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">11. Cookies and Tracking Technologies</h2>
            <p>The Website uses cookies and similar technologies, including Google Analytics (traffic analysis) and Facebook Pixel (marketing and remarketing).</p>
            <p>These technologies allow us to analyze user behavior, improve Website performance, and deliver personalized advertisements.</p>
            <p>Users can manage cookie preferences through browser settings and cookie banners where applicable.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">12. Data Protection Officer (DPO) / Contact</h2>
            <p>For any questions or requests regarding data protection:</p>
            <p>Email: <a href="mailto:privacy@easyclickweb.com" className="text-primary">privacy@easyclickweb.com</a></p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">13. Updates to This Policy</h2>
            <p>This Privacy Policy may be updated from time to time. Any changes will be published on this page.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">14. Contact</h2>
            <p>For any inquiries: <a href="mailto:privacy@easyclickweb.com" className="text-primary">privacy@easyclickweb.com</a></p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">15. Sub-processors</h2>
            <p>
              To deliver the Website and related services, the Company relies on the following sub-processors. Each of them processes personal data on behalf of EasyClick d.o.o. under a Data Processing Agreement (DPA) compliant with Art. 28 GDPR. The list may be updated from time to time; the current version is always available on this page.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border border-border/40 rounded-md">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="p-2 font-serif text-foreground">Provider</th>
                    <th className="p-2 font-serif text-foreground">Purpose</th>
                    <th className="p-2 font-serif text-foreground">Location</th>
                    <th className="p-2 font-serif text-foreground">DPA</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  <tr className="border-t border-border/40">
                    <td className="p-2">Lovable (Lovable AB)</td>
                    <td className="p-2">Application platform & build environment</td>
                    <td className="p-2">Sweden / EU</td>
                    <td className="p-2"><a href="https://lovable.dev/dpa" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">Supabase (Supabase Inc.)</td>
                    <td className="p-2">Database, authentication, storage, edge functions</td>
                    <td className="p-2">EU (Frankfurt, AWS eu-central-1)</td>
                    <td className="p-2"><a href="https://supabase.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">Stripe (Stripe Payments Europe Ltd.)</td>
                    <td className="p-2">Payment processing (deposit & balance)</td>
                    <td className="p-2">Ireland / EU</td>
                    <td className="p-2"><a href="https://stripe.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">Resend (Resend Inc.)</td>
                    <td className="p-2">Transactional & authentication emails</td>
                    <td className="p-2">USA (SCC in place)</td>
                    <td className="p-2"><a href="https://resend.com/legal/dpa" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">Hostinger International Ltd.</td>
                    <td className="p-2">Web hosting of the static frontend</td>
                    <td className="p-2">EU (Lithuania / Netherlands)</td>
                    <td className="p-2"><a href="https://www.hostinger.com/legal/data-processing-agreement" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">Google Ireland Ltd. (Analytics)</td>
                    <td className="p-2">Website traffic analytics</td>
                    <td className="p-2">Ireland / EU (SCC for US transfers)</td>
                    <td className="p-2"><a href="https://business.safety.google/adsprocessorterms/" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">Meta Platforms Ireland Ltd. (Facebook Pixel)</td>
                    <td className="p-2">Marketing & remarketing</td>
                    <td className="p-2">Ireland / EU (SCC for US transfers)</td>
                    <td className="p-2"><a href="https://www.facebook.com/legal/terms/dataprocessing" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">WhatsApp Ireland Ltd. (Meta)</td>
                    <td className="p-2">Customer communication via WhatsApp Business</td>
                    <td className="p-2">Ireland / EU</td>
                    <td className="p-2"><a href="https://www.whatsapp.com/legal/business-data-transfer-addendum" target="_blank" rel="noopener noreferrer" className="text-primary underline">View DPA</a></td>
                  </tr>
                  <tr className="border-t border-border/40">
                    <td className="p-2">PayPal (Europe) S.à r.l. et Cie, S.C.A.</td>
                    <td className="p-2">Alternative payment processing</td>
                    <td className="p-2">Luxembourg / EU</td>
                    <td className="p-2"><a href="https://www.paypal.com/uk/webapps/mpp/ua/legalhub-full" target="_blank" rel="noopener noreferrer" className="text-primary underline">View Legal Hub</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs mt-3">
              Users may request the updated list of sub-processors at any time by writing to <a href="mailto:privacy@easyclickweb.com" className="text-primary">privacy@easyclickweb.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl text-foreground">16. Role of studionavi.it</h2>
            <p>
              <strong>studionavi.it</strong> has acted exclusively as technical developer of the Website on behalf of EasyClick d.o.o. (Bazhouse).
            </p>
            <p>
              studionavi.it is <strong>not the Data Controller</strong> and <strong>not a Data Processor</strong> of any personal data collected, stored, or processed through this Website. It does not access, manage, or retain user data, bookings, payments, or communications.
            </p>
            <p>
              Sole and exclusive Data Controller is <strong>EasyClick d.o.o.</strong> (Bazhouse brand), reachable at <a href="mailto:privacy@easyclickweb.com" className="text-primary">privacy@easyclickweb.com</a>.
            </p>
          </section>

          <p className="text-xs text-muted-foreground/60 pt-4 border-t border-border/40">
            Last updated: June 2026
          </p>

        </motion.div>
      </div>
    </main>
    <Footer />
  </PageTransition>
);

export default PrivacyPolicy;

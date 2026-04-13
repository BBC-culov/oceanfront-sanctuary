/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BalancePaymentRequestProps {
  guestName?: string
  apartmentName?: string
  bookingCode?: string
  totalPrice?: number
  amountPaid?: number
  checkIn?: string
  checkOut?: string
  paymentLink?: string
}

const BalancePaymentRequestEmail = ({
  guestName, apartmentName, bookingCode,
  totalPrice = 0, amountPaid = 0, checkIn, checkOut, paymentLink,
}: BalancePaymentRequestProps) => {
  const balance = totalPrice - amountPaid
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Pagamento saldo — Prenotazione #{bookingCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>BAZ HOUSE</Heading>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Pagamento Saldo Prenotazione</Heading>
            <Text style={text}>
              Gentile <strong>{guestName || 'ospite'}</strong>,
            </Text>
            <Text style={text}>
              la contattiamo per completare il pagamento del saldo della sua prenotazione <strong>#{bookingCode}</strong> presso <strong>{apartmentName}</strong>.
            </Text>

            <Section style={detailsBox}>
              <Text style={detailLabel}>Riepilogo prenotazione</Text>
              <Text style={detailRow}>Appartamento: <strong>{apartmentName}</strong></Text>
              {checkIn && <Text style={detailRow}>Check-in: <strong>{checkIn}</strong></Text>}
              {checkOut && <Text style={detailRow}>Check-out: <strong>{checkOut}</strong></Text>}
              <Hr style={divider} />
              <Text style={detailRow}>Totale soggiorno: <strong>€{totalPrice.toFixed(2)}</strong></Text>
              <Text style={detailRow}>Caparra versata: <strong>€{amountPaid.toFixed(2)}</strong></Text>
              <Text style={balanceText}>Saldo da pagare: <strong>€{balance.toFixed(2)}</strong></Text>
            </Section>

            <Text style={text}>
              Clicchi sul pulsante qui sotto per procedere al pagamento sicuro tramite Stripe. Il link è valido per <strong>24 ore</strong>.
            </Text>

            {paymentLink && (
              <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
                <Button style={button} href={paymentLink}>
                  Paga il saldo — €{balance.toFixed(2)}
                </Button>
              </Section>
            )}

            <Text style={smallText}>
              Se il link non dovesse funzionare, ci contatti e le invieremo un nuovo link di pagamento.
            </Text>
            <Text style={smallText}>
              Per qualsiasi domanda, non esiti a contattarci via WhatsApp o email.
            </Text>
          </Section>
          <Section style={footerSection}>
            <Text style={footerBrand}>Baz House · Boa Vista, Capo Verde</Text>
            <Text style={footerCopy}>© {new Date().getFullYear()} Baz House. Tutti i diritti riservati.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: BalancePaymentRequestEmail,
  subject: (data: Record<string, any>) => `Pagamento saldo — Prenotazione #${data.bookingCode || ''}`,
  displayName: 'Richiesta pagamento saldo',
  previewData: {
    guestName: 'Marco Rossi', apartmentName: 'Ocean View Suite', bookingCode: 'ABC12345',
    totalPrice: 1200, amountPaid: 240, checkIn: '1 Agosto 2025', checkOut: '8 Agosto 2025',
    paymentLink: 'https://checkout.stripe.com/example',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 16px' }
const smallText = { fontSize: '13px', color: '#888', lineHeight: '1.5', margin: '0 0 10px' }
const detailsBox = { backgroundColor: '#f8f6f3', padding: '24px', margin: '0 0 24px', borderRadius: '6px', border: '1px solid #e8e4df' }
const detailLabel = { margin: '0 0 12px', fontSize: '11px', color: '#999', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontWeight: '600' as const }
const detailRow = { margin: '0 0 6px', fontSize: '14px', color: '#555', lineHeight: '1.6' }
const balanceText = { margin: '8px 0 0', fontSize: '16px', color: '#1a3329', lineHeight: '1.6' }
const divider = { borderColor: '#e0dcd7', margin: '12px 0' }
const button = { backgroundColor: '#1a3329', color: '#f5f0eb', fontSize: '13px', borderRadius: '4px', padding: '16px 40px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em', fontWeight: '600' as const }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#999' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#bbb' }

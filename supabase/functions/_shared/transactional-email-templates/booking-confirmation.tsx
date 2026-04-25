/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BookingConfirmationProps {
  guestName?: string
  apartmentName?: string
  checkIn?: string
  checkOut?: string
  bookingCode?: string
  totalPrice?: number
  amountPaid?: number
  paymentType?: string
}

const BookingConfirmationEmail = ({
  guestName, apartmentName, checkIn, checkOut, bookingCode,
  totalPrice = 0, amountPaid = 0, paymentType,
}: BookingConfirmationProps) => {
  const balance = totalPrice - amountPaid
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>{`Prenotazione confermata — ${bookingCode ?? ""}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>BAZ HOUSE</Heading>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Prenotazione Confermata</Heading>
            <Text style={text}>
              Ciao <strong>{guestName || 'ospite'}</strong>,<br />
              la tua prenotazione è stata confermata con successo!
            </Text>
            <Section style={detailsBox}>
              <Text style={detailsLabel}>Dettagli prenotazione</Text>
              <Text style={detailLine}><strong>Codice:</strong> {bookingCode}</Text>
              <Text style={detailLine}><strong>Appartamento:</strong> {apartmentName}</Text>
              <Text style={detailLine}><strong>Check-in:</strong> {checkIn}</Text>
              <Text style={detailLine}><strong>Check-out:</strong> {checkOut}</Text>
              <Text style={detailLine}><strong>Totale:</strong> €{totalPrice.toFixed(2)}</Text>
              {paymentType === 'deposit' ? (
                <>
                  <Text style={detailLine}><strong>Caparra versata:</strong> €{amountPaid.toFixed(2)}</Text>
                  <Text style={detailLine}><strong>Saldo rimanente:</strong> €{balance.toFixed(2)}</Text>
                </>
              ) : (
                <Text style={detailLine}><strong>Importo pagato:</strong> €{amountPaid.toFixed(2)}</Text>
              )}
            </Section>
            <Text style={text}>
              Puoi visualizzare i dettagli della tua prenotazione nella sezione "Le mie prenotazioni" del tuo profilo.
            </Text>
            <Button style={button} href="https://bazhousedemo.vercel.app/profilo">
              Le mie prenotazioni
            </Button>
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
  component: BookingConfirmationEmail,
  subject: (data: Record<string, any>) => `Prenotazione confermata — ${data.bookingCode || ''}`,
  displayName: 'Conferma prenotazione',
  previewData: {
    guestName: 'Marco Rossi', apartmentName: 'Ocean View Suite',
    checkIn: '2025-08-01', checkOut: '2025-08-08', bookingCode: 'ABC12345',
    totalPrice: 1200, amountPaid: 240, paymentType: 'deposit',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const detailsBox = { backgroundColor: '#f7f5f2', padding: '24px', margin: '0 0 24px' }
const detailsLabel = { margin: '0 0 8px', fontSize: '11px', textTransform: 'uppercase' as const, letterSpacing: '0.2em', color: '#999' }
const detailLine = { margin: '0 0 8px', fontSize: '14px', color: '#333', lineHeight: '1.5' }
const button = { backgroundColor: '#1a3329', color: '#f5f0eb', fontSize: '12px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#999' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#bbb' }

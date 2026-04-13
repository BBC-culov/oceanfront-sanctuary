/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BalanceReminderProps {
  guestName?: string
  apartmentName?: string
  bookingCode?: string
  totalPrice?: number
  amountPaid?: number
  checkIn?: string
  daysLeft?: number
}

const BalanceReminderEmail = ({
  guestName, apartmentName, bookingCode,
  totalPrice = 0, amountPaid = 0, checkIn, daysLeft,
}: BalanceReminderProps) => {
  const balance = totalPrice - amountPaid
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Promemoria saldo — {bookingCode}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>BAZ HOUSE</Heading>
          </Section>
          <Section style={content}>
            <Heading style={h1}>Promemoria: Saldo in Scadenza</Heading>
            <Text style={text}>
              Ciao <strong>{guestName || 'ospite'}</strong>,<br />
              ti ricordiamo che il saldo della tua prenotazione <strong>{bookingCode}</strong> per <strong>{apartmentName}</strong> deve essere completato prima del check-in.
            </Text>
            <Section style={warningBox}>
              <Text style={warningText}><strong>Saldo rimanente: €{balance.toFixed(2)}</strong></Text>
              <Text style={warningSubtext}>Check-in: {checkIn} (tra {daysLeft} giorni)</Text>
            </Section>
            <Text style={text}>Accedi al tuo profilo per completare il pagamento del saldo.</Text>
            <Button style={button} href="https://bazhousedemo.vercel.app/profilo">
              Paga il saldo
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
  component: BalanceReminderEmail,
  subject: (data: Record<string, any>) => `Promemoria saldo — ${data.bookingCode || ''}`,
  displayName: 'Promemoria saldo',
  previewData: {
    guestName: 'Marco Rossi', apartmentName: 'Ocean View Suite', bookingCode: 'ABC12345',
    totalPrice: 1200, amountPaid: 240, checkIn: '2025-08-01', daysLeft: 8,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const warningBox = { backgroundColor: '#fef3c7', padding: '24px', margin: '0 0 24px', borderLeft: '4px solid #f59e0b' }
const warningText = { margin: '0 0 8px', fontSize: '15px', color: '#92400e' }
const warningSubtext = { margin: '0', fontSize: '13px', color: '#92400e' }
const button = { backgroundColor: '#1a3329', color: '#f5f0eb', fontSize: '12px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#999' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#bbb' }

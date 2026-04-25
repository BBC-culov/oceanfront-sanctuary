/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandFooter } from './_brand-footer.tsx'

interface BalancePaidProps {
  guestName?: string
  apartmentName?: string
  bookingCode?: string
  totalPrice?: number
}

const BalancePaidEmail = ({ guestName, apartmentName, bookingCode, totalPrice = 0 }: BalancePaidProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>{`Saldo completato — ${bookingCode ?? ""}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>BAZ HOUSE</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Saldo Completato ✓</Heading>
          <Text style={text}>
            Ciao <strong>{guestName || 'ospite'}</strong>,<br />
            il saldo della tua prenotazione <strong>{bookingCode}</strong> per <strong>{apartmentName}</strong> è stato completato con successo.
          </Text>
          <Section style={successBox}>
            <Text style={successText}><strong>Importo totale pagato: €{totalPrice.toFixed(2)}</strong></Text>
          </Section>
          <Text style={text}>Non vediamo l'ora di accoglierti a Boa Vista!</Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: BalancePaidEmail,
  subject: (data: Record<string, any>) => `Saldo completato — ${data.bookingCode || ''}`,
  displayName: 'Saldo completato',
  previewData: { guestName: 'Marco Rossi', apartmentName: 'Ocean View Suite', bookingCode: 'ABC12345', totalPrice: 1200 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const successBox = { backgroundColor: '#f0fdf4', padding: '24px', margin: '0 0 24px', borderLeft: '4px solid #22c55e' }
const successText = { margin: '0', fontSize: '15px', color: '#166534' }

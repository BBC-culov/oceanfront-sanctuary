/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Img } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  guestName?: string
  guestEmail?: string
  bookingCode?: string
  priceDiff?: number
  newTotal?: number
  requestId?: string
}

const Email = ({ guestName, guestEmail, bookingCode, priceDiff = 0, newTotal = 0, requestId }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>{`Nuova richiesta di modifica — ${bookingCode ?? ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Img src="https://lreerhxykovhkfciffnu.supabase.co/storage/v1/object/public/apartment-images/email%2Flogo-bazhouse.png" alt="BAZHOUSE" width="160" height="52" style={{ display: 'block', margin: '0 auto 6px', maxWidth: '160px', height: 'auto', border: 0, outline: 'none', textDecoration: 'none' }} />
            <Text style={{ textAlign: 'center', fontSize: '11px', letterSpacing: '2px', color: '#6b6b6b', margin: 0, textTransform: 'uppercase' }}>Admin</Text></Section>
        <Section style={content}>
          <Heading style={h1}>Nuova richiesta di modifica</Heading>
          <Text style={detail}><strong>Ospite:</strong> {guestName} ({guestEmail})</Text>
          <Text style={detail}><strong>Codice:</strong> {bookingCode}</Text>
          <Text style={detail}><strong>Nuovo totale:</strong> €{Number(newTotal).toFixed(2)}</Text>
          <Text style={detail}><strong>Differenza:</strong> {priceDiff >= 0 ? '+' : ''}€{Number(priceDiff).toFixed(2)}</Text>
          <Text style={detail}><strong>ID richiesta:</strong> {requestId}</Text>
          <Text style={detail}>Accedi al pannello admin per approvare o rifiutare la richiesta.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Nuova richiesta di modifica — ${d.bookingCode || ''}`,
  to: 'info@bazhouse.com',
  displayName: 'Modifica — admin',
  previewData: { guestName: 'Marco Rossi', guestEmail: 'marco@example.com', bookingCode: 'ABC12345', priceDiff: 120, newTotal: 1320, requestId: 'xxx' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#ffffff', padding: '28px 40px 20px', textAlign: 'center' as const, borderBottom: '3px solid #0E3D2C' }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '20px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '32px 40px' }
const h1 = { fontSize: '20px', fontWeight: '300' as const, color: '#0E3D2C', margin: '0 0 16px', fontFamily: 'Georgia, serif' }
const detail = { margin: '0 0 8px', fontSize: '14px', color: '#333', lineHeight: '1.5' }

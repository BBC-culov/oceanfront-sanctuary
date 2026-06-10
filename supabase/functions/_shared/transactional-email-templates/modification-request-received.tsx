/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Img } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandFooter } from './_brand-footer.tsx'

interface Props {
  guestName?: string
  bookingCode?: string
  priceDiff?: number
  newTotal?: number
}

const Email = ({ guestName, bookingCode, priceDiff = 0, newTotal = 0 }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>{`Richiesta modifica ricevuta — ${bookingCode ?? ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Img src="https://lreerhxykovhkfciffnu.supabase.co/storage/v1/object/public/apartment-images/email%2Flogo-bazhouse.png" alt="BAZHOUSE" width="160" height="52" style={{ display: 'block', margin: '0 auto', maxWidth: '160px', height: 'auto', border: 0, outline: 'none', textDecoration: 'none' }} /></Section>
        <Section style={content}>
          <Heading style={h1}>Richiesta modifica ricevuta</Heading>
          <Text style={text}>
            Gentile <strong>{guestName || 'ospite'}</strong>,<br />
            abbiamo ricevuto la sua richiesta di modifica per la prenotazione <strong>#{bookingCode}</strong>.
          </Text>
          <Section style={box}>
            <Text style={detailRow}>Nuovo totale stimato: <strong>€{Number(newTotal).toFixed(2)}</strong></Text>
            <Text style={detailRow}>
              Differenza: <strong style={{ color: priceDiff >= 0 ? '#1a3329' : '#166534' }}>
                {priceDiff >= 0 ? '+' : ''}€{Number(priceDiff).toFixed(2)}
              </strong>
            </Text>
          </Section>
          <Text style={text}>
            Il nostro team valuterà la richiesta e le invierà una conferma a breve. Potrà controllare lo stato direttamente nella sua area riservata.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Richiesta modifica ricevuta — ${d.bookingCode || ''}`,
  displayName: 'Modifica — ricevuta',
  previewData: { guestName: 'Marco Rossi', bookingCode: 'ABC12345', priceDiff: 120, newTotal: 1320 },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 16px' }
const box = { backgroundColor: '#f8f6f3', padding: '20px', margin: '0 0 24px', borderRadius: '6px', border: '1px solid #e8e4df' }
const detailRow = { margin: '0 0 6px', fontSize: '14px', color: '#555', lineHeight: '1.6' }

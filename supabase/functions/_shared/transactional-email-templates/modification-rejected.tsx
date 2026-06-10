/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text, Img } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandFooter } from './_brand-footer.tsx'

interface Props {
  guestName?: string
  bookingCode?: string
  rejectionReason?: string
  adminNote?: string
}

const Email = ({ guestName, bookingCode, rejectionReason, adminNote }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>{`Richiesta modifica non accolta — ${bookingCode ?? ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Img src="https://bazhouse.it/logo-bazhouse.png" alt="BAZHOUSE" width="160" height="52" style={{ display: 'block', margin: '0 auto', maxWidth: '160px', height: 'auto', border: 0, outline: 'none', textDecoration: 'none' }} /></Section>
        <Section style={content}>
          <Heading style={h1}>Richiesta non accolta</Heading>
          <Text style={text}>
            Gentile <strong>{guestName || 'ospite'}</strong>,<br />
            ci dispiace informarla che la sua richiesta di modifica per la prenotazione <strong>#{bookingCode}</strong> non è stata accolta.
          </Text>
          {rejectionReason && (
            <Section style={box}>
              <Text style={detailRow}><strong>Motivo:</strong> {rejectionReason}</Text>
            </Section>
          )}
          {adminNote && <Text style={text}><em>"{adminNote}"</em></Text>}
          <Text style={text}>
            La sua prenotazione resta valida nei termini originali. Per qualsiasi chiarimento, può contattarci direttamente.
          </Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Richiesta modifica non accolta — ${d.bookingCode || ''}`,
  displayName: 'Modifica — rifiutata',
  previewData: { guestName: 'Marco', bookingCode: 'ABC12345', rejectionReason: 'Date non disponibili', adminNote: '' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 16px' }
const box = { backgroundColor: '#fef3f2', padding: '20px', margin: '0 0 24px', borderRadius: '6px', border: '1px solid #fecaca' }
const detailRow = { margin: '0 0 6px', fontSize: '14px', color: '#7f1d1d', lineHeight: '1.6' }

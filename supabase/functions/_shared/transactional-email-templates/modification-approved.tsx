/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Img } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandFooter } from './_brand-footer.tsx'

interface Props {
  guestName?: string
  bookingCode?: string
  newTotal?: number
  priceDiff?: number
  paymentLink?: string | null
  adminNote?: string
}

const Email = ({ guestName, bookingCode, newTotal = 0, priceDiff = 0, paymentLink, adminNote }: Props) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>{`Modifica approvata — ${bookingCode ?? ''}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}><Img src="https://lreerhxykovhkfciffnu.supabase.co/storage/v1/object/public/apartment-images/email%2Flogo-bazhouse.png" alt="BAZHOUSE" width="160" height="52" style={{ display: 'block', margin: '0 auto', maxWidth: '160px', height: 'auto', border: 0, outline: 'none', textDecoration: 'none' }} /></Section>
        <Section style={content}>
          <Heading style={h1}>Modifica approvata</Heading>
          <Text style={text}>
            Gentile <strong>{guestName || 'ospite'}</strong>,<br />
            la sua richiesta di modifica per la prenotazione <strong>#{bookingCode}</strong> è stata approvata.
          </Text>
          <Section style={box}>
            <Text style={detailRow}>Nuovo totale: <strong>€{Number(newTotal).toFixed(2)}</strong></Text>
            {priceDiff !== 0 && (
              <Text style={detailRow}>
                Differenza da pagare: <strong>{priceDiff >= 0 ? '+' : ''}€{Number(priceDiff).toFixed(2)}</strong>
              </Text>
            )}
          </Section>
          {adminNote && <Text style={text}><em>"{adminNote}"</em></Text>}
          {paymentLink && priceDiff > 0 && (
            <>
              <Text style={text}>
                Per completare la modifica, proceda al pagamento della differenza tramite il link sicuro qui sotto. Il link è valido per <strong>24 ore</strong>.
              </Text>
              <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
                <Button style={button} href={paymentLink}>
                  Paga differenza — €{Number(priceDiff).toFixed(2)}
                </Button>
              </Section>
            </>
          )}
          <Text style={smallText}>Può consultare la sua prenotazione aggiornata nell'area riservata.</Text>
        </Section>
        <BrandFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => `Modifica approvata — ${d.bookingCode || ''}`,
  displayName: 'Modifica — approvata',
  previewData: { guestName: 'Marco', bookingCode: 'ABC12345', newTotal: 1320, priceDiff: 120, paymentLink: 'https://checkout.stripe.com/example' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#ffffff', padding: '32px 40px 24px', textAlign: 'center' as const, borderBottom: '3px solid #0E3D2C' }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 16px' }
const smallText = { fontSize: '13px', color: '#888', lineHeight: '1.5', margin: '20px 0 0' }
const box = { backgroundColor: '#f8f6f3', padding: '20px', margin: '0 0 24px', borderRadius: '6px', border: '1px solid #e8e4df' }
const detailRow = { margin: '0 0 6px', fontSize: '14px', color: '#555', lineHeight: '1.6' }
const button = { backgroundColor: '#1a3329', color: '#f5f0eb', fontSize: '13px', borderRadius: '4px', padding: '16px 40px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em', fontWeight: '600' as const }

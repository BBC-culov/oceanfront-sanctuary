/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface BookingRecoveryProps {
  guestName?: string
  apartmentName?: string
  checkIn?: string
  checkOut?: string
  resumeUrl?: string
}

const BookingRecoveryEmail = ({
  guestName, apartmentName, checkIn, checkOut, resumeUrl,
}: BookingRecoveryProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>{`La tua prenotazione ${apartmentName ?? ''} ti aspetta`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>BAZ HOUSE</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>La tua prenotazione ti aspetta</Heading>
          <Text style={text}>
            Ciao <strong>{guestName || 'ospite'}</strong>,<br />
            abbiamo notato che hai iniziato una prenotazione per <strong>{apartmentName}</strong> ma non l'hai ancora completata.
          </Text>
          <Section style={infoBox}>
            <Text style={infoText}><strong>Check-in:</strong> {checkIn}</Text>
            <Text style={infoText}><strong>Check-out:</strong> {checkOut}</Text>
          </Section>
          <Text style={text}>
            La tua disponibilità è ancora libera. Puoi riprendere la prenotazione esattamente da dove l'hai lasciata cliccando il pulsante qui sotto.
          </Text>
          {resumeUrl && (
            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
              <Button style={button} href={resumeUrl}>
                Riprendi la prenotazione
              </Button>
            </Section>
          )}
          <Text style={smallText}>
            Se hai cambiato idea o hai bisogno di assistenza, rispondi semplicemente a questa email — siamo a tua disposizione.
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

export const template = {
  component: BookingRecoveryEmail,
  subject: (data: Record<string, any>) => `La tua prenotazione ${data.apartmentName || ''} ti aspetta`,
  displayName: 'Recupero prenotazione',
  previewData: {
    guestName: 'Marco Rossi',
    apartmentName: 'Ocean View Suite',
    checkIn: '2025-08-01',
    checkOut: '2025-08-08',
    resumeUrl: 'https://bazhousedemo.vercel.app/riprendi/abc123',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const smallText = { fontSize: '13px', color: '#888', lineHeight: '1.6', margin: '24px 0 0', fontStyle: 'italic' as const }
const infoBox = { backgroundColor: '#f5f0eb', padding: '20px 24px', margin: '0 0 24px', borderLeft: '4px solid #1a3329' }
const infoText = { margin: '4px 0', fontSize: '14px', color: '#1a3329' }
const button = { backgroundColor: '#1a3329', color: '#f5f0eb', fontSize: '12px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#999' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#bbb' }

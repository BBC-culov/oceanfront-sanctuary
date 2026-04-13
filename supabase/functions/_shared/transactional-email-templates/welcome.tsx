/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface WelcomeProps { guestName?: string }

const WelcomeEmail = ({ guestName }: WelcomeProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Benvenuto su Baz House! 🌴</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>BAZ HOUSE</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Benvenuto su Baz House! 🌴</Heading>
          <Text style={text}>
            Ciao <strong>{guestName || 'ospite'}</strong>,<br />
            grazie per esserti registrato su Baz House! Siamo felici di averti con noi.
          </Text>
          <Text style={text}>
            Ora puoi esplorare i nostri appartamenti esclusivi vista oceano a Boa Vista, Capo Verde, e prenotare la tua prossima vacanza da sogno.
          </Text>
          <Button style={button} href="https://bazhousedemo.vercel.app/appartamenti">
            Scopri gli appartamenti
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

export const template = {
  component: WelcomeEmail,
  subject: 'Benvenuto su Baz House! 🌴',
  displayName: 'Email di benvenuto',
  previewData: { guestName: 'Marco' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const button = { backgroundColor: '#1a3329', color: '#f5f0eb', fontSize: '12px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#999' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#bbb' }

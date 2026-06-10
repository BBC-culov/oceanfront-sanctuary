/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,, Img } from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Il tuo codice di verifica — Bazhouse</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src="https://bazhouse.it/logo-bazhouse.png" alt="BAZHOUSE" width="160" height="52" style={{ display: 'block', margin: '0 auto', maxWidth: '160px', height: 'auto', border: 0, outline: 'none', textDecoration: 'none' }} />
        </Section>
        <Section style={content}>
          <Heading style={h1}>Codice di verifica</Heading>
          <Text style={text}>Usa il codice qui sotto per confermare la tua identità:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={footerText}>
            Il codice scadrà a breve. Se non hai richiesto questo codice, puoi ignorare questa email.
          </Text>
        </Section>
        <Section style={footerSection}>
          <Text style={footerBrand}>Bazhouse · Boa Vista, Capo Verde</Text>
          <Text style={footerCopy}>© {new Date().getFullYear()} Bazhouse. Tutti i diritti riservati.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#1a3329', margin: '0 0 30px', letterSpacing: '0.2em' }
const footerText = { fontSize: '13px', color: '#999', margin: '30px 0 0' }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#999' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#bbb' }

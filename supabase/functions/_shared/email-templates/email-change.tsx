/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text, Img } from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Conferma il cambio email — Bazhouse</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src="https://lreerhxykovhkfciffnu.supabase.co/storage/v1/object/public/apartment-images/email%2Flogo-bazhouse.png" alt="BAZHOUSE" width="160" height="52" style={{ display: 'block', margin: '0 auto', maxWidth: '160px', height: 'auto', border: 0, outline: 'none', textDecoration: 'none' }} />
        </Section>
        <Section style={content}>
          <Heading style={h1}>Conferma il cambio email</Heading>
          <Text style={text}>
            Hai richiesto di cambiare il tuo indirizzo email per Bazhouse da{' '}
            <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
            a{' '}
            <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.
          </Text>
          <Text style={text}>
            Clicca il pulsante qui sotto per confermare:
          </Text>
          <Button style={button} href={confirmationUrl}>
            Conferma Cambio Email
          </Button>
          <Text style={footerText}>
            Se non hai richiesto questa modifica, proteggi il tuo account immediatamente.
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

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#ffffff', padding: '32px 40px 24px', textAlign: 'center' as const, borderBottom: '3px solid #0E3D2C' }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#0E3D2C', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const link = { color: '#0E3D2C', textDecoration: 'underline' }
const button = { backgroundColor: '#0E3D2C', color: '#f5f0eb', fontSize: '12px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }
const footerText = { fontSize: '13px', color: '#6b6b6b', margin: '30px 0 0' }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#6b6b6b' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#888' }

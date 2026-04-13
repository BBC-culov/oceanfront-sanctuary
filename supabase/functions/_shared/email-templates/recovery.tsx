/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="it" dir="ltr">
    <Head />
    <Preview>Ripristina la tua password — Baz House</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>BAZ HOUSE</Heading>
        </Section>
        <Section style={content}>
          <Heading style={h1}>Ripristina la tua password</Heading>
          <Text style={text}>
            Abbiamo ricevuto una richiesta di ripristino password per il tuo account Baz House. Clicca il pulsante qui sotto per scegliere una nuova password.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Ripristina Password
          </Button>
          <Text style={footerText}>
            Se non hai richiesto il ripristino, puoi ignorare questa email. La tua password non verrà modificata.
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

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '32px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '24px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 20px' }
const button = { backgroundColor: '#1a3329', color: '#f5f0eb', fontSize: '12px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }
const footerText = { fontSize: '13px', color: '#999', margin: '30px 0 0' }
const footerSection = { padding: '24px 40px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#999' }
const footerCopy = { margin: '4px 0 0', fontSize: '11px', color: '#bbb' }

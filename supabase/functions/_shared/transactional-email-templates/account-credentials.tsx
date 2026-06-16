/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Button, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { BrandFooter } from './_brand-footer.tsx'

interface Props {
  firstName?: string
  email: string
  password: string
  roleLabel?: string
  loginUrl?: string
}

const ROLE_LABEL_DEFAULT = 'Utente'

const AccountCredentialsEmail = ({ firstName, email, password, roleLabel, loginUrl }: Props) => {
  const url = loginUrl || 'https://bazhousedemo.vercel.app/registrati'
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>Le tue credenziali di accesso a Bazhouse</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://lreerhxykovhkfciffnu.supabase.co/storage/v1/object/public/apartment-images/email%2Flogo-bazhouse.png"
              alt="BAZHOUSE"
              width="160"
              height="52"
              style={{ display: 'block', margin: '0 auto', maxWidth: '160px', height: 'auto', border: 0, outline: 'none', textDecoration: 'none' }}
            />
          </Section>
          <Section style={content}>
            <Heading style={h1}>Il tuo account è pronto</Heading>
            <Text style={text}>
              Ciao <strong>{firstName || 'utente'}</strong>,<br />
              è stato creato per te un account Bazhouse con ruolo <strong>{roleLabel || ROLE_LABEL_DEFAULT}</strong>.
            </Text>
            <Text style={text}>Di seguito trovi le credenziali di accesso:</Text>

            <Section style={credBox}>
              <Text style={credLabel}>Email</Text>
              <Text style={credValue}>{email}</Text>
              <Text style={credLabel}>Password temporanea</Text>
              <Text style={credValueMono}>{password}</Text>
            </Section>

            <Text style={textSmall}>
              Per motivi di sicurezza, ti consigliamo di accedere e modificare la password al primo accesso.
            </Text>

            <Button style={button} href={url}>
              Accedi al tuo account
            </Button>

            <Text style={textSmall}>
              Se non riconosci questa email, ignorala oppure contatta il nostro supporto.
            </Text>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AccountCredentialsEmail,
  subject: 'Le tue credenziali di accesso a Bazhouse',
  displayName: 'Credenziali nuovo account',
  previewData: { firstName: 'Marco', email: 'marco@example.com', password: 'TempPass1234!', roleLabel: 'Admin' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#ffffff', padding: '32px 40px 24px', textAlign: 'center' as const, borderBottom: '3px solid #0E3D2C' }
const content = { padding: '40px' }
const h1 = { fontSize: '22px', fontWeight: '300' as const, color: '#0E3D2C', margin: '0 0 24px', fontFamily: 'Georgia, serif' }
const text = { fontSize: '15px', color: '#555', lineHeight: '1.6', margin: '0 0 16px' }
const textSmall = { fontSize: '13px', color: '#666', lineHeight: '1.6', margin: '16px 0' }
const credBox = { backgroundColor: '#f7f5f2', border: '1px solid #e5e0d8', borderRadius: '6px', padding: '20px 24px', margin: '20px 0' }
const credLabel = { fontSize: '11px', color: '#0E3D2C', textTransform: 'uppercase' as const, letterSpacing: '0.12em', margin: '8px 0 4px', fontWeight: 600 as const }
const credValue = { fontSize: '15px', color: '#222', margin: '0 0 8px' }
const credValueMono = { fontSize: '15px', color: '#222', margin: '0 0 8px', fontFamily: 'Menlo, Consolas, monospace', letterSpacing: '0.04em' }
const button = { backgroundColor: '#0E3D2C', color: '#f5f0eb', fontSize: '12px', borderRadius: '4px', padding: '14px 32px', textDecoration: 'none', textTransform: 'uppercase' as const, letterSpacing: '0.15em' }

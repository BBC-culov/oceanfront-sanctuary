/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Section, Text, Button, Hr } from 'npm:@react-email/components@0.0.22'

const BRAND = {
  name: 'Bazhouse',
  email: 'info@bazhouse.it',
  phone: '+39 348 230 3498',
  whatsappUrl: 'https://wa.me/393482303498',
  address: 'Boa Vista, Cabo Verde',
}

interface BrandFooterProps {
  showWhatsapp?: boolean
}

export const BrandFooter = ({ showWhatsapp = true }: BrandFooterProps) => (
  <Section style={footerSection}>
    {showWhatsapp && (
      <Section style={ctaWrap}>
        <Button href={BRAND.whatsappUrl} style={whatsappBtn}>
          💬 Scrivici su WhatsApp
        </Button>
      </Section>
    )}

    <Hr style={hr} />

    <Section style={contactBlock}>
      <Text style={brandLine}>{BRAND.name} · {BRAND.address}</Text>
      <Text style={contactLine}>
        <a href={`mailto:${BRAND.email}`} style={link}>{BRAND.email}</a>
        {'  ·  '}
        <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} style={link}>{BRAND.phone}</a>
      </Text>
      <Text style={copy}>© {new Date().getFullYear()} {BRAND.name}. Tutti i diritti riservati.</Text>
    </Section>
  </Section>
)

const footerSection = { padding: '24px 40px 32px', backgroundColor: '#fafafa', textAlign: 'center' as const, borderTop: '1px solid #eee' }
const ctaWrap = { textAlign: 'center' as const, margin: '4px 0 20px' }
const whatsappBtn = {
  backgroundColor: '#25D366',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '12px 24px',
  borderRadius: '6px',
  display: 'inline-block',
  letterSpacing: '0.5px',
}
const hr = { borderColor: '#eaeaea', margin: '8px 0 16px' }
const contactBlock = { textAlign: 'center' as const }
const brandLine = { margin: '0 0 6px', fontSize: '12px', color: '#666', fontWeight: 600 }
const contactLine = { margin: '0 0 10px', fontSize: '12px', color: '#888' }
const link = { color: '#888', textDecoration: 'underline' }
const copy = { margin: '0', fontSize: '11px', color: '#bbb' }

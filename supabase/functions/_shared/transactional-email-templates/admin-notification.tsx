/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface AdminNotificationProps {
  guestName?: string
  guestEmail?: string
  apartmentName?: string
  checkIn?: string
  checkOut?: string
  bookingCode?: string
  totalPrice?: number
  amountPaid?: number
  paymentType?: string
  notificationType?: string
}

const AdminNotificationEmail = ({
  guestName, guestEmail, apartmentName, checkIn, checkOut,
  bookingCode, totalPrice = 0, amountPaid = 0, paymentType, notificationType,
}: AdminNotificationProps) => {
  const title = notificationType === 'balance' ? 'Saldo Ricevuto' : 'Nuova Prenotazione'
  return (
    <Html lang="it" dir="ltr">
      <Head />
      <Preview>{`${title ?? ""} — ${bookingCode ?? ""}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>BAZ HOUSE — Admin</Heading>
          </Section>
          <Section style={content}>
            <Heading style={h1}>{title}</Heading>
            <Text style={detail}><strong>Ospite:</strong> {guestName} ({guestEmail})</Text>
            <Text style={detail}><strong>Codice:</strong> {bookingCode}</Text>
            <Text style={detail}><strong>Appartamento:</strong> {apartmentName}</Text>
            <Text style={detail}><strong>Date:</strong> {checkIn} → {checkOut}</Text>
            <Text style={detail}><strong>Totale:</strong> €{totalPrice.toFixed(2)}</Text>
            <Text style={detail}><strong>Pagato:</strong> €{amountPaid.toFixed(2)} ({paymentType === 'deposit' ? 'caparra' : 'intero'})</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: AdminNotificationEmail,
  subject: (data: Record<string, any>) => `${data.notificationType === 'balance' ? 'Saldo ricevuto' : 'Nuova prenotazione'} ${data.bookingCode || ''}`,
  to: 'info@bazhouse.it',
  displayName: 'Notifica admin',
  previewData: {
    guestName: 'Marco Rossi', guestEmail: 'marco@example.com', apartmentName: 'Ocean View Suite',
    checkIn: '2025-08-01', checkOut: '2025-08-08', bookingCode: 'ABC12345',
    totalPrice: 1200, amountPaid: 240, paymentType: 'deposit', notificationType: 'initial',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto' }
const header = { backgroundColor: '#1a3329', padding: '24px 40px', textAlign: 'center' as const }
const logo = { margin: '0', color: '#f5f0eb', fontSize: '20px', fontWeight: '300' as const, letterSpacing: '0.1em', fontFamily: 'Georgia, serif' }
const content = { padding: '32px 40px' }
const h1 = { fontSize: '20px', fontWeight: '300' as const, color: '#1a3329', margin: '0 0 16px', fontFamily: 'Georgia, serif' }
const detail = { margin: '0 0 8px', fontSize: '14px', color: '#333', lineHeight: '1.5' }

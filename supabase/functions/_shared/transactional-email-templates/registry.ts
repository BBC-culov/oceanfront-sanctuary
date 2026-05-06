/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as welcome } from './welcome.tsx'
import { template as bookingConfirmation } from './booking-confirmation.tsx'
import { template as balancePaid } from './balance-paid.tsx'
import { template as balanceReminder } from './balance-reminder.tsx'
import { template as adminNotification } from './admin-notification.tsx'
import { template as balancePaymentRequest } from './balance-payment-request.tsx'
import { template as bookingRecovery } from './booking-recovery.tsx'
import { template as modificationRequestReceived } from './modification-request-received.tsx'
import { template as modificationRequestAdmin } from './modification-request-admin.tsx'
import { template as modificationApproved } from './modification-approved.tsx'
import { template as modificationRejected } from './modification-rejected.tsx'
import { template as modificationPaymentRequest } from './modification-payment-request.tsx'
import { template as bookingModified } from './booking-modified.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'booking-confirmation': bookingConfirmation,
  'balance-paid': balancePaid,
  'balance-reminder': balanceReminder,
  'admin-notification': adminNotification,
  'balance-payment-request': balancePaymentRequest,
  'booking-recovery': bookingRecovery,
  'modification-request-received': modificationRequestReceived,
  'modification-request-admin': modificationRequestAdmin,
  'modification-approved': modificationApproved,
  'modification-rejected': modificationRejected,
  'modification-payment-request': modificationPaymentRequest,
  'booking-modified': bookingModified,
}

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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'welcome': welcome,
  'booking-confirmation': bookingConfirmation,
  'balance-paid': balancePaid,
  'balance-reminder': balanceReminder,
  'admin-notification': adminNotification,
  'balance-payment-request': balancePaymentRequest,
}

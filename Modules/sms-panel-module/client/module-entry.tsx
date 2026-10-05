import type { ComponentType } from 'react'

import SmsAdsDetailPage from './pages/marketing/sms/SmsAdsDetailPage'
import SmsAdsWizardPage from './pages/marketing/sms/SmsAdsWizardPage'
import SmsDraftsPage from './pages/marketing/sms/SmsDraftsPage'
import SmsInboxPage from './pages/marketing/sms/SmsInboxPage'
import SmsLinesPage from './pages/marketing/sms/SmsLinesPage'
import SmsNewsletterPage from './pages/marketing/sms/SmsNewsletterPage'
import SmsPanelDashboardPage from './pages/marketing/sms/SmsPanelDashboardPage'
import SmsPatternsPage from './pages/marketing/sms/SmsPatternsPage'
import SmsPaymentCallbackPage from './pages/marketing/sms/SmsPaymentCallbackPage'
import SmsPhonebookPage from './pages/marketing/sms/SmsPhonebookPage'
import SmsReportsPage from './pages/marketing/sms/SmsReportsPage'
import SmsScheduledPage from './pages/marketing/sms/SmsScheduledPage'
import SmsSecretariesPage from './pages/marketing/sms/SmsSecretariesPage'
import SmsSendPage from './pages/marketing/sms/SmsSendPage'
import SmsTargetedPage from './pages/marketing/sms/SmsTargetedPage'
import SmsTopupPage from './pages/marketing/sms/SmsTopupPage'
import SmsWalletPage from './pages/marketing/sms/SmsWalletPage'

export const routes: Record<string, ComponentType> = {
  'marketing/sms': SmsPanelDashboardPage,
  'marketing/sms/ads/new': SmsAdsWizardPage,
  'marketing/sms/ads/:adId': SmsAdsDetailPage,
  'marketing/sms/send': SmsSendPage,
  'marketing/sms/inbox': SmsInboxPage,
  'marketing/sms/reports': SmsReportsPage,
  'marketing/sms/targeted': SmsTargetedPage,
  'marketing/sms/scheduled': SmsScheduledPage,
  'marketing/sms/drafts': SmsDraftsPage,
  'marketing/sms/phonebook': SmsPhonebookPage,
  'marketing/sms/secretaries': SmsSecretariesPage,
  'marketing/sms/patterns': SmsPatternsPage,
  'marketing/sms/wallet': SmsWalletPage,
  'marketing/sms/lines': SmsLinesPage,
  'marketing/sms/newsletter': SmsNewsletterPage,
  'marketing/sms/topup': SmsTopupPage,
  'marketing/sms/payment-callback': SmsPaymentCallbackPage,
}

export default { routes }

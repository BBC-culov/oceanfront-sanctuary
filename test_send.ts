import { createClient } from '@supabase/supabase-js'

const url = 'https://lreerhxykovhkfciffnu.supabase.co'
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZWVyaHh5a292aGtmY2lmZm51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDMwNzMsImV4cCI6MjA4ODU3OTA3M30.xYZhCrXQQfUyOb1sqhD6kpuKEQBkre7mrMsS4Cz_bz8'

const email = 'admin@bazhouse.com'
const password = 'BazAdmin2025!'

const supabase = createClient(url, anonKey)

async function main() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) {
    console.error('login error:', authError)
    return
  }
  console.log('logged in as', authData.user?.email)

  const { data, error } = await supabase.functions.invoke('send-transactional-email', {
    body: {
      templateName: 'welcome',
      recipientEmail: email,
      idempotencyKey: `welcome-test-${Date.now()}`,
      templateData: { guestName: 'Admin Test' },
    },
  })
  console.log('result data:', data)
  if (error) {
    console.error('invoke error:', error)
    if ((error as any).context) {
      try {
        const ctx = await (error as any).context.text()
        console.error('context:', ctx)
      } catch (e) {}
    }
  }
}

main()

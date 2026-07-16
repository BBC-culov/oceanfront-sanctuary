import * as React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { TEMPLATES } from '../_shared/transactional-email-templates/registry.ts'

const SITE_NAME = 'Bazhouse'
const FROM_ADDRESS = `Bazhouse <noreply@bazhouse.com>`
const RESEND_GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend/emails'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const USER_ALLOWED_TEMPLATES = new Set(['welcome'])

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

async function authenticateRequest(req: Request, supabaseUrl: string, serviceKey: string) {
  const authHeader = req.headers.get('Authorization') || ''
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return { ok: false as const }
  if (timingSafeEqual(token, serviceKey)) return { ok: true as const, isServiceRole: true }
  try {
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const sb = createClient(supabaseUrl, anonKey)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return { ok: false as const }
    return { ok: true as const, isServiceRole: false, userEmail: data.user.email ?? undefined }
  } catch {
    return { ok: false as const }
  }
}

async function sendViaResend(to: string, subject: string, html: string, text: string) {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY')
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!lovableKey || !resendKey) throw new Error('Missing LOVABLE_API_KEY or RESEND_API_KEY')

  const res = await fetch(RESEND_GATEWAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${lovableKey}`,
      'X-Connection-Api-Key': resendKey,
    },
    body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html, text }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend send failed [${res.status}]: ${body}`)
  }
  return await res.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const auth = await authenticateRequest(req, supabaseUrl, serviceKey)
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const isServiceRole = auth.isServiceRole
  const callerEmail = (auth as any).userEmail as string | undefined

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let templateName: string
  let recipientEmail: string
  let templateData: Record<string, any> = {}
  const messageId = crypto.randomUUID()
  try {
    const body = await req.json()
    templateName = body.templateName || body.template_name
    recipientEmail = body.recipientEmail || body.recipient_email
    if (body.templateData && typeof body.templateData === 'object') templateData = body.templateData
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!templateName) {
    return new Response(JSON.stringify({ error: 'templateName is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!isServiceRole && !USER_ALLOWED_TEMPLATES.has(templateName)) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  if (!isServiceRole) {
    if (!callerEmail || !recipientEmail || recipientEmail.toLowerCase() !== callerEmail.toLowerCase()) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  const template = TEMPLATES[templateName]
  if (!template) {
    return new Response(JSON.stringify({
      error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`,
    }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }

  const effectiveRecipient = template.to || recipientEmail
  if (!effectiveRecipient) {
    return new Response(JSON.stringify({ error: 'recipientEmail is required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Suppression check
  const { data: suppressed, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', effectiveRecipient.toLowerCase())
    .maybeSingle()

  if (suppressionError) {
    console.error('Suppression check failed', suppressionError)
    return new Response(JSON.stringify({ error: 'Failed to verify suppression status' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (suppressed) {
    await supabase.from('email_send_log').insert({
      message_id: messageId, template_name: templateName,
      recipient_email: effectiveRecipient, status: 'suppressed',
    })
    return new Response(JSON.stringify({ success: false, reason: 'email_suppressed' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Unsubscribe token (best-effort — don't block sending on failure)
  const normalizedEmail = effectiveRecipient.toLowerCase()
  let unsubscribeToken: string | null = null
  try {
    const { data: existingToken } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token, used_at')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (existingToken && !existingToken.used_at) {
      unsubscribeToken = existingToken.token
    } else if (!existingToken) {
      unsubscribeToken = generateToken()
      await supabase.from('email_unsubscribe_tokens').upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true }
      )
    }
  } catch (e) {
    console.warn('Unsubscribe token step skipped', e)
  }

  // Render
  const html = await renderAsync(React.createElement(template.component, templateData))
  const plainText = await renderAsync(
    React.createElement(template.component, templateData),
    { plainText: true }
  )
  const resolvedSubject = typeof template.subject === 'function'
    ? template.subject(templateData)
    : template.subject

  // Send via Resend directly
  try {
    const result = await sendViaResend(effectiveRecipient, resolvedSubject, html, plainText)
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'sent',
      metadata: { provider: 'resend', provider_id: (result as any)?.id ?? null },
    })
    console.log('Email sent via Resend', { templateName, effectiveRecipient })
    return new Response(JSON.stringify({ success: true, id: (result as any)?.id ?? null }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Resend send failed', { templateName, effectiveRecipient, error: message })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: 'failed',
      error_message: message.slice(0, 500),
    })
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

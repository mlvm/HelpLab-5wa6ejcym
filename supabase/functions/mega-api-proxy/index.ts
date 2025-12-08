import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Mega API Config
  const getMegaConfig = (body: any) => {
    return {
      host:
        Deno.env.get('MEGA_API_HOST') ?? 'https://apistart01.megaapi.com.br',
      instanceKey: body?.instanceKey ?? Deno.env.get('MEGA_INSTANCE_KEY'),
      token: body?.token ?? Deno.env.get('MEGA_TOKEN'),
    }
  }

  try {
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      // Empty body
    }

    // ---------------------------------------------------------
    // WEBHOOK HANDLER
    // ---------------------------------------------------------
    // Basic detection of webhook payload structure from Mega API
    // (Checking 'event' and 'data' presence)
    const isWebhook = body?.event && body?.data

    if (isWebhook) {
      console.log('Webhook received:', body.event)

      if (body.event === 'message.create' && body.data) {
        const msgData = body.data
        const phone = msgData.phone || msgData.key?.remoteJid?.split('@')[0]
        const content =
          msgData.message?.conversation ||
          msgData.message?.extendedTextMessage?.text ||
          '[Mídia]'
        const isFromMe = msgData.key?.fromMe
        const megaId = msgData.key?.id
        const contactName = msgData.pushName || phone

        // Only process incoming messages from contacts
        if (phone && !isFromMe) {
          // 1. Upsert Conversation
          const { data: conv, error: convError } = await supabase
            .from('whatsapp_conversations')
            .upsert(
              {
                contact_phone_number: phone,
                contact_name: contactName,
                last_message_at: new Date().toISOString(),
                last_message_preview: content.substring(0, 50),
                status: 'open',
              },
              { onConflict: 'contact_phone_number' },
            )
            .select()
            .single()

          if (convError)
            console.error('Error upserting conversation:', convError)

          if (conv) {
            // 2. Insert Message
            await supabase.from('whatsapp_messages').insert({
              conversation_id: conv.id,
              sender_type: 'contact',
              content: content,
              status: 'received',
              mega_message_id: megaId,
              timestamp: new Date().toISOString(),
            })

            // Increment unread count
            await supabase.rpc('increment_unread_count', { row_id: conv.id })

            // 3. Trigger AI if enabled
            // We'll invoke the AI function asynchronously
            if (conv.ai_enabled) {
              console.log('AI Triggered for conversation:', conv.id)
              // In a real scenario, we would invoke another edge function here
              // await supabase.functions.invoke('ai-assistant', { body: { conversationId: conv.id, message: content } })
            }
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ---------------------------------------------------------
    // CLIENT API HANDLER
    // ---------------------------------------------------------
    const { action, ...payload } = body
    const config = getMegaConfig(payload)

    if (action === 'test_connection') {
      if (!config.instanceKey || !config.token) {
        throw new Error('Missing credentials')
      }
      const baseUrl = `${config.host}/rest`
      const resp = await fetch(
        `${baseUrl}/instance/status/${config.instanceKey}`,
        {
          headers: { Authorization: `Bearer ${config.token}` },
        },
      )
      const data = await resp.json()

      return new Response(
        JSON.stringify({
          success: resp.ok,
          data,
          message: resp.ok ? 'Conectado' : 'Falha na conexão',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    if (action === 'send_message') {
      if (!config.instanceKey || !config.token) {
        throw new Error('Missing credentials')
      }
      const baseUrl = `${config.host}/rest`
      const { phone, message, senderType } = payload

      // 1. Call Mega API
      const resp = await fetch(
        `${baseUrl}/sendMessage/${config.instanceKey}/text`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: phone,
            message: message,
          }),
        },
      )

      const apiData = await resp.json()

      if (!resp.ok) {
        throw new Error(apiData.message || 'Failed to send message')
      }

      // 2. Store in DB
      const { data: conv } = await supabase
        .from('whatsapp_conversations')
        .select('id')
        .eq('contact_phone_number', phone)
        .single()

      if (conv) {
        await supabase.from('whatsapp_messages').insert({
          conversation_id: conv.id,
          sender_type: senderType || 'user',
          content: message,
          status: 'sent',
          timestamp: new Date().toISOString(),
          mega_message_id: apiData.key?.id,
        })

        await supabase
          .from('whatsapp_conversations')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: message.substring(0, 50),
            unread_count: 0, // Reset unread on reply
          })
          .eq('id', conv.id)
      }

      return new Response(JSON.stringify({ success: true, data: apiData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'simulate_incoming') {
      // Action to simulate an incoming message from contact (for testing UI without real WhatsApp)
      const { phone, message, name } = payload

      // 1. Upsert Conversation
      const { data: conv, error: convError } = await supabase
        .from('whatsapp_conversations')
        .upsert(
          {
            contact_phone_number: phone,
            contact_name: name || phone,
            last_message_at: new Date().toISOString(),
            last_message_preview: message.substring(0, 50),
            status: 'open',
          },
          { onConflict: 'contact_phone_number' },
        )
        .select()
        .single()

      if (convError) throw convError

      if (conv) {
        // 2. Insert Message
        await supabase.from('whatsapp_messages').insert({
          conversation_id: conv.id,
          sender_type: 'contact',
          content: message,
          status: 'received',
          timestamp: new Date().toISOString(),
        })

        // Increment unread count
        await supabase.rpc('increment_unread_count', { row_id: conv.id })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'configure_webhook') {
      if (!config.instanceKey || !config.token) {
        throw new Error('Missing credentials')
      }
      const baseUrl = `${config.host}/rest`
      const { webhookUrl } = payload

      const resp = await fetch(`${baseUrl}/webhook/${config.instanceKey}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          enabled: true,
          events: ['message.create'],
        }),
      })

      const data = await resp.json()

      return new Response(JSON.stringify({ success: resp.ok, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

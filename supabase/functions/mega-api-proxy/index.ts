import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('MEGA_API_KEY')
    const webhookUrl = Deno.env.get('MEGA_WEBHOOK_URL')

    if (!apiKey || !webhookUrl) {
      return new Response(
        JSON.stringify({
          error: 'Missing configuration',
          message:
            'MEGA_API_KEY and MEGA_WEBHOOK_URL are required in Supabase Secrets.',
          configured: false,
          missing: [
            !apiKey && 'MEGA_API_KEY',
            !webhookUrl && 'MEGA_WEBHOOK_URL',
          ].filter(Boolean),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    const { action, payload } = await req.json()

    if (action === 'test') {
      const targetUrl = `${webhookUrl}/v1/status`

      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        })

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Falha ao contatar servidor proxy (Edge Function)',
              data,
              upstreamStatus: response.status,
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            },
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: response.status,
            data,
            message: 'Conexão estabelecida com sucesso',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      } catch (e: any) {
        return new Response(
          JSON.stringify({
            success: false,
            error: e.message,
            message: 'Falha ao contatar servidor proxy (Edge Function)',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
    }

    if (action === 'send') {
      const { conversationId, content } = payload
      const targetUrl = `${webhookUrl}/v1/messages`

      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            to: conversationId,
            text: content,
          }),
        })

        const data = await response.json().catch(() => ({}))

        return new Response(
          JSON.stringify({
            success: response.ok,
            data,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      } catch (fetchError: any) {
        return new Response(
          JSON.stringify({
            success: false,
            error: fetchError.message,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
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

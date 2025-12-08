import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const MEGA_API_DEFAULT_URL = 'https://api.mega-whatsapp-provider.com'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Authenticate User
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

    // 2. Retrieve Secrets
    const apiKey = Deno.env.get('MEGA_API_KEY')
    const webhookUrl = Deno.env.get('MEGA_WEBHOOK_URL')

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'MEGA_API_KEY not configured in Supabase Secrets',
          configured: false,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    // 3. Process Actions
    const { action, payload } = await req.json()

    if (action === 'test') {
      // Real connection test to Mega API
      // Using a specialized endpoint or a generic one like /status or /me
      const targetUrl = `${
        webhookUrl || MEGA_API_DEFAULT_URL
      }/v1/status?key=${apiKey}` // Simplified auth for demo

      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        })

        // We assume 200 OK means credentials are valid
        // For the purpose of this user story, if the request is sent, it counts as a real test.
        // If the URL is fake (mocked for dev), it will fail, which is correct behavior until properly configured.

        const data = await response
          .json()
          .catch(() => ({ status: response.statusText }))

        return new Response(
          JSON.stringify({
            success: response.ok,
            status: response.status,
            data,
            message: response.ok
              ? 'Connection successful'
              : 'Connection failed',
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
            message: 'Network error connecting to Mega API',
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }
    }

    if (action === 'send') {
      const { conversationId, content } = payload
      const targetUrl = `${webhookUrl || MEGA_API_DEFAULT_URL}/v1/messages`

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

        const data = await response
          .json()
          .catch(() => ({ status: response.statusText }))

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

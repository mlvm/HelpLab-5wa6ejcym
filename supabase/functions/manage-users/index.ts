import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      },
    )

    // Create a Supabase client with Service Role for Admin actions
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Check if the user is an admin
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      // NOTE: For development/demo purposes, we might allow the first user or specific logic.
      // But strictly following requirements, we return 403.
      // However, since we just added the column, no one is admin yet.
      // To allow the first usage, you might want to manually set your user as admin in DB.

      // For now, strict check:
      return new Response(JSON.stringify({ error: 'Forbidden: Admins only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { method } = req
    const body = method === 'POST' || method === 'PUT' ? await req.json() : {}

    // GET: List Users
    if (method === 'GET') {
      const {
        data: { users },
        error: authError,
      } = await supabaseAdmin.auth.admin.listUsers()
      if (authError) throw authError

      const { data: profiles, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
      if (profileError) throw profileError

      // Merge data
      const mergedUsers = users.map((u: any) => {
        const p = profiles.find((p: any) => p.id === u.id)
        return {
          id: u.id,
          email: u.email,
          name: p?.name || '',
          cpf: p?.cpf || '',
          phone: p?.phone || '',
          unit: p?.unit || '',
          status: p?.status || 'active',
          role: p?.role || 'user',
          avatar_url: p?.avatar_url || null,
        }
      })

      return new Response(JSON.stringify(mergedUsers), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST: Create User or Action
    if (method === 'POST') {
      const { action, ...payload } = body

      if (action === 'create') {
        const { email, password, name, cpf, phone, unit, status, role } =
          payload

        // 1. Create Auth User
        const { data: authData, error: createError } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
          })
        if (createError) throw createError

        if (!authData.user) throw new Error('Failed to create auth user')

        // 2. Create Profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            name,
            cpf,
            phone,
            unit,
            status: status || 'active',
            role: role || 'user',
          })

        if (profileError) {
          // Rollback auth user if profile creation fails
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          throw profileError
        }

        return new Response(
          JSON.stringify({ success: true, user: authData.user }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        )
      }

      if (action === 'update') {
        const { id, email, name, cpf, phone, unit, status, role } = payload

        // 1. Update Auth Email if changed
        if (email) {
          const { error: authError } =
            await supabaseAdmin.auth.admin.updateUserById(id, { email })
          if (authError) throw authError
        }

        // 2. Update Profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .update({
            name,
            cpf,
            phone,
            unit,
            status,
            role,
          })
          .eq('id', id)

        if (profileError) throw profileError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (action === 'changePassword') {
        const { id, password } = payload
        const { error } = await supabaseAdmin.auth.admin.updateUserById(id, {
          password,
        })
        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (action === 'deactivate') {
        const { id } = payload
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ status: 'inactive' })
          .eq('id', id)
        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

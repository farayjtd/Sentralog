import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { action, payload } = await req.json()

    if (action === 'create') {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: payload.email,
        password: payload.password,
        email_confirm: true,
      })

      if (authError) throw authError

      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: payload.full_name,
          username: payload.username,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
          is_active: payload.is_active,
        })

      if (insertError) throw insertError

      return new Response(
        JSON.stringify({ success: true, id: authData.user.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'delete') {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(payload.id)
      if (authError) throw authError

      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', payload.id)

      if (deleteError) throw deleteError

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'update_password') {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        payload.id,
        { password: payload.password }
      )
      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
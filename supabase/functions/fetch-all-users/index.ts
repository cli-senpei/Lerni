import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if the requesting user is an admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      console.error('User authentication error:', userError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (roleError || !roleData) {
      console.error('Admin check error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Fetch all users from auth.users using admin API
    const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers()

    if (usersError) {
      console.error('Error fetching users:', usersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Fetch user profiles
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('user_learning_profiles')
      .select('*')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    // Fetch user roles
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('user_id, role')

    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
    }

    // Combine data
    const enrichedUsers = users.map(authUser => {
      const profile = profiles?.find(p => p.user_id === authUser.id)
      const userRoles = roles?.filter(r => r.user_id === authUser.id).map(r => r.role) || []
      
      return {
        id: authUser.id,
        email: authUser.email,
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        user_name: profile?.user_name || authUser.email || 'Unknown User',
        profile_id: profile?.id,
        roles: userRoles,
        isAdmin: userRoles.includes('admin'),
        provider: authUser.app_metadata?.provider || 'email',
      }
    })

    console.log(`Successfully fetched ${enrichedUsers.length} users`)

    return new Response(
      JSON.stringify({ users: enrichedUsers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

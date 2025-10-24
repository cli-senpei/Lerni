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

    const { componentName } = await req.json()

    if (!componentName) {
      return new Response(
        JSON.stringify({ error: 'Component name is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Map of available game components
    const gameFiles: Record<string, string> = {
      'BaselineGame': '/src/components/dashboard/BaselineGame.tsx',
      'LetterMatchGame': '/src/components/dashboard/LetterMatchGame.tsx',
      'PhaserGame': '/src/components/dashboard/PhaserGame.tsx',
      'PhonicsPopGame': '/src/components/dashboard/PhonicsPopGame.tsx',
      'ReadingGame': '/src/components/dashboard/ReadingGame.tsx',
      'RhymeGameMode': '/src/components/dashboard/RhymeGameMode.tsx',
      'WordSortGame': '/src/components/dashboard/WordSortGame.tsx',
    }

    const filePath = gameFiles[componentName]

    if (!filePath) {
      return new Response(
        JSON.stringify({ 
          error: 'Component not found',
          availableComponents: Object.keys(gameFiles)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Note: In a real implementation, you would read the actual file from the filesystem
    // For now, we'll return a message that explains this is stored in the database
    return new Response(
      JSON.stringify({ 
        message: 'Game code is stored in the database',
        componentName,
        filePath,
        note: 'Use the code field in the games table to edit game components'
      }),
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

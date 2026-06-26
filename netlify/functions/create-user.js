const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  }

  try {
    const { email, password } = JSON.parse(event.body)
    if (!email || !password) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email y contraseña requeridos' }) }
    }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (error) return { statusCode: 400, headers, body: JSON.stringify({ error: error.message }) }

    return { statusCode: 200, headers, body: JSON.stringify({ id: data.user.id, email: data.user.email }) }

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) }
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// Whitelist of allowed admin emails - update with your actual admin emails
const ALLOWED_ADMIN_EMAILS = [
  'admin@anybox.com',
  'superadmin@anybox.com',
  // Add more allowed admin emails here
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('Login attempt for email:', email)

    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if email is in the allowed list
    console.log('Checking email against whitelist:', ALLOWED_ADMIN_EMAILS)
    console.log('Email in whitelist:', ALLOWED_ADMIN_EMAILS.includes(email))
    
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      console.log('Unauthorized login attempt for email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Email is whitelisted, checking database...')

    // Get admin user from database by email
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    console.log('Database query result:', { admin, error })

    if (error) {
      console.error('Error fetching admin:', error)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!admin) {
      console.log('No admin found with email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Admin found:', admin)

    // Verify password
    console.log('Verifying password...')
    console.log('Input password:', password)
    console.log('Stored hash:', admin.password_hash)
    
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)
    console.log('Password valid:', isValidPassword)
    
    // Let's also try to hash the input password to see if it matches
    const testHash = await bcrypt.hash(password, 12)
    console.log('Generated hash for test:', testHash)
    
    if (!isValidPassword) {
      console.log('Invalid password for email:', email)
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('Password verified, creating session...')

    // Create session
    const sessionToken = generateSessionToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour session

    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: admin.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString()
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Update last login
    await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id)

    // Log activity
    await supabase
      .from('admin_activity_log')
      .insert({
        admin_id: admin.id,
        action: 'login',
        entity_type: 'auth',
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      }
    })

    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

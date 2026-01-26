import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { authRateLimit } from '@/lib/rate-limit'
import { logger, handleApiError, getRequestContext } from '@/lib/logger'
import { validateRequest, loginSchema } from '@/lib/validation'
import { addCSRFProtection, addSecurityHeaders, addCORSHeaders, handleCORSOptions } from '@/lib/security'

// Get allowed admin emails from environment variable
const ALLOWED_ADMIN_EMAILS = process.env.ALLOWED_ADMIN_EMAILS 
  ? process.env.ALLOWED_ADMIN_EMAILS.split(',').map(email => email.trim())
  : ['admin@anybox.com', 'superadmin@anybox.com'] // Fallback for development

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = authRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const body = await request.json()
    
    // Validate input
    const validation = validateRequest(loginSchema, body)
    if (!validation.success) {
      logger.warn('Invalid login attempt', getRequestContext(request, { 
        validationError: validation.error,
        email: body.email 
      }))
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Check if email is in the allowed list
    
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }


    // Get admin user from database by email
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()


    if (error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }


    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }


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

    // Add security headers and CSRF protection
    addCSRFProtection(response)
    addSecurityHeaders(response)
    addCORSHeaders(response, request)

    return response
  } catch (error) {
    return handleApiError(error, request, { action: 'admin_login' })
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

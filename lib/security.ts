import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

// CSRF Protection Middleware
export function addCSRFProtection(response: NextResponse) {
  // Generate CSRF token if not exists
  const csrfToken = randomBytes(32).toString('hex')
  
  // Set CSRF token in HTTP-only cookie
  response.cookies.set('csrf-token', csrfToken, {
    httpOnly: false, // Must be readable by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  })
  
  // Add CSRF token to response headers for easy access
  response.headers.set('X-CSRF-Token', csrfToken)
  
  return response
}

// Verify CSRF token for state-changing requests
export function verifyCSRFToken(request: NextRequest): boolean {
  const method = request.method
  
  // Only verify for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true
  }
  
  // Get token from header
  const headerToken = request.headers.get('x-csrf-token')
  
  // Get token from cookie
  const cookieToken = request.cookies.get('csrf-token')?.value
  
  // Compare tokens
  return headerToken === cookieToken && headerToken !== undefined
}

// CSRF Protection Middleware
export function csrfProtection(request: NextRequest): NextResponse | null {
  if (!verifyCSRFToken(request)) {
    return NextResponse.json(
      { error: 'CSRF token mismatch' },
      { 
        status: 403,
        headers: {
          'X-Error': 'CSRF validation failed'
        }
      }
    )
  }
  
  return null
}

// Content Security Policy
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live", // Allow Vercel live preview
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  )
  
  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}

// CORS Configuration
export function addCORSHeaders(
  response: NextResponse, 
  request: NextRequest,
  options: {
    allowedOrigins?: string[]
    allowedMethods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  } = {}
): NextResponse {
  const {
    allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials = true
  } = options
  
  const origin = request.headers.get('origin')
  
  // Check if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin)
  } else if (allowedOrigins.includes('*')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }
  
  response.headers.set('Access-Control-Allow-Methods', allowedMethods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', allowedHeaders.join(', '))
  
  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  
  return response
}

// Handle preflight requests
export function handleCORSOptions(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 })
    return addCORSHeaders(response, request)
  }
  
  return null
}

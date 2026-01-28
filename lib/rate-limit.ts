import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiter for production
// For production, consider using Redis or a database-backed solution
const rateLimit = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
}

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(request: NextRequest): NextResponse | null {
    // Get client IP from various headers (works in production and behind proxies)
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const requestIp = (request as any).ip as string | undefined
    const userAgent = request.headers.get('user-agent')
    const identifier = forwarded?.split(',')[0]?.trim() || realIp || requestIp || userAgent || 'unknown'
    const now = Date.now()
    const windowStart = now - config.windowMs

    // Clean up old entries
    for (const [key, value] of rateLimit.entries()) {
      if (value.resetTime < now) {
        rateLimit.delete(key)
      }
    }

    // Check current usage
    const current = rateLimit.get(identifier)
    
    if (!current) {
      // First request from this IP
      rateLimit.set(identifier, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Allow request
    }

    if (current.resetTime < now) {
      // Window has reset
      current.count = 1
      current.resetTime = now + config.windowMs
      return null // Allow request
    }

    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: config.message || `Rate limit exceeded. Try again in ${Math.ceil((current.resetTime - now) / 1000)} seconds.`,
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': current.resetTime.toString(),
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString()
          }
        }
      )
    }

    // Increment counter and allow request
    current.count++
    return null
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: process.env.NODE_ENV === 'production' ? 5 : 50, // 5 attempts per 15 minutes
  message: 'Too many login attempts. Please try again later.'
})

export const generalApiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'API rate limit exceeded.'
})

export const uploadRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 uploads per minute
  message: 'Upload rate limit exceeded. Please wait before uploading more files.'
})

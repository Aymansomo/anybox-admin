// Production-ready error logging and monitoring
// Replace console.log with structured logging for production

import { NextRequest, NextResponse } from 'next/server'

interface LogEntry {
  timestamp: string
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
  message: string
  context?: {
    userId?: string
    ip?: string
    userAgent?: string
    endpoint?: string
    method?: string
    statusCode?: number
    error?: string
    stack?: string
    [key: string]: any
  }
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  private log(entry: LogEntry) {
    const logMessage = JSON.stringify(entry)
    
    if (this.isProduction) {
      // In production, send to your logging service
      // Examples: Sentry, LogRocket, CloudWatch, etc.
      console.error(logMessage) // Fallback to console.error for structured logs
    } else {
      // In development, pretty print
      console.log(`[${entry.level}] ${entry.message}`, entry.context || '')
    }
  }

  error(message: string, context?: LogEntry['context']) {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      context
    })
  }

  warn(message: string, context?: LogEntry['context']) {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      context
    })
  }

  info(message: string, context?: LogEntry['context']) {
    this.log({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      context
    })
  }

  debug(message: string, context?: LogEntry['context']) {
    if (!this.isProduction) {
      this.log({
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        context
      })
    }
  }
}

export const logger = new Logger()

// Helper function to extract request context
export function getRequestContext(request: NextRequest, additionalContext?: any): LogEntry['context'] {
  return {
    ip: request.headers.get('x-forwarded-for')?.split(',')[0] || 
        request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    endpoint: request.url,
    method: request.method,
    ...additionalContext
  }
}

// Error boundary for API routes
export function handleApiError(error: unknown, request: NextRequest, context?: any) {
  const errorContext = getRequestContext(request, {
    ...context,
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined
  })

  if (error instanceof Error) {
    logger.error('API Error', errorContext)
  } else {
    logger.error('Unknown API Error', errorContext)
  }

  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV !== 'production'
  
  return NextResponse.json(
    { 
      error: isDevelopment && error instanceof Error ? error.message : 'Internal server error',
      ...(isDevelopment && { stack: error instanceof Error ? error.stack : undefined })
    },
    { status: 500 }
  )
}

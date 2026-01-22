import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    // Get session with admin details
    const { data: sessionData, error } = await supabase
      .from('admin_sessions')
      .select(`
        admin_id,
        expires_at,
        admins!inner (
          id,
          username,
          email,
          full_name,
          role,
          is_active
        )
      `)
      .eq('session_token', sessionToken)
      .single()

    if (error) {
      console.error('Error fetching session:', error)
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 401 }
      )
    }

    // Check if session is expired
    if (new Date() > new Date(sessionData.expires_at)) {
      // Clean up expired session
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken)

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      )
    }

    // Check if admin is still active
    const adminData = sessionData.admins as any
    if (!adminData.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      admin: {
        id: adminData.id,
        username: adminData.username,
        email: adminData.email,
        full_name: adminData.full_name,
        role: adminData.role,
        is_active: adminData.is_active
      }
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

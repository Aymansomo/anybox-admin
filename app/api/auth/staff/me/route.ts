import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET!) as any
    
    if (decoded.type !== 'staff') {
      return NextResponse.json({ error: 'Invalid token type' }, { status: 401 })
    }

    // Get fresh staff data
    const { data: staff, error } = await supabase
      .from('staff')
      .select('id, username, email, full_name, role, is_active, last_login, join_date, created_at, updated_at')
      .eq('id', decoded.id)
      .eq('is_active', true)
      .single()

    if (error || !staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    }

    return NextResponse.json({ staff })

  } catch (error) {
    console.error('Staff auth error:', error)
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

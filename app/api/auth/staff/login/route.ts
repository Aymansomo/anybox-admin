import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { authRateLimit } from '@/lib/rate-limit'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = authRateLimit(request)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find staff member by email
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !staff) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, staff.password_hash)
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Update last login
    await supabase
      .from('staff')
      .update({ last_login: new Date().toISOString() })
      .eq('id', staff.id)

    // Create JWT token
    const token = jwt.sign(
      { 
        id: staff.id, 
        email: staff.email, 
        role: staff.role,
        type: 'staff'
      },
      JWT_SECRET!, // Type assertion since we validated above
      { expiresIn: '24h' }
    )

    // Remove password hash from response
    const { password_hash, ...staffData } = staff

    return NextResponse.json({
      token,
      staff: staffData
    })

  } catch (error) {
    console.error('Staff login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

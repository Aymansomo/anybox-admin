import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// GET all staff (managers and staff, but not admins)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('staff')
      .select(`
        id,
        username,
        email,
        full_name,
        role,
        is_active,
        last_login,
        join_date,
        created_at
      `, { count: 'exact' })
      .in('role', ['staff', 'manager']) // Only staff and managers, not admins

    // Apply filters
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    if (search) {
      query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order('created_at', { ascending: false })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      staff: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST new staff member (only staff role, managers cannot create managers)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Managers can only create staff members, not other managers
    if (body.role === 'manager') {
      return NextResponse.json({ error: 'Managers cannot create other managers. Only admins can create managers.' }, { status: 403 })
    }
    
    // Force role to be staff
    const staffData = {
      ...body,
      role: 'staff'
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(staffData.password, 12)
    
    const { data, error } = await supabase
      .from('staff')
      .insert([{
        username: staffData.username,
        email: staffData.email,
        password_hash: passwordHash,
        full_name: staffData.full_name,
        role: staffData.role,
        is_active: staffData.is_active !== false
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ staff: data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

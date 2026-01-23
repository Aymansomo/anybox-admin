import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

// GET single staff member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
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
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      console.error('Error fetching staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ staff: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT update staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updateData: any = {
      username: body.username,
      email: body.email,
      full_name: body.full_name,
      role: body.role,
      is_active: body.is_active
    }

    // Update password if provided
    if (body.password) {
      updateData.password_hash = await bcrypt.hash(body.password, 12)
    }

    const { data, error } = await supabase
      .from('staff')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      console.error('Error updating staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ staff: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
      }
      console.error('Error deleting staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Staff member deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

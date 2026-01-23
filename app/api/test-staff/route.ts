import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing staff table connection...')
    
    // Test if we can connect to staff table
    const { data, error } = await supabase
      .from('staff')
      .select('id, full_name, email, role')
      .eq('is_active', true)
      .limit(5)
    
    if (error) {
      console.error('Error connecting to staff table:', error)
      return NextResponse.json({ 
        error: 'Staff table connection failed',
        details: error.message,
        suggestion: 'Run the SQL migration: sql-migrations/add_staff_to_orders.sql'
      }, { status: 500 })
    }
    
    console.log('✅ Staff table connection successful!')
    return NextResponse.json({ 
      success: true,
      message: 'Staff table connection successful',
      count: data?.length || 0,
      staff: data
    })
    
  } catch (err: any) {
    console.error('Connection error:', err)
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: err.message
    }, { status: 500 })
  }
}

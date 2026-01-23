import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Testing orders table structure...')
    
    // Test if we can select staff_id from orders table
    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, staff_id')
      .limit(3)
    
    if (error) {
      console.error('Error accessing staff_id in orders table:', error)
      
      if (error.message.includes('column "staff_id" does not exist')) {
        return NextResponse.json({ 
          error: 'staff_id column missing from orders table',
          details: error.message,
          solution: 'Run the SQL migration: sql-migrations/add_staff_to_orders.sql'
        }, { status: 400 })
      }
      
      return NextResponse.json({ 
        error: 'Orders table access failed',
        details: error.message
      }, { status: 500 })
    }
    
    console.log('✅ Orders table structure OK!')
    return NextResponse.json({ 
      success: true,
      message: 'Orders table has staff_id column',
      count: data?.length || 0,
      orders: data
    })
    
  } catch (err: any) {
    console.error('Connection error:', err)
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: err.message
    }, { status: 500 })
  }
}

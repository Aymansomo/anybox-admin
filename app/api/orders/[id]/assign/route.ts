import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT - Assign order to staff member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const { staff_id } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Convert undefined to null and validate staff_id
    const validStaffId = staff_id === undefined || staff_id === null || staff_id === '' ? null : staff_id

    // Verify the order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, order_number')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // If staff_id is provided, verify the staff member exists and is active
    if (validStaffId) {
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('id, full_name, is_active')
        .eq('id', validStaffId)
        .eq('is_active', true)
        .single()

      if (staffError || !staff) {
        return NextResponse.json({ error: 'Staff member not found or inactive' }, { status: 404 })
      }
    }

    // Update the order with the staff assignment
    const { data, error } = await supabase
      .from('orders')
      .update({
        staff_id: validStaffId,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        id,
        order_number,
        staff_id,
        updated_at,
        staff (
          id,
          full_name,
          email,
          role
        )
      `)
      .single()

    if (error) {
      console.error('Error assigning order to staff:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      order: data,
      message: staff_id 
        ? `Order ${order.order_number} assigned successfully` 
        : `Order ${order.order_number} unassigned successfully`
    })

  } catch (error) {
    console.error('Unexpected error in order assignment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, Clock, Package, Truck, Home } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface OrderDetailsProps {
  orderId: string
}

interface Profile {
  id: string
  email: string
  full_name?: string
  username?: string
  phone?: string
}

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  price: number
  total: number
  product?: {
    name: string
    slug: string
  }
}

interface Order {
  id: string
  order_number: string
  customer_id?: string
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  shipping_address: any
  billing_address: any
  notes?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  user_id?: string
  staff_id?: number
  profile?: Profile
  order_items?: OrderItem[]
  // Fields from admin_orders view
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  // Staff assignment fields from admin_orders view
  staff_full_name?: string
  staff_email?: string
  staff_role?: string
}

export function OrderDetails({ orderId }: OrderDetailsProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [staff, setStaff] = useState<any[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>("unassigned")
  const [isAssigningStaff, setIsAssigningStaff] = useState(false)
  const [isManagerContext, setIsManagerContext] = useState(false)

  useEffect(() => {
    fetchOrderDetails()
    fetchStaff()
  }, [orderId])

  const fetchStaff = async () => {
    try {
      console.log('Fetching staff members...')
      
      // Check if we're in a manager context by looking at the URL or localStorage
      const isManager = window.location.pathname.includes('/manager-orders') || 
                        localStorage.getItem('staffUser') && 
                        JSON.parse(localStorage.getItem('staffUser') || '{}').role === 'manager'
      
      console.log('Manager context:', isManager)
      setIsManagerContext(!!isManager)
      
      // Only fetch staff members (not managers) for managers
      let query = supabase
        .from('staff')
        .select('id, full_name, email, role')
        .eq('is_active', true)
      
      if (isManager) {
        // Managers can only see staff members, not other managers
        query = query.eq('role', 'staff')
      }
      
      const { data, error } = await query.order('full_name')

      if (error) {
        console.error('Supabase error fetching staff:', error)
        throw error
      }
      
      console.log('Staff data fetched:', data)
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      setStaff([]) // Set empty array on error to prevent infinite loading
    }
  }

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Fetching order details for ID:', orderId)

      // First try admin_orders view, fallback to direct orders query
      let orderData, orderError
      
      try {
        console.log('Trying admin_orders view...')
        const result = await supabase
          .from('admin_orders')
          .select('*')
          .eq('id', orderId)
          .single()
        orderData = result.data
        orderError = result.error
      } catch (viewError) {
        console.log('Admin orders view failed, trying direct query...')
        const result = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single()
        orderData = result.data
        orderError = result.error
      }

      console.log('Order query result:', { orderData, orderError })

      if (orderError) throw orderError

      console.log('Order data fetched:', orderData)

      // Fetch order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products:product_id (
            name,
            slug
          )
        `)
        .eq('order_id', orderId)

      if (itemsError) throw itemsError

      const fullOrder = {
        ...orderData,
        order_items: itemsData || []
      }

      // Ensure staff_id is properly handled
      if (fullOrder.staff_id === undefined || fullOrder.staff_id === null) {
        fullOrder.staff_id = null
      }

      console.log('Full order data:', fullOrder)
      setOrder(fullOrder)
      setStatus(fullOrder.status)
      setNotes(fullOrder.notes || "")
      
      // Safely set selected staff ID
      const staffId = fullOrder.staff_id
      setSelectedStaffId(staffId ? staffId.toString() : "unassigned")

    } catch (error) {
      console.error('Error fetching order details:', error)
      setError('Failed to load order details')
      toast.error('Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!order) return

    try {
      setIsSaving(true)
      
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error

      toast.success('Order updated successfully')
      fetchOrderDetails() // Refresh data
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order || isUpdatingStatus) return

    try {
      setIsUpdatingStatus(true)
      
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Add timestamps based on status
      if (newStatus === 'shipped' && order.status !== 'shipped') {
        updateData.shipped_at = new Date().toISOString()
      }
      if (newStatus === 'delivered' && order.status !== 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      setStatus(newStatus)
      toast.success(`Order status updated to ${newStatus}`)
      fetchOrderDetails() // Refresh data to get updated timestamps
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
      // Revert status on error
      setStatus(order.status)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleStaffAssignment = async (staffId: string) => {
    if (!order) return

    try {
      setIsAssigningStaff(true)
      
      console.log('Assigning staff:', staffId, 'to order:', orderId)
      
      const updateData: any = {
        updated_at: new Date().toISOString()
      }
      
      if (staffId === "unassigned" || staffId === "" || staffId === undefined) {
        updateData.staff_id = null
      } else {
        const parsedId = parseInt(staffId)
        updateData.staff_id = isNaN(parsedId) ? null : parsedId
      }
      
      console.log('Update data:', updateData)
      
      const { error, data } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()

      if (error) {
        console.error('Supabase update error:', error)
        throw error
      }
      
      console.log('Update successful:', data)

      toast.success(staffId === "unassigned" ? 'Staff assignment removed' : 'Order assigned to staff member')
      fetchOrderDetails() // Refresh data
    } catch (error) {
      console.error('Error assigning staff:', error)
      toast.error('Failed to assign staff: ' + (error as any).message)
      // Revert selection on error
      setSelectedStaffId(order.staff_id?.toString() || "unassigned")
    } finally {
      setIsAssigningStaff(false)
    }
  }

  const formatAddress = (address: any) => {
    if (!address || typeof address !== 'object') return 'No address available'
    
    const parts = [
      address.street,
      address.city,
      address.state,
      address.country,
      address.postal_code
    ].filter(Boolean)
    
    return parts.length > 0 ? parts.join(', ') : 'No address available'
  }

  const generateTimeline = (order: Order) => {
    const timeline = [
      { status: "pending", date: new Date(order.created_at).toLocaleString(), label: "Order Placed" }
    ]

    if (order.shipped_at) {
      timeline.push({ status: "shipped", date: new Date(order.shipped_at).toLocaleString(), label: "Shipped" })
    }

    if (order.delivered_at) {
      timeline.push({ status: "delivered", date: new Date(order.delivered_at).toLocaleString(), label: "Delivered" })
    }

    if (order.status === 'processing') {
      timeline.push({ status: "confirmed", date: new Date(order.updated_at).toLocaleString(), label: "Processing" })
    }

    if (order.status === 'cancelled') {
      timeline.push({ status: "cancelled", date: new Date(order.updated_at).toLocaleString(), label: "Cancelled" })
    }

    return timeline
  }

  const getStatusIcon = (s: string) => {
    switch (s) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />
      case "confirmed":
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />
      case "packed":
        return <Package className="w-5 h-5 text-purple-500" />
      case "shipped":
        return <Truck className="w-5 h-5 text-indigo-500" />
      case "delivered":
        return <Home className="w-5 h-5 text-green-500" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
        <span className="text-muted-foreground">Loading order details...</span>
      </div>
    )
  }

  if (error || !order) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading order</div>
            <p className="text-muted-foreground text-sm">{error || 'Order not found'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const timeline = generateTimeline(order)
  const subtotal = order.order_items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0
  const tax = order.total_amount - subtotal
  const shipping = 0 // You can calculate this based on your business logic

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Customer Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold text-foreground">{order.customer_name || 'Unknown Customer'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold text-foreground">{order.customer_email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold text-foreground">{order.customer_phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Shipping Address</p>
                <p className="font-semibold text-foreground">{formatAddress(order.shipping_address)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff Assignment */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">
              {isManagerContext ? 'Assign to Staff Member' : 'Staff Assignment'}
            </CardTitle>
            {isManagerContext && (
              <p className="text-sm text-muted-foreground">
                Managers can only assign orders to staff members
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff-assignment">
                {isManagerContext ? 'Assign to Staff Member' : 'Assign to Staff Member'}
              </Label>
              <Select
                value={selectedStaffId}
                onValueChange={(value) => {
                  setSelectedStaffId(value)
                  handleStaffAssignment(value)
                }}
                disabled={isAssigningStaff}
              >
                <SelectTrigger id="staff-assignment">
                  <SelectValue placeholder="Select staff member...">
                    {isAssigningStaff ? "Assigning..." : selectedStaffId && selectedStaffId !== "unassigned" ? 
                      staff.find(s => s.id.toString() === selectedStaffId)?.full_name || "Loading..." : 
                      staff.length === 0 ? "No staff available" : "Select staff member..."
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {staff.length === 0 ? (
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      {isManagerContext ? "No active staff members available" : "No active staff members available"}
                    </div>
                  ) : (
                    staff.map((staffMember) => (
                      <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                        {staffMember.full_name} {isManagerContext ? '' : `(${staffMember.role})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {order.staff_id && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  Currently assigned to: {order.staff_full_name || 'Loading...'}
                  {isManagerContext && order.staff_role && order.staff_role !== 'staff' && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({order.staff_role})
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.staff_email} ({order.staff_role})
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items?.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                >
                  <div>
                    <p className="font-medium text-foreground">{item.product?.name || `Product ${item.product_id}`}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium text-foreground">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-lg text-foreground">${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timeline.map((event: any, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(event.status)}
                    {index < timeline.length - 1 && <div className="w-0.5 h-8 bg-border mt-2 mb-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-foreground">{event.label}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admin Notes */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add internal notes about this order..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            <Button
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Notes"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Status Card */}
        <Card className="bg-card border-border sticky top-20">
          <CardHeader>
            <CardTitle className="text-lg">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current Status</p>
              <Badge className="text-base px-3 py-1 bg-primary/20 text-primary border-primary/30">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Change Status</Label>
              <Select 
                value={status} 
                onValueChange={handleStatusChange}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {isUpdatingStatus && (
                <p className="text-sm text-muted-foreground">Updating status...</p>
              )}
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Order Number</p>
              <p className="font-semibold text-foreground">{order.order_number}</p>
            </div>

            {order.tracking_number && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Tracking Number</p>
                <p className="font-semibold text-foreground">{order.tracking_number}</p>
              </div>
            )}

            <Button variant="outline" className="w-full bg-transparent">
              Print Order
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

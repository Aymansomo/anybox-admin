"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Order {
  id: string
  order_number: string
  customer_id?: string
  user_id?: string
  staff_id?: number
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  total_amount: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  order_items?: Array<{
    quantity: number
    price: number
    product_id: string
    product_name: string
  }>
}

const statusConfig = {
  pending: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
  processing: { label: "Processing", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  shipped: { label: "Shipped", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
  delivered: { label: "Delivered", color: "text-green-500 bg-green-500/10 border-green-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-500 bg-red-500/10 border-red-500/30" },
}

export function StaffOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentStaffId, setCurrentStaffId] = useState<number | null>(null)
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {
    fetchStaffOrders()
  }, [])

  const fetchStaffOrders = async (retryCount = 0) => {
    try {
      setLoading(true)
      
      // Get current staff member from localStorage
      const staffUser = localStorage.getItem('staffUser')
      const staffToken = localStorage.getItem('staffToken')
      
      console.log('Staff user from localStorage:', staffUser)
      console.log('Staff token from localStorage:', staffToken)
      
      if (!staffUser) {
        console.error('No staff user found in localStorage')
        toast.error('Please log in again')
        // Redirect to login if no staff user
        window.location.href = '/staff-login'
        return
      }
      
      const staff = JSON.parse(staffUser)
      setCurrentStaffId(staff.id)
      
      console.log('Fetching orders for staff ID:', staff.id)
      
      // Fetch orders assigned to this staff member with retry logic
      const { data, error } = await supabase
        .from('staff_orders_view')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          customer_name,
          customer_email,
          customer_phone,
          address,
          city,
          state,
          zip_code,
          country,
          order_items (
            quantity,
            price
          )
        `)
        .eq('staff_id', staff.id)
        .order('created_at', { ascending: false })

      console.log('Supabase query result:', { data, error })
      
      // Log the raw data to see what we're getting
      console.log('Raw orders data:', JSON.stringify(data, null, 2))

      if (error) {
        console.error('Supabase error fetching staff orders:', error)
        
        // If it's a network error and we haven't retried yet, try once more
        if (error.message?.includes('Failed to fetch') && retryCount < 2) {
          console.log(`Retrying fetch (attempt ${retryCount + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          return fetchStaffOrders(retryCount + 1)
        }
        
        throw error
      }
      
      // If we got orders, fetch order items with product names
      const ordersWithItems = await Promise.all(
        (data || []).map(async (order) => {
          try {
            const { data: itemsData } = await supabase
              .from('order_items')
              .select(`
                quantity,
                price,
                product_id
              `)
              .eq('order_id', order.id)
            
            // Get product names separately
            const productIds = itemsData?.map(item => item.product_id) || []
            const { data: productsData } = await supabase
              .from('products')
              .select('id, name')
              .in('id', productIds)
            
            // Create a map of product_id -> product_name
            const productMap = new Map()
            productsData?.forEach(product => {
              productMap.set(product.id, product.name)
            })
            
            // Transform the items data to include product names
            const transformedItems = itemsData?.map(item => ({
              quantity: item.quantity,
              price: item.price,
              product_id: item.product_id,
              product_name: productMap.get(item.product_id) || 'Unknown Product'
            })) || []
            
            return {
              ...order,
              order_items: transformedItems
            }
          } catch (itemError) {
            console.warn('Failed to fetch order items for order:', order.id, itemError)
            return {
              ...order,
              order_items: []
            }
          }
        })
      )
      
      console.log('Staff orders fetched successfully:', ordersWithItems)
      setOrders(ordersWithItems)
    } catch (error) {
      console.error('Error fetching staff orders:', error)
      
      // Show user-friendly error message
      const errorMessage = (error as any).message || 'Unknown error'
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and refresh.')
        setConnectionError(true)
      } else {
        toast.error('Failed to load your orders: ' + errorMessage)
      }
      
      setOrders([]) // Set empty array to prevent infinite loading
    } finally {
      setLoading(false)
    }
  }

  const handleOpenNotes = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.status)
    setNotes("")
    setIsNotesOpen(true)
  }

  const handleOpenView = (order: Order) => {
    router.push(`/staff-dashboard/${order.id}`)
  }

  const handleSaveUpdate = async () => {
    if (!selectedOrder) return

    try {
      setIsUpdating(true)
      
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString()
      }

      // Add timestamps based on status
      if (newStatus === 'shipped' && selectedOrder.status !== 'shipped') {
        updateData.shipped_at = new Date().toISOString()
      }
      if (newStatus === 'delivered' && selectedOrder.status !== 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', selectedOrder.id)

      if (error) throw error

      toast.success('Order updated successfully!')
      setIsNotesOpen(false)
      fetchStaffOrders() // Refresh data
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    } finally {
      setIsUpdating(false)
    }
  }

  const getItemCount = (order: Order) => {
    return order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
        <span className="text-muted-foreground">Loading your orders...</span>
      </div>
    )
  }

  return (
    <div>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Assigned Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                {orders.length} order{orders.length !== 1 ? 's' : ''} assigned to you
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setConnectionError(false)
                fetchStaffOrders()
              }}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {connectionError ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-500 text-2xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Connection Error</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to connect to the database. Please check your internet connection.
                </p>
                <Button 
                  onClick={() => {
                    setConnectionError(false)
                    fetchStaffOrders()
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Try Again
                </Button>
              </div>
            </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No orders assigned to you yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Order ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Address</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Items</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Date</th>
                      <th className="text-right py-3 px-4 font-semibold text-foreground text-sm">Actions</th>
                    </tr>
                </thead>
                  <tbody>
                    {orders.map((order) => {
                      const config = statusConfig[order.status]
                      return (
                        <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-foreground text-sm">{order.order_number}</td>
                          <td className="py-3 px-4 text-foreground font-medium text-sm">{order.customer_name || 'Unknown Customer'}</td>
                          <td className="py-3 px-4 text-muted-foreground text-sm max-w-xs truncate">
                            {order.city && order.state ? `${order.city}, ${order.state}` : 
                             order.city ? order.city : 
                             order.address ? order.address.substring(0, 30) + '...' : 'No address'}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">{getItemCount(order)}</td>
                          <td className="py-3 px-4 font-semibold text-foreground text-sm">DH {order.total_amount.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={`text-xs ${config.color}`}>
                              {config.label}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenView(order)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenNotes(order)}
                              >
                                <MessageSquare className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </CardContent>
      </Card>
      
      {/* Dialog for updating order status and adding notes */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Update Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this order..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveUpdate}
                disabled={isUpdating}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isUpdating ? 'Updating...' : 'Update Order'}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsNotesOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

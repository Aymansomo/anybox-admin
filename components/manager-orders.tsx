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
import { Eye, UserPlus, RefreshCw } from "lucide-react"
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
  staff?: {
    id: number
    full_name: string
    email: string
    role: string
  } | null
  staff_name?: string
  staff_email?: string
  staff_role?: string
}

interface StaffMember {
  id: number
  username: string
  email: string
  full_name: string
  role: "manager" | "staff"
  is_active: boolean
}

const statusConfig = {
  pending: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
  processing: { label: "Processing", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  shipped: { label: "Shipped", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
  delivered: { label: "Delivered", color: "text-green-500 bg-green-500/10 border-green-500/30" },
  cancelled: { label: "Cancelled", color: "text-red-500 bg-red-500/10 border-red-500/30" },
}

export function ManagerOrders() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [isAssigning, setIsAssigning] = useState(false)
  const [connectionError, setConnectionError] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchStaff()
  }, [])

  const fetchOrders = async (retryCount = 0) => {
    try {
      setLoading(true)
      
      // Try admin_orders view first, fallback to direct orders query
      let queryResult
      try {
        console.log('Trying admin_orders view...')
        queryResult = await supabase
          .from('admin_orders')
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
            staff_id,
            staff_name,
            staff_email,
            staff_role
          `)
          .order('created_at', { ascending: false })
      } catch (viewError) {
        console.log('Admin orders view failed, trying direct query...')
        queryResult = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            total_amount,
            status,
            created_at,
            staff_id
          `)
          .order('created_at', { ascending: false })
      }

      const { data, error } = queryResult

      console.log('Supabase query result:', { data, error })

      if (error) {
        console.error('Supabase error fetching orders:', error)
        
        // Retry logic for network errors
        if (error.message?.includes('Failed to fetch') && retryCount < 2) {
          console.log(`Retrying fetch (attempt ${retryCount + 1})`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return fetchOrders(retryCount + 1)
        }
        
        throw error
      }
      
      // Transform the data to include staff information in the expected format
      const transformedData = (data || []).map((order: any) => {
        // Handle both admin_orders view and direct orders query
        const baseOrder: any = {
          ...order,
          staff: order.staff_id ? {
            id: order.staff_id,
            full_name: order.staff_name || 'Unknown Staff',
            email: order.staff_email || 'unknown@example.com',
            role: order.staff_role || 'staff'
          } : null
        }
        
        // Add missing customer fields if using direct query
        if (!baseOrder.customer_name) {
          baseOrder.customer_name = 'Unknown Customer'
          baseOrder.customer_email = 'unknown@example.com'
          baseOrder.customer_phone = ''
          baseOrder.address = ''
          baseOrder.city = ''
          baseOrder.state = ''
          baseOrder.zip_code = ''
          baseOrder.country = ''
        }
        
        return baseOrder
      })
      
      // Fetch order items with product names for each order
      const ordersWithItems = await Promise.all(
        transformedData.map(async (order) => {
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
      
      setOrders(ordersWithItems)
    } catch (error) {
      console.error('Error fetching orders:', error)
      
      const errorMessage = (error as any).message || 'Unknown error'
      if (errorMessage.includes('Failed to fetch')) {
        toast.error('Network error. Please check your connection and refresh.')
        setConnectionError(true)
      } else {
        toast.error('Failed to load orders: ' + errorMessage)
      }
      
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select(`
          id,
          username,
          email,
          full_name,
          role,
          is_active
        `)
        .eq('is_active', true)
        .eq('role', 'staff')
        .order('full_name')

      if (error) throw error
      setStaff(data || [])
    } catch (error) {
      console.error('Error fetching staff:', error)
      toast.error('Failed to load staff members')
    }
  }

  const handleOpenAssign = (order: Order) => {
    setSelectedOrder(order)
    setSelectedStaffId(order.staff_id?.toString() || "")
    setIsAssignDialogOpen(true)
  }

  const handleOpenView = (order: Order) => {
    router.push(`/manager-orders/${order.id}`)
  }

  const handleAssignOrder = async () => {
    if (!selectedOrder) return

    try {
      setIsAssigning(true)
      
      // Ensure staff_id is never undefined - convert to null if empty/undefined
      const staffId = selectedStaffId && selectedStaffId !== '' ? parseInt(selectedStaffId) : null
      
      const updateData = {
        staff_id: staffId
      }

      console.log('Assigning order with data:', updateData)

      const response = await fetch(`/api/orders/${selectedOrder.id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign order')
      }

      toast.success(result.message || 'Order assigned successfully!')
      setIsAssignDialogOpen(false)
      fetchOrders() // Refresh data
    } catch (error) {
      console.error('Error assigning order:', error)
      toast.error((error as Error).message || 'Failed to assign order')
    } finally {
      setIsAssigning(false)
    }
  }

  const getItemCount = (order: Order) => {
    return order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
        <span className="text-muted-foreground">Loading orders...</span>
      </div>
    )
  }

  return (
    <div>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">All Orders</CardTitle>
              <p className="text-sm text-muted-foreground">
                {orders.length} order{orders.length !== 1 ? 's' : ''} total
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setConnectionError(false)
                fetchOrders()
                fetchStaff()
              }}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
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
                    fetchOrders()
                  }}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found.</p>
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
                    <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Assigned To</th>
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
                        <td className="py-3 px-4 font-semibold text-foreground text-sm">${order.total_amount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-xs ${config.color}`}>
                            {config.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {order.staff ? (
                            <div>
                              <div className="text-foreground font-medium text-sm">{order.staff.full_name}</div>
                              <div className="text-muted-foreground text-xs">{order.staff.role}</div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Unassigned
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenView(order)}>
                              <Eye className="w-4 h-4" />
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
      
      {/* Dialog for assigning order to staff */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Assign Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="staff">Assign to Staff Member</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.full_name} ({member.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedOrder && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <p><span className="font-medium">Order:</span> {selectedOrder.order_number}</p>
                  <p><span className="font-medium">Customer:</span> {selectedOrder.customer_name}</p>
                  <p><span className="font-medium">Total:</span> ${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAssignOrder}
                disabled={isAssigning}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isAssigning ? 'Assigning...' : 'Assign Order'}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsAssignDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

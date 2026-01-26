"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package, User, FileText, Calendar } from "lucide-react"
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

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const orderId = params.orderId as string
  
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      
      // Get current staff member from localStorage
      const staffUser = localStorage.getItem('staffUser')
      
      if (!staffUser) {
        toast.error('Please log in again')
        router.push('/staff-login')
        return
      }
      
      const staff = JSON.parse(staffUser)
      
      // Fetch order details assigned to this staff member
      const { data, error } = await supabase
        .from('staff_orders_view')
        .select(`
          id,
          order_number,
          staff_id,
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
        .eq('id', orderId)
        // .eq('staff_id', staff.id)  // Temporarily commented to debug
        .single()

      console.log('Order details query result:', { data, error })
      console.log('Full order data:', JSON.stringify(data, null, 2))

      if (error) {
        console.error('Query error:', error)
        throw error
      }

      // Check if order is assigned to this staff member
      if (data && data.staff_id !== staff.id) {
        toast.error('Order not assigned to you')
        router.push('/staff-dashboard')
        return
      }

      if (data) {
        // Fetch order items with product names
        try {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select(`
              quantity,
              price,
              product_id
            `)
            .eq('order_id', orderId)
          
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
          
          setOrder({
            ...data,
            order_items: transformedItems
          })
        } catch (itemError) {
          console.warn('Failed to fetch order items for order:', data.id, itemError)
          setOrder({
            ...data,
            order_items: []
          })
        }
      } else {
        toast.error('Order not found')
        router.push('/staff-dashboard')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to load order details')
      router.push('/staff-dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getItemCount = (order: Order) => {
    return order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
        <span className="text-muted-foreground">Loading order details...</span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist or isn't assigned to you.</p>
          <Button onClick={() => router.push('/staff-dashboard')}>
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center flex-wrap justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/staff-dashboard')}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Details</h1>
            <p className="text-muted-foreground">Order #{order.order_number}</p>
          </div>
        </div>
        <Badge variant="outline" className={`text-sm px-3 py-1 ${statusConfig[order.status].color}`}>
          {statusConfig[order.status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</label>
                    <p className="mt-1 text-sm font-medium">{order.customer_name || 'Unknown Customer'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email Address</label>
                    <p className="mt-1 text-sm font-medium">{order.customer_email || 'No email provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                    <p className="mt-1 text-sm font-medium">{order.customer_phone || 'No phone provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Address</label>
                    <p className="mt-1 text-sm font-medium">
                      {order.address ? order.address : 'No address provided'}
                      {order.city && `, ${order.city}`}
                      {order.state && `, ${order.state}`}
                      {order.zip_code && ` ${order.zip_code}`}
                      {order.country && `, ${order.country}`}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Date</label>
                    <p className="mt-1 text-sm font-medium">{new Date(order.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Order Time</label>
                    <p className="mt-1 text-sm font-medium">{new Date(order.created_at).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                Order Items ({order.order_items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {order.order_items && order.order_items.length > 0 ? (
                <div className="border border-border rounded-lg overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">#</th>
                          <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Product</th>
                          <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Quantity</th>
                          <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">Unit Price</th>
                          <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm">Item Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.order_items.map((item, index) => (
                          <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">{index + 1}</td>
                            <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium">{item.product_name}</td>
                            <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium">{item.quantity}</td>
                            <td className="p-3 sm:p-4 text-xs sm:text-sm font-medium">DH {item.price.toFixed(2)}</td>
                            <td className="p-3 sm:p-4 text-xs sm:text-sm text-right font-semibold">DH{(item.quantity * item.price).toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr className="bg-muted/50 font-semibold">
                          <td colSpan={4} className="p-3 sm:p-4 text-xs sm:text-sm">Total</td>
                          <td className="p-3 sm:p-4 text-xs sm:text-sm text-right">DH {order.total_amount.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3 p-4">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="border border-border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h4 className="text-sm font-medium text-foreground truncate max-w-[200px]">
                              {item.product_name}
                            </h4>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Qty:</span>
                            <span className="ml-1 font-medium">{item.quantity}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <span className="ml-1 font-medium">DH {item.price.toFixed(2)}</span>
                          </div>
                          <div className="col-span-2 pt-2 border-t border-border">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Item Total:</span>
                              <span className="font-semibold text-sm text-foreground">
                                DH {(item.quantity * item.price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Total Summary */}
                    <div className="border border-border rounded-lg p-3 bg-muted/50 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-foreground">Order Total:</span>
                        <span className="text-base font-bold text-foreground">
                          DH {order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 border border-border border-dashed rounded-lg">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No items found for this order</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Order Summary Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-600" />
                </div>
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">DH {order.total_amount.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Total Amount</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-lg font-bold">{order.order_items?.length || 0}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Items</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-lg font-bold">{getItemCount(order)}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Quantity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/staff-dashboard')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

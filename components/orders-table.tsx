"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

interface Profile {
  id: string
  email: string
  full_name?: string
  username?: string
  avatar_url?: string
  website?: string
  bio?: string
  phone?: string
  address?: any
  preferences?: any
  created_at: string
  updated_at: string
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
  profile?: Profile
  profiles?: Profile
}


const statusConfig = {
  pending: {
    label: "Pending",
    variant: "outline" as const,
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30",
  },
  processing: {
    label: "Processing",
    variant: "outline" as const,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  shipped: {
    label: "Shipped",
    variant: "outline" as const,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
  },
  delivered: {
    label: "Delivered",
    variant: "outline" as const,
    color: "text-green-500 bg-green-500/10 border-green-500/30",
  },
  cancelled: { 
    label: "Cancelled", 
    variant: "outline" as const, 
    color: "text-red-500 bg-red-500/10 border-red-500/30" 
  },
}

interface OrdersTableProps {
  searchTerm: string
  statusFilter: string
}

export function OrdersTable({ searchTerm, statusFilter }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const ordersPerPage = 10

  useEffect(() => {
    fetchOrders()
  }, [currentPage, searchTerm, statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const from = (currentPage - 1) * ordersPerPage
      const to = from + ordersPerPage - 1
      
      const { data, error, count } = await supabase
        .from('admin_orders')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      console.log('Admin orders view result:', { data, error, count })

      if (error) throw error

      // Transform the data to match our Order interface
      const transformedData = data?.map(order => ({
        ...order,
        profile: {
          id: order.user_id,
          email: order.customer_email,
          full_name: order.customer_name,
          phone: order.customer_phone || ''
        }
      })) || []

      setOrders(transformedData)
      setTotalOrders(count || 0)
      setTotalPages(Math.ceil((count || 0) / ordersPerPage))
    } catch (error) {
      console.error('Error fetching orders:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      console.error('Error type:', typeof error)
      
      let errorMessage = 'Failed to fetch orders'
      if (error instanceof Error) {
        errorMessage = `Failed to fetch orders: ${error.message}`
      } else if (error && typeof error === 'object') {
        errorMessage = `Failed to fetch orders: ${JSON.stringify(error)}`
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Filter orders
  const filtered = orders.filter((order) => {
    const profileData = order.profile || order.profiles
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profileData?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profileData?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profileData?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
            <span className="text-muted-foreground">Loading orders...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading orders</div>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button 
              onClick={fetchOrders} 
              className="mt-4"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm">Order ID</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm">Customer</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm hidden sm:table-cell">Total</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm">Status</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm hidden md:table-cell">Payment</th>
                <th className="text-left py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm hidden lg:table-cell">Date</th>
                <th className="text-right py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const config = statusConfig[order.status]
                  
                  // Debug: log the order structure to see what we're working with
                  console.log('Order structure:', order)
                  
                  // Handle different possible profile field names
                  const profileData = order.profile || order.profiles
                  
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3 sm:py-4 sm:px-6 font-mono font-medium text-foreground text-xs sm:text-sm">{order.order_number}</td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <div>
                          <div className="text-foreground font-medium text-xs sm:text-sm">
                            {profileData?.full_name || profileData?.username || profileData?.email || 'Unknown Customer'}
                          </div>
                          {profileData?.email && (
                            <div className="text-muted-foreground text-xs hidden sm:block">{profileData.email}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 font-semibold text-foreground text-xs sm:text-sm hidden sm:table-cell">DH {order.total_amount.toFixed(2)}</td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <Badge variant={config.variant} className={config.color}>
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 hidden md:table-cell">
                        <Badge 
                          variant={order.payment_status === 'paid' ? 'default' : 'outline'}
                          className={order.payment_status === 'paid' 
                            ? 'text-green-500 bg-green-500/10 border-green-500/30' 
                            : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
                          }
                        >
                          {order.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6 text-muted-foreground text-xs sm:text-sm hidden lg:table-cell">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 sm:py-4 sm:px-6">
                        <div className="flex items-center justify-end">
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="gap-2 h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-4 border-t border-border">
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="gap-1 sm:gap-2 h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-7 h-7 sm:w-8 sm:h-8 p-0 text-xs"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="gap-1 sm:gap-2 h-8 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

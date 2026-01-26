"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"

interface OrderStatusData {
  name: string
  value: number
}

export function OrdersChart() {
  const [data, setData] = useState<OrderStatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"]

  useEffect(() => {
    fetchOrderStatusData()
  }, [])

  const fetchOrderStatusData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get order status counts from orders table
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('status')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching order status data:', error)
        setError(error.message)
        return
      }

      // Group orders by status and count them
      const statusCounts = ordersData?.reduce((acc: { [key: string]: number }, order) => {
        const status = order.status || 'unknown'
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {}) || {}

      // Transform to chart format with proper labels
      const chartData: OrderStatusData[] = [
        { name: 'Pending', value: statusCounts.pending || 0 },
        { name: 'Processing', value: statusCounts.processing || 0 },
        { name: 'Confirmed', value: statusCounts.confirmed || 0 },
        { name: 'Shipped', value: statusCounts.shipped || 0 },
        { name: 'Delivered', value: statusCounts.delivered || 0 },
        { name: 'Cancelled', value: statusCounts.cancelled || 0 },
        { name: 'Refunded', value: statusCounts.refunded || 0 }
      ].filter(item => item.value > 0) // Only show statuses with orders

      setData(chartData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order status data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span className="text-muted-foreground">Loading order status data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="text-red-600 mb-2">Error loading order status data</div>
              <div className="text-sm text-muted-foreground mb-4">{error}</div>
              <button 
                onClick={fetchOrderStatusData}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No orders found
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Orders by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                color: "#1f2937",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "14px"
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

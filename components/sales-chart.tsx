"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"

interface SalesData {
  date: string
  sales: number
  revenue: number
}

export function SalesChart() {
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSalesData()
  }, [])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get last 30 days of data
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          created_at,
          total_amount,
          status
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching sales data:', error)
        setError(error.message)
        return
      }

      // Group orders by day and calculate sales/revenue
      const dailyData = ordersData?.reduce((acc: { [key: string]: SalesData }, order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        
        if (!acc[date]) {
          acc[date] = {
            date,
            sales: 0,
            revenue: 0
          }
        }

        // Count orders with meaningful statuses (not cancelled/refunded)
        if (order.status !== 'cancelled' && order.status !== 'refunded') {
          acc[date].sales += 1
          acc[date].revenue += order.total_amount || 0
        }

        return acc
      }, {}) || {}

      // Generate all dates for the last 30 days
      const dates = []
      const today = new Date()
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        dates.push(dailyData[dateStr] || { date: dateStr, sales: 0, revenue: 0 })
      }
      
      const data = dates

      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span className="text-muted-foreground">Loading sales data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Sales Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="text-center">
              <div className="text-red-600 mb-2">Error loading sales data</div>
              <div className="text-sm text-muted-foreground mb-4">{error}</div>
              <button 
                onClick={fetchSalesData}
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

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Sales Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              stroke="var(--color-muted-foreground)" 
              style={{ fontSize: "12px" }}
              dataKey="date"
            />
            <YAxis 
              stroke="var(--color-muted-foreground)" 
              style={{ fontSize: "12px" }} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                color: "#1f2937",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                fontSize: "14px"
              }}
              formatter={(value: any, name: any) => {
                if (name === 'Revenue') {
                  return [`DH${value.toLocaleString()}`]
                }
                return [`${value} units`]
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-chart-1)"
              strokeWidth={2}
              dot={{ fill: "var(--color-chart-1)", strokeWidth: 2, r: 4 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="var(--color-chart-2)"
              strokeWidth={2}
              dot={{ fill: "var(--color-chart-2)", strokeWidth: 2, r: 4 }}
              name="Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

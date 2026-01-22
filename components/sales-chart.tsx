"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { supabase } from "@/lib/supabase"

interface SalesData {
  month: string
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

      // Get sales data from orders table
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          created_at,
          total_amount,
          status
        `)
        .gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString()) // Start from current year
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching sales data:', error)
        setError(error.message)
        return
      }

      // Group orders by month and calculate sales/revenue
      const monthlyData = ordersData?.reduce((acc: { [key: string]: SalesData }, order) => {
        const month = new Date(order.created_at).toLocaleString('default', { month: 'short' })
        
        if (!acc[month]) {
          acc[month] = {
            month,
            sales: 0,
            revenue: 0
          }
        }

        // Only count completed/paid orders
        if (order.status === 'delivered' || order.status === 'shipped') {
          acc[month].sales += 1
          acc[month].revenue += order.total_amount
        }

        return acc
      }, {}) || {}

      // Convert to array and fill missing months with zeros
      const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const data = allMonths.map(month => 
        monthlyData[month] || { month, sales: 0, revenue: 0 }
      )

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
            />
            <YAxis 
              stroke="var(--color-muted-foreground)" 
              style={{ fontSize: "12px" }} 
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: any, name: any) => {
                if (name === 'Revenue') {
                  return [`$${value.toLocaleString()}`]
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

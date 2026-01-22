"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StatsCard } from "@/components/stats-card"
import { SalesChart } from "@/components/sales-chart"
import { OrdersChart } from "@/components/orders-chart"
import { LowStockProducts } from "@/components/low-stock-products"
import { ShoppingCart, TrendingUp, Package, Users, Clock, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalCustomers: number
  ordersToday: number
  lowStockCount: number
  ordersChange: number
  revenueChange: number
  productsChange: number
  customersChange: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    ordersToday: 0,
    lowStockCount: 0,
    ordersChange: 0,
    revenueChange: 0,
    productsChange: 0,
    customersChange: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to format values
  const formatValue = (value: number | string): string => {
    return typeof value === 'number' ? value.toString() : value
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [
        ordersResult,
        productsResult,
        customersResult,
        todayOrdersResult
      ] = await Promise.all([
        // Get total orders and revenue
        supabase
          .from('orders')
          .select('total_amount')
          .eq('status', 'delivered'),
        
        // Get total products
        supabase
          .from('products')
          .select('id'),
        
        // Get total customers
        supabase
          .from('customers')
          .select('id'),
        
        // Get today's orders
        supabase
          .from('orders')
          .select('id')
          .gte('created_at', new Date().toISOString().split('T')[0])
      ])

      // Get low stock products
      const lowStockResult = await supabase
        .from('products')
        .select('id')
        .eq('in_stock', true)
        .limit(20) // Get first 20 products for low stock simulation

      if (ordersResult.error || productsResult.error || customersResult.error || todayOrdersResult.error || lowStockResult.error) {
        throw new Error('Failed to fetch dashboard data')
      }

      const totalOrders = ordersResult.data?.length || 0
      const totalRevenue = ordersResult.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const totalProducts = productsResult.data?.length || 0
      const totalCustomers = customersResult.data?.length || 0
      const ordersToday = todayOrdersResult.data?.length || 0
      const lowStockCount = lowStockResult.data?.length || 0

      // Simulate some changes (in real app, you'd compare with previous period)
      const ordersChange = Math.floor(Math.random() * 20) - 10 // -10 to +10
      const revenueChange = Math.floor(Math.random() * 15) - 5 // -5% to +10%
      const productsChange = Math.floor(Math.random() * 10) - 5 // -5% to +5%
      const customersChange = Math.floor(Math.random() * 25) - 10 // -10% to +15%

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts,
        totalCustomers,
        ordersToday,
        lowStockCount,
        ordersChange,
        revenueChange,
        productsChange,
        customersChange
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
            <span className="text-muted-foreground">Loading dashboard data...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-600 mb-2">Error loading dashboard</div>
              <div className="text-sm text-muted-foreground mb-4">{error}</div>
              <button 
                onClick={fetchDashboardStats}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your store overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Orders"
            value={formatValue(stats.totalOrders)}
            change={`${stats.ordersChange >= 0 ? '+' : ''}${stats.ordersChange}`}
            icon={<ShoppingCart className="w-5 h-5" />}
            trend={stats.ordersChange >= 0 ? "up" : "down"}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change={`${stats.revenueChange >= 0 ? '+' : ''}${stats.revenueChange}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            trend={stats.revenueChange >= 0 ? "up" : "down"}
          />
          <StatsCard
            title="Total Products"
            value={formatValue(stats.totalProducts)}
            change={`${stats.productsChange >= 0 ? '+' : ''}${stats.productsChange}%`}
            icon={<Package className="w-5 h-5" />}
            trend={stats.productsChange >= 0 ? "up" : "down"}
          />
          <StatsCard
            title="Total Customers"
            value={formatValue(stats.totalCustomers)}
            change={`${stats.customersChange >= 0 ? '+' : ''}${stats.customersChange}%`}
            icon={<Users className="w-5 h-5" />}
            trend={stats.customersChange >= 0 ? "up" : "down"}
          />
          <StatsCard
            title="Orders Today"
            value={formatValue(stats.ordersToday)}
            change={`${Math.floor(Math.random() * 20) - 10 >= 0 ? '+' : ''}${Math.floor(Math.random() * 20) - 10}`}
            icon={<Clock className="w-5 h-5" />}
            trend="up"
          />
          <StatsCard
            title="Low Stock Items"
            value={formatValue(stats.lowStockCount)}
            change="Requires action"
            icon={<AlertCircle className="w-5 h-5" />}
            trend="down"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>
          <div>
            <OrdersChart />
          </div>
        </div>

        {/* Low Stock Products */}
        <LowStockProducts />
      </div>
    </DashboardLayout>
  )
}

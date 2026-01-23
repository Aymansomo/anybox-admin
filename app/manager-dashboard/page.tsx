"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Users, Clock, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ManagerStats {
  totalOrders: number
  pendingOrders: number
  assignedOrders: number
  completedOrders: number
  totalStaff: number
  activeStaff: number
  unassignedOrders: number
}

export default function ManagerDashboardPage() {
  const [stats, setStats] = useState<ManagerStats>({
    totalOrders: 0,
    pendingOrders: 0,
    assignedOrders: 0,
    completedOrders: 0,
    totalStaff: 0,
    activeStaff: 0,
    unassignedOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchManagerStats()
  }, [])

  const fetchManagerStats = async () => {
    try {
      // Fetch orders stats
      const { data: orders, error: ordersError } = await supabase
        .from('admin_orders')
        .select('status, staff_id')

      if (ordersError) {
        console.error('Error fetching orders stats:', ordersError)
        return
      }

      // Fetch staff stats
      const { data: staff, error: staffError } = await supabase
        .from('staff')
        .select('is_active')

      if (staffError) {
        console.error('Error fetching staff stats:', staffError)
        return
      }

      // Calculate statistics
      const statsData = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(order => order.status === 'pending').length || 0,
        assignedOrders: orders?.filter(order => order.staff_id !== null).length || 0,
        completedOrders: orders?.filter(order => order.status === 'delivered').length || 0,
        totalStaff: staff?.length || 0,
        activeStaff: staff?.filter(member => member.is_active).length || 0,
        unassignedOrders: orders?.filter(order => order.staff_id === null).length || 0
      }

      setStats(statsData)
    } catch (error) {
      console.error('Error fetching manager stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout isAdmin={false} isManager={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of orders and staff performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.totalOrders
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Pending Orders</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.pendingOrders
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Assigned Orders</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.assignedOrders
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Completed</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.completedOrders
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Total Staff</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.totalStaff
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Active Staff</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.activeStaff
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Unassigned Orders</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.unassignedOrders
                    )}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/manager-orders">
                  <Button className="w-full justify-start" variant="outline">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Manage Orders
                  </Button>
                </Link>
                <Link href="/staff">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Staff
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">New orders today</span>
                  <span className="font-medium text-foreground">{stats.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Orders completed</span>
                  <span className="font-medium text-foreground">{stats.completedOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Staff on duty</span>
                  <span className="font-medium text-foreground">{stats.activeStaff}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

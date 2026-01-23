"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StaffOrders } from "@/components/staff-orders"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Clock, CheckCircle2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface StaffStats {
  assignedOrders: number
  pendingReview: number
  completed: number
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<StaffStats>({
    assignedOrders: 0,
    pendingReview: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStaffStats()
  }, [])

  const fetchStaffStats = async () => {
    try {
      // Get current staff member from localStorage
      const staffUser = localStorage.getItem('staffUser')
      
      if (!staffUser) {
        console.error('No staff user found in localStorage')
        return
      }
      
      const staff = JSON.parse(staffUser)
      console.log('Fetching stats for staff ID:', staff.id)

      // Fetch all orders assigned to this staff member
      const { data: orders, error } = await supabase
        .from('staff_orders_view')
        .select('status')
        .eq('staff_id', staff.id)

      if (error) {
        console.error('Error fetching staff stats:', error)
        return
      }

      console.log('Staff orders for stats:', orders)

      // Calculate statistics
      const statsData = {
        assignedOrders: orders?.length || 0,
        pendingReview: orders?.filter(order => order.status === 'pending' || order.status === 'processing').length || 0,
        completed: orders?.filter(order => order.status === 'delivered').length || 0
      }

      console.log('Calculated stats:', statsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching staff stats:', error)
    } finally {
      setLoading(false)
    }
  }
  return (
    <DashboardLayout isAdmin={false}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your assigned orders and complete tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  <p className="text-sm text-muted-foreground font-medium">Pending Review</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.pendingReview
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
                  <p className="text-sm text-muted-foreground font-medium">Completed</p>
                  <div className="text-2xl font-bold text-foreground mt-2">
                    {loading ? (
                      <div className="w-8 h-8 bg-muted animate-pulse rounded"></div>
                    ) : (
                      stats.completed
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

        {/* Staff Orders */}
        <StaffOrders />
      </div>
    </DashboardLayout>
  )
}

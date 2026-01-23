"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StaffOrders } from "@/components/staff-orders"

export default function StaffOrdersPage() {
  return (
    <DashboardLayout isAdmin={false}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage orders assigned to you</p>
        </div>

        {/* Staff Orders Component */}
        <StaffOrders />
      </div>
    </DashboardLayout>
  )
}

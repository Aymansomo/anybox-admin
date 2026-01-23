"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ManagerOrders } from "@/components/manager-orders"

export default function ManagerOrdersPage() {
  return (
    <DashboardLayout isAdmin={false} isManager={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manager Orders</h1>
          <p className="text-muted-foreground mt-1">View all orders and assign them to staff members</p>
        </div>

        {/* Manager Orders Component */}
        <ManagerOrders />
      </div>
    </DashboardLayout>
  )
}

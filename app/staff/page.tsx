"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StaffTable } from "@/components/staff-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function StaffPage() {
  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
            <p className="text-muted-foreground mt-1">Manage team members and their roles</p>
          </div>
          <Button
            onClick={() => {
              // Trigger the add staff dialog in StaffTable component
              const event = new CustomEvent('openStaffDialog')
              window.dispatchEvent(event)
            }}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </Button>
        </div>

        {/* Staff Table */}
        <StaffTable />
      </div>
    </DashboardLayout>
  )
}

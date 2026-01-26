"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OrderDetails } from "@/components/order-details"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function OrderDetailsPage() {
  const params = useParams()
  const orderId = params.id as string

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center flex-wrap gap-4">
          <Link href="/orders">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Orders
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Order {orderId}</h1>
            <p className="text-muted-foreground mt-1">View and manage order details</p>
          </div>
        </div>

        {/* Order Details */}
        <OrderDetails orderId={orderId} />
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { OrderDetails } from "@/components/order-details"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function ManagerOrderDetailsPage() {
  const params = useParams()
  const [orderId, setOrderId] = useState<string>("")

  useEffect(() => {
    console.log('Params object:', params)
    console.log('Params keys:', Object.keys(params))
    
    // Try different ways to extract the orderId
    let extractedId = ""
    
    // Method 1: Direct access
    if (params.id) {
      extractedId = Array.isArray(params.id) ? params.id[0] : params.id
    }
    
    // Method 2: Check all possible param names
    if (!extractedId) {
      const possibleKeys = ['orderId', 'id', 'order_id']
      for (const key of possibleKeys) {
        if (params[key]) {
          extractedId = Array.isArray(params[key]) ? params[key][0] : params[key]
          break
        }
      }
    }
    
    // Method 3: Get first value from params object
    if (!extractedId && Object.keys(params).length > 0) {
      const firstKey = Object.keys(params)[0]
      extractedId = Array.isArray(params[firstKey]) ? params[firstKey][0] : params[firstKey]
    }
    
    console.log('Extracted orderId:', extractedId)
    setOrderId(extractedId || "")
  }, [params])

  if (!orderId) {
    return (
      <DashboardLayout isAdmin={false} isManager={true}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-foreground mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">The order ID could not be determined from the URL.</p>
            <p className="text-muted-foreground text-sm mb-4">URL params: {JSON.stringify(params)}</p>
            <Link href="/manager-orders">
              <Button>Back to Orders</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isAdmin={false} isManager={true}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/manager-orders">
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

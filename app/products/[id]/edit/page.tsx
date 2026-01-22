"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductForm } from "@/components/product-form"
import { useParams } from "next/navigation"

export default function EditProductPage() {
  const params = useParams()
  const productId = params.id as string

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground mt-1">Update product details and inventory</p>
        </div>

        <ProductForm productId={productId} />
      </div>
    </DashboardLayout>
  )
}

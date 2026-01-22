"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductForm } from "@/components/product-form"

export default function NewProductPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
          <p className="text-muted-foreground mt-1">Create a new product in your store</p>
        </div>

        <ProductForm />
      </div>
    </DashboardLayout>
  )
}

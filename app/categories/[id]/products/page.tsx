"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProductsTable } from "@/components/products-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function CategoryProductsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()

  useEffect(() => {
    fetchCategory()
  }, [params.id])

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${params.id}`)
      if (!response.ok) {
        console.error('Error fetching category:', response.statusText)
        return
      }

      const result = await response.json()
      setCategory(result.category)
    } catch (error) {
      console.error('Error fetching category:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
          <span className="text-muted-foreground">Loading category...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (!category) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold mb-2">Category Not Found</h2>
          <p className="text-muted-foreground mb-4">The category you're looking for doesn't exist.</p>
          <Link href="/categories">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center flex-wrap justify-between">
          <div className="flex items-center gap-4">
            <Link href="/categories">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{category.name}</h1>
              <p className="text-muted-foreground mt-1">
                Products in this category
              </p>
            </div>
          </div>
          <Link href="/products/new">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Add Product
            </Button>
          </Link>
        </div>

        {/* Category Info */}
        {category.description && (
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products in this category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products Table */}
        <ProductsTable 
          searchTerm={searchTerm} 
          sortBy={sortBy} 
          categoryId={params.id as string}
        />
      </div>
    </DashboardLayout>
  )
}

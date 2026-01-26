"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface LowStockProduct {
  id: string
  name: string
  sku: string
  stock: number
  category: string
}

export function LowStockProducts() {
  const [products, setProducts] = useState<LowStockProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          stock,
          category_id,
          subcategory,
          in_stock,
          categories:category_id (
            name
          )
        `)
        .eq('in_stock', true)
        .lt('stock', 10) // Only get products with less than 10 units
        .order('stock', { ascending: true }) // Show lowest stock first
        .limit(20) // Limit to 20 items

      if (error) {
        console.error('Error fetching low stock products:', error)
        setError(error.message)
        return
      }

      // Transform data for display
      const lowStockProducts: LowStockProduct[] = data.map((product: any) => ({
        id: product.id,
        name: product.name,
        sku: `SKU-${product.id.toUpperCase()}`, // Generate SKU from ID
        stock: product.stock || 0, // Use real stock from database
        category: product.categories?.name || 'Unknown'
      }))

      setProducts(lowStockProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch low stock products')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Low Stock Products</CardTitle>
          <AlertCircle className="w-5 h-5 text-destructive animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
            <span className="text-muted-foreground">Loading low stock products...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Low Stock Products</CardTitle>
          <AlertCircle className="w-5 h-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">Error loading low stock products</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <button 
              onClick={fetchLowStockProducts}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Low Stock Products</CardTitle>
        <AlertCircle className="w-5 h-5 text-destructive" />
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No products with low stock found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">SKU</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Category</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{product.sku}</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant="outline" 
                        className={
                          product.stock <= 3 
                            ? "bg-destructive/10 text-destructive border-destructive/30" 
                            : product.stock <= 5 
                            ? "bg-orange-500/10 text-orange-500 border-orange-500/30"
                            : "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
                        }
                      >
                        {product.stock} units
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{product.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

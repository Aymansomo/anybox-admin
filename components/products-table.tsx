"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit2, Trash2, Eye, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: "active" | "inactive"
  image: string
  subcategory: string
  rating: number
  reviews: number
  in_stock: boolean
}

interface ProductsTableProps {
  searchTerm: string
  categoryFilter?: string
  sortBy: string
  categoryId?: string
}

export function ProductsTable({ searchTerm, categoryFilter, sortBy, categoryId }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [categoryId])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('products')
        .select(`
          *,
          categories:category_id (
            name
          )
        `)

      // Filter by categoryId if provided
      if (categoryId) {
        query = query.eq('category_id', categoryId)
      }

      const { data: productsData, error } = await query
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching products:', error)
        setError(error.message)
        return
      }

      // Transform data and auto-update stock status
      const transformedProducts: Product[] = await Promise.all(
        productsData.map(async (product: any) => {
          // Auto-update in_stock based on stock quantity
          const shouldBeInStock = (product.stock || 0) > 0
          if (product.in_stock !== shouldBeInStock) {
            // Update the product in database
            await supabase
              .from('products')
              .update({ in_stock: shouldBeInStock })
              .eq('id', product.id)
          }

          return {
            id: product.id,
            name: product.name,
            category: product.categories?.name || 'All',
            price: product.price,
            stock: product.stock || 0,
            status: shouldBeInStock ? "active" : "inactive",
            image: product.image || "/placeholder.svg",
            subcategory: product.subcategory,
            rating: product.rating,
            reviews: product.reviews,
            in_stock: shouldBeInStock
          }
        })
      )

      setProducts(transformedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Filter products
  let filtered = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === "all" || 
      product.category.toLowerCase() === categoryFilter.toLowerCase() ||
      product.subcategory.toLowerCase() === categoryFilter.toLowerCase()
    return matchesSearch && matchesCategory
  })

  // Sort products
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "stock-low":
        return a.stock - b.stock
      default:
        return a.name.localeCompare(b.name)
    }
  })

  const handleDelete = async (id: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting product:', error)
        // You could add a toast notification here
        return
      }

      setProducts(products.filter((p) => p.id !== id))
      // You could add a success toast notification here
    } catch (err) {
      console.error('Error deleting product:', err)
      // You could add an error toast notification here
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading products...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-red-600 mb-2">Error loading products</div>
            <div className="text-sm text-muted-foreground mb-4">{error}</div>
            <Button onClick={fetchProducts}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-4 px-6 font-semibold text-foreground">Product</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Category</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Price</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Stock</th>
                <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                <th className="text-right py-4 px-6 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-10 h-10 rounded bg-muted object-cover"
                        />
                        <span className="font-medium text-foreground">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground">{product.category}</td>
                    <td className="py-4 px-6 font-semibold text-foreground">${product.price.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <Badge
                        variant="outline"
                        className={
                          product.stock <= 10
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-green-500/10 text-green-500 border-green-500/30"
                        }
                      >
                        {product.stock} units
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={product.status === "active" ? "default" : "secondary"}>
                        {product.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Link href={`/products/${product.id}/edit`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-destructive" />
                                Delete Product
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <span className="font-semibold text-foreground">"{product.name}"</span>? 
                                This action cannot be undone and will permanently remove the product from your inventory.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(product.id, product.name)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Delete Product
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

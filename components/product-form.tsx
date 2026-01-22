"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ProductFormProps {
  productId?: string
}

interface CategoryOption {
  id: string
  name: string
}

export function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [formData, setFormData] = useState<{
    name: string
    category: string
    price: string
    stock: string
    description: string
    features: string[]
  }>({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    features: [], // Add features array
  })
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .trim()
  }

  // Handle main image
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle gallery images
  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setGalleryImages(files)
    
    // Create previews
    const previews: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result as string)
        if (previews.length === files.length) {
          setGalleryImagePreviews([...previews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // Handle features
  const addFeature = () => {
    setFormData((prev: any) => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      features: prev.features.filter((_: any, i: number) => i !== index)
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      features: prev.features.map((feature: any, i: number) => i === index ? value : feature)
    }))
  }

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev: File[]) => prev.filter((_: File, i: number) => i !== index))
    setGalleryImagePreviews((prev: string[]) => prev.filter((_: string, i: number) => i !== index))
  }

  const removeMainImage = () => {
    setMainImage(null)
    setMainImagePreview(null)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true })

        if (error) {
          console.error('Error fetching categories:', error)
          return
        }

        setCategories((data || []) as CategoryOption[])
      } catch (e) {
        console.error('Error fetching categories:', e)
      }
    }

    const fetchProduct = async () => {
      if (!productId) return

      try {
        const response = await fetch(`/api/products/${productId}`)
        if (!response.ok) {
          console.error('Error fetching product:', response.statusText)
          return
        }

        const result = await response.json()
        const product = result.product

        if (product) {
          // Find the "All" category ID if product is uncategorized
          let categoryId = product.category_id?.toString() || ""
          if (!categoryId && product.category === 'All') {
            // Look up the "All" category ID by name
            const { data: categories } = await supabase
              .from('categories')
              .select('id')
              .eq('name', 'All')
              .single()
            categoryId = categories?.id?.toString() || ""
          }

          setFormData({
            name: product.name || "",
            category: categoryId,
            price: product.price?.toString() || "",
            stock: product.stock?.toString() || "",
            description: product.description || "",
            features: product.features || [], // Handle features from database
          })
          
          // Set main image preview if product has one
          if (product.image) {
            setMainImagePreview(product.image)
          }
          
          // Set gallery images if product has them
          if (product.gallery_images && product.gallery_images.length > 0) {
            setGalleryImagePreviews(product.gallery_images)
          }
        }
      } catch (e) {
        console.error('Error fetching product:', e)
      }
    }

    fetchCategories()
    fetchProduct()
  }, [productId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let imageUrl = ""
      let galleryImageUrls: string[] = []

      const uploadImageViaApi = async (file: File) => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('bucket', 'uploads')
        fd.append('folder', 'products')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: fd,
        })

        const payload = await res.json()
        if (!res.ok) {
          throw new Error(payload?.error || 'Image upload failed')
        }

        return payload as { path: string; publicUrl: string }
      }

      // Upload main image if selected
      if (mainImage) {
        try {
          const { publicUrl } = await uploadImageViaApi(mainImage)
          imageUrl = publicUrl || ''
        } catch (uploadError) {
          throw new Error(`Main image upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown upload error'}`)
        }
      }

      // Upload gallery images if selected
      if (galleryImages.length > 0) {
        for (const imageFile of galleryImages) {
          try {
            const { publicUrl } = await uploadImageViaApi(imageFile)
            if (publicUrl) {
              galleryImageUrls.push(publicUrl)
            }
          } catch (uploadError) {
            console.error('Gallery image upload failed:', uploadError)
            // Continue with other images even if one fails
          }
        }
      }

      // Prepare product data
      let productData: any = {
        name: formData.name,
        slug: generateSlug(formData.name), // Auto-generate slug from name
        price: parseFloat(formData.price),
        subcategory: formData.category,
        description: formData.description,
        rating: 0,
        reviews: 0,
        in_stock: parseInt(formData.stock) > 0, // Auto-set based on stock
        stock: parseInt(formData.stock),
        features: formData.features, // Include features array
      }

      // Handle main image - only update if new image uploaded
      if (mainImage) {
        productData.image = imageUrl
      } else if (!productId) {
        // For new products, ensure image field exists even if empty
        productData.image = imageUrl || ""
      }

      // Handle gallery images - always include the array (may be empty)
      productData.gallery_images = galleryImageUrls

      // Handle category assignment
      if (formData.category && formData.category !== "0") {
        // Specific category selected
        productData.category_id = parseInt(formData.category)
      } else {
        // No category selected or "All" category - find the "All" category ID
        const { data: categories } = await supabase
          .from('categories')
          .select('id')
          .eq('name', 'All')
          .single()
        productData.category_id = categories?.id || null
      }

      let response
      if (productId) {
        // Update existing product
        response = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })
      } else {
        // Create new product
        productData.id = `product_${Date.now()}` // Generate unique ID only for new products
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${productId ? 'update' : 'create'} product`)
      }

      const result = await response.json()
      console.log(`Product ${productId ? 'updated' : 'created'} successfully:`, result)

      setIsLoading(false)
      router.push("/products")
      
    } catch (error) {
      console.error('Error saving product:', error)
      setIsLoading(false)
      alert(error instanceof Error ? error.message : 'Failed to save product')
    }
  }

  return (
    <div className="max-w-2xl">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter product name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {formData.name && (
                <div className="text-xs text-muted-foreground">
                  Slug: <span className="font-mono bg-muted px-2 py-1 rounded">{generateSlug(formData.name)}</span>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price and Stock Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter product description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Features Section */}
            <div className="space-y-2">
              <Label>Product Features</Label>
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Enter a feature (e.g., 'Warranty: 2 years')"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFeature}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="space-y-2">
              <Label>Main Product Image</Label>
              <div className="space-y-4">
                {mainImagePreview ? (
                  <div className="relative">
                    <img
                      src={mainImagePreview}
                      alt="Main product image"
                      className="w-full h-48 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={removeMainImage}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-destructive/90 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="main-image-upload"
                    className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload main image</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                  </label>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="hidden"
                  id="main-image-upload"
                />
              </div>
            </div>

            {/* Gallery Images Upload */}
            <div className="space-y-2">
              <Label>Product Gallery Images</Label>
              <div className="space-y-4">
                {galleryImagePreviews.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {galleryImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <label
                    htmlFor="gallery-images-upload"
                    className="block border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Drag and drop or click to upload gallery images</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB each</p>
                  </label>
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryImagesChange}
                  className="hidden"
                  id="gallery-images-upload"
                />
              </div>
            </div>

            {/* Auto Status Indicator */}
            <div className="space-y-2">
              <Label>Product Status</Label>
              <div className="p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${parseInt(formData.stock) > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {parseInt(formData.stock) > 0 ? 'In Stock (Active)' : 'Out of Stock (Inactive)'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Status is automatically determined by stock quantity
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : productId ? "Update Product" : "Create Product"}
              </Button>
              <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

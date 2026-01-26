"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Trash2, Image as ImageIcon, Eye, X, Upload } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface Category {
  id: number
  name: string
  slug?: string
  description: string | null
  image: string | null
  status: string
  created_at: string
  updated_at?: string
  product_count?: number
}

interface CategoriesTableProps {
  searchTerm: string
  sortBy: string
}

export function CategoriesTable({ searchTerm, sortBy }: CategoriesTableProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
    },
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products(count)
        `)
        .neq('name', 'All') // Exclude "All" category from display
        .order('created_at', { ascending: false })

      if (error) throw error

      const categoriesWithCount = data?.map(cat => ({
        ...cat,
        product_count: cat.products?.[0]?.count || 0
      })) || []

      setCategories(categoriesWithCount)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error("Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setImagePreview(category.image)
    setImageFile(null)
    form.reset({
      name: category.name,
      description: category.description || "",
      status: category.status as "active" | "inactive",
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      setImageFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `categories/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('category-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
      toast.error(`Failed to upload image: ${errorMessage}`)
      return null
    }
  }

  const handleDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id)

      if (error) throw error

      toast.success("Category deleted successfully")
      fetchCategories()
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error("Failed to delete category")
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    try {
      setUploading(true)
      
      let imageUrl = editingCategory?.image || null

      // Upload new image if provided
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
        if (!imageUrl) {
          toast.error("Failed to upload image")
          return
        }
      }

      const updateData = {
        name: data.name,
        description: data.description,
        status: data.status,
        image: imageUrl,
      }

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', editingCategory!.id)

      if (error) throw error

      toast.success("Category updated successfully")
      fetchCategories()
      setEditingCategory(null)
      setImageFile(null)
      setImagePreview(null)
      form.reset()
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error("Failed to update category")
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
          <span className="text-muted-foreground">Loading categories...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Categories ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">No categories found</div>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "Create your first category to get started"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="border rounded-lg hover:bg-muted/50 transition-all duration-200 overflow-hidden"
                >
                  <div className="p-4">
                    {/* Header with image and basic info */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
                          <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{category.name}</h3>
                        {category.description && (
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                            {category.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant={category.status === "active" ? "default" : "secondary"} className="text-xs">
                            {category.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {category.product_count} products
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Link href={`/categories/${category.id}/products`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="h-8 w-8 p-0 sm:h-8 sm:px-3 sm:w-auto"
                        >
                          <Pencil className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          className="h-8 w-8 p-0 sm:h-8 sm:px-3 sm:w-auto text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter category description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Image Upload Section */}
              <div>
                <FormLabel>Category Image</FormLabel>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a new image for this category (optional)
                </p>
                
                {!imagePreview ? (
                  <div className="relative">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                      <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3">
                        <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Drop your image here or click to browse</p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Category preview"
                      className="w-full h-40 object-contain rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingCategory(null)
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
            </p>
            {categoryToDelete && categoryToDelete.product_count! > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  Warning: This category has {categoryToDelete.product_count} products associated with it.
                  You may want to reassign these products before deleting.
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

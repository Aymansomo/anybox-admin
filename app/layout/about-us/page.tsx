"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, Plus, Save, CloudUpload } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { toastUtils, adminToasts } from "@/lib/toast-utils"

interface AboutUsItem {
  id: number
  title: string
  subtitle?: string
  description?: string
  mission?: string
  vision?: string
  image?: string
  image_position?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export default function AboutUsPage() {
  const [aboutUsItems, setAboutUsItems] = useState<AboutUsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<AboutUsItem | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const aboutUsSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    mission: z.string().optional(),
    vision: z.string().optional(),
    image: z.string().optional(),
    image_position: z.string().default('left'),
    order_index: z.number().min(0, "Order index is required"),
    is_active: z.boolean(),
  })

  type AboutUsFormData = z.infer<typeof aboutUsSchema>

  const form = useForm<AboutUsFormData>({
    resolver: zodResolver(aboutUsSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      mission: "",
      vision: "",
      image_position: "left",
      order_index: aboutUsItems.length,
      is_active: true,
    },
  })

  useEffect(() => {
    fetchAboutUsItems()
  }, [])

  const fetchAboutUsItems = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('about_banner')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setAboutUsItems(data && Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching about us items:', error)
      toastUtils.error("Failed to fetch about us items")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `about-us-${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from("about-images")
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from("about-images")
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toastUtils.error("Failed to upload image")
      return null
    }
  }

  const onSubmit = async (data: AboutUsFormData) => {
    try {
      let imageUrl = imagePreview

      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      const itemData = {
        ...data,
        image: imageUrl || null,
      }

      console.log('Saving item data:', itemData)

      if (editingItem) {
        const { error, data: result } = await supabase
          .from("about_banner")
          .update(itemData)
          .eq("id", editingItem.id)
          .select()

        console.log('Update result:', { error, result })
        if (error) {
          console.error('Update error details:', error)
          throw new Error(`Update failed: ${error.message || JSON.stringify(error)}`)
        }
        toastUtils.success("About Us item updated successfully")
      } else {
        const { error, data: result } = await supabase
          .from("about_banner")
          .insert(itemData)
          .select()

        console.log('Insert result:', { error, result })
        if (error) {
          console.error('Insert error details:', error)
          throw new Error(`Insert failed: ${error.message || JSON.stringify(error)}`)
        }
        toastUtils.success("About Us item created successfully")
      }

      setIsDialogOpen(false)
      setImageFile(null)
      setImagePreview("")
      setEditingItem(null)
      fetchAboutUsItems()
    } catch (error) {
      console.error("Error saving about us item:", error)
      console.error("Error type:", typeof error)
      console.error("Error message:", error instanceof Error ? error.message : 'No message')
      toastUtils.error(`Failed to save about us item: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const openEditDialog = (item: AboutUsItem) => {
    setEditingItem(item)
    form.reset({
      title: item.title,
      subtitle: item.subtitle || "",
      description: item.description || "",
      mission: item.mission || "",
      vision: item.vision || "",
      image_position: item.image_position || "left",
      order_index: item.order_index,
      is_active: item.is_active,
    })
    setImagePreview(item.image || "")
    setImageFile(null)
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingItem(null)
    form.reset({
      title: "",
      subtitle: "",
      description: "",
      mission: "",
      vision: "",
      image_position: "left",
      order_index: aboutUsItems.length,
      is_active: true,
    })
    setImagePreview("")
    setImageFile(null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this About Us item?')) {
      try {
        const { error } = await supabase
          .from("about_banner")
          .delete()
          .eq("id", id)

        if (error) {
          console.error('Delete error:', error)
          throw new Error(`Delete failed: ${error.message}`)
        }
        
        toastUtils.success("About Us item deleted successfully")
        fetchAboutUsItems()
      } catch (error) {
        console.error("Error deleting about us item:", error)
        toastUtils.error(`Failed to delete about us item: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
          <span className="text-muted-foreground">Loading About Us content...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground">About Us Management</h1>
            <p className="text-muted-foreground mt-1">Manage About Us content and sections</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add About Us Item
              </Button>
            </DialogTrigger>
            <DialogContent className="w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
                <DialogTitle>
                  {editingItem ? "Edit About Us Item" : "Create About Us Item"}
                </DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subtitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subtitle (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter subtitle" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter description" 
                                  className="min-h-[80px] resize-y"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mission"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mission (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter mission" 
                                  className="min-h-[80px] resize-y"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="vision"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vision (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter vision" 
                                  className="min-h-[80px] resize-y"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="order_index"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Index</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Enter order index" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-2">
                        <FormLabel>Image</FormLabel>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
                          {imagePreview ? (
                            <div className="space-y-3">
                              <div className="relative max-w-xs">
                                <img 
                                  src={imagePreview} 
                                  alt="Item preview" 
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2"
                                  onClick={() => {
                                    setImagePreview("")
                                    setImageFile(null)
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 mb-2">No image selected</p>
                              <Input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <FormLabel>Image Position</FormLabel>
                        <FormField
                          control={form.control}
                          name="image_position"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select image position" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="left">Left</SelectItem>
                                  <SelectItem value="right">Right</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded"
                            />
                          </FormControl>
                          <FormLabel>Active</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2 pt-4 sticky bottom-0 bg-background p-4 border-t">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        {editingItem ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{aboutUsItems.length}</div>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{aboutUsItems.filter(item => item.is_active).length}</div>
              <p className="text-sm text-muted-foreground">Active Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{aboutUsItems.filter(item => !item.is_active).length}</div>
              <p className="text-sm text-muted-foreground">Inactive Items</p>
            </CardContent>
          </Card>
        </div>

        {/* About Us Items Display */}
        <Card>
          <CardHeader>
            <CardTitle>About Us Items</CardTitle>
          </CardHeader>
          <CardContent>
            {aboutUsItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">No About Us items found</div>
                <p className="text-sm text-muted-foreground">
                  Create your first About Us item to get started
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {aboutUsItems.map((item, index) => (
                  <div key={`about-item-${item.id || index}`} className="border rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col gap-4">
                      {/* Header with title and actions */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                            <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                            <Badge variant={item.is_active ? "default" : "secondary"} className="w-fit">
                              {item.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(item)} className="h-8 w-8 p-0">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)} className="h-8 w-8 p-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Content section */}
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          {item.subtitle && (
                            <p className="text-base sm:text-lg text-muted-foreground mb-3">{item.subtitle}</p>
                          )}
                          
                          {item.description && (
                            <p className="text-muted-foreground mb-4 text-sm sm:text-base">{item.description}</p>
                          )}
                          
                          {item.mission && (
                            <div className="mb-3">
                              <h4 className="font-medium mb-1 text-sm sm:text-base">Mission:</h4>
                              <p className="text-muted-foreground text-sm">{item.mission}</p>
                            </div>
                          )}
                          
                          {item.vision && (
                            <div className="mb-3">
                              <h4 className="font-medium mb-1 text-sm sm:text-base">Vision:</h4>
                              <p className="text-muted-foreground text-sm">{item.vision}</p>
                            </div>
                          )}
                          
                          <div className="text-xs sm:text-sm text-muted-foreground">
                            Order: {item.order_index}
                          </div>
                        </div>
                        
                        {item.image && (
                          <div className="shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
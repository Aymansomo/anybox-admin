"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Trash2, Image as ImageIcon, Plus, Eye, ArrowLeft, ArrowRight, X, Upload, Filter, Grid, List } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

const layoutItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  section_type: z.enum(["hero_slider", "image_text", "banner", "featured"]),
  button_text: z.string().optional(),
  button_link: z.string().optional(),
  order_index: z.number().min(0),
  is_active: z.boolean(),
})

type LayoutItemFormData = z.infer<typeof layoutItemSchema>

interface LayoutItem {
  id: number
  title: string
  subtitle?: string
  description?: string
  image?: string
  section_type: string
  button_text?: string
  button_link?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export default function LayoutPage() {
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<LayoutItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<LayoutItem | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  const form = useForm<LayoutItemFormData>({
    resolver: zodResolver(layoutItemSchema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      section_type: "hero_slider",
      button_text: "",
      button_link: "",
      order_index: 0,
      is_active: true,
    },
  })

  useEffect(() => {
    fetchLayoutItems()
  }, [])

  const fetchLayoutItems = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('layout_items')
        .select('*')
        .order('order_index', { ascending: true })

      if (error) throw error

      setLayoutItems(data || [])
    } catch (error) {
      console.error('Error fetching layout items:', error)
      toast.error("Failed to fetch layout items")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file")
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      setImageFile(file)
      
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
      const filePath = `layout/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('layout-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('layout-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error'
      toast.error(`Failed to upload image: ${errorMessage}`)
      return null
    }
  }

  const handleEdit = (item: LayoutItem) => {
    setEditingItem(item)
    setImagePreview(item.image || null)
    setImageFile(null)
    form.reset({
      title: item.title,
      subtitle: item.subtitle || "",
      description: item.description || "",
      section_type: item.section_type as any,
      button_text: item.button_text || "",
      button_link: item.button_link || "",
      order_index: item.order_index || 0, // Ensure order_index has a value
      is_active: item.is_active,
    })
    setFormDialogOpen(true) // Open the dialog
  }

  const handleCancel = () => {
    setEditingItem(null)
    setImageFile(null)
    setImagePreview(null)
    form.reset()
    setFormDialogOpen(false) // Close the dialog
  }

  const handleCreate = () => {
    setEditingItem(null) // Set to null for create mode
    setImagePreview(null)
    setImageFile(null)
    form.reset({
      title: "",
      subtitle: "",
      description: "",
      section_type: "hero_slider",
      button_text: "",
      button_link: "",
      order_index: 0, // Ensure order_index is set
      is_active: true,
    })
    setFormDialogOpen(true) // Open the dialog
  }

  const handleDelete = (item: LayoutItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const { error } = await supabase
        .from('layout_items')
        .delete()
        .eq('id', itemToDelete.id)

      if (error) throw error

      toast.success("Layout item deleted successfully")
      fetchLayoutItems()
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    } catch (error) {
      console.error('Error deleting layout item:', error)
      toast.error("Failed to delete layout item")
    }
  }

  const onSubmit = async (data: LayoutItemFormData) => {
    try {
      setUploading(true)
      
      console.log('Raw form data submitted:', data)
      console.log('Editing item:', editingItem)
      console.log('Image file:', imageFile)
      
      // Force convert order_index to number
      const orderIndexValue = data.order_index !== undefined && data.order_index !== null 
        ? parseInt(String(data.order_index)) 
        : 0
      
      console.log('Parsed order_index:', orderIndexValue, 'from:', data.order_index)
      
      // Ensure all fields have proper values
      const cleanedData = {
        title: data.title || '',
        subtitle: data.subtitle || '',
        description: data.description || '',
        section_type: data.section_type || 'hero_slider',
        button_text: data.button_text || '',
        button_link: data.button_link || '',
        order_index: orderIndexValue,
        is_active: Boolean(data.is_active),
      }
      
      console.log('Cleaned form data:', cleanedData)
      
      let imageUrl = editingItem?.image || null

      if (imageFile) {
        console.log('Uploading image...')
        imageUrl = await uploadImage(imageFile)
        if (!imageUrl) {
          toast.error("Failed to upload image")
          return
        }
        console.log('Image uploaded successfully:', imageUrl)
      }

      const itemData = {
        title: cleanedData.title,
        subtitle: cleanedData.subtitle,
        description: cleanedData.description,
        image: imageUrl,
        section_type: cleanedData.section_type,
        button_text: cleanedData.button_text,
        button_link: cleanedData.button_link,
        order_index: cleanedData.order_index,
        is_active: cleanedData.is_active,
      }

      console.log('Final item data to save:', itemData)
      console.log('order_index type:', typeof itemData.order_index, 'value:', itemData.order_index)

      if (editingItem && editingItem.id) {
        console.log('Updating item with ID:', editingItem.id)
        const { error } = await supabase
          .from('layout_items')
          .update(itemData)
          .eq('id', editingItem.id)

        if (error) {
          console.error('Supabase update error:', error)
          throw error
        }
        toast.success("Layout item updated successfully")
      } else {
        console.log('Creating new item')
        const { error } = await supabase
          .from('layout_items')
          .insert(itemData)

        if (error) {
          console.error('Supabase insert error:', error)
          throw error
        }
        toast.success("Layout item created successfully")
      }

      fetchLayoutItems()
      setEditingItem(null)
      setImageFile(null)
      setImagePreview(null)
      form.reset()
      setFormDialogOpen(false) // Close the dialog
    } catch (error) {
      console.error('Error saving layout item:', error)
      console.error('Error type:', typeof error)
      console.error('Error keys:', Object.keys(error || {}))
      
      let errorMessage = 'Unknown error occurred'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error, null, 2)
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast.error(`Failed to save layout item: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const heroSlides = layoutItems.filter(item => item.section_type === 'hero_slider' && item.is_active)

  const filteredItems = layoutItems.filter(item => {
    if (activeTab === "all") return true
    if (activeTab === "hero") return item.section_type === 'hero_slider'
    if (activeTab === "banner") return item.section_type === 'banner'
    // if (activeTab === "featured") return item.section_type === 'featured'
    // if (activeTab === "image_text") return item.section_type === 'image_text'
    return true
  })

  const getSectionStats = () => {
    const stats = {
      hero: layoutItems.filter(item => item.section_type === 'hero_slider').length,
      banner: layoutItems.filter(item => item.section_type === 'banner').length,
      featured: layoutItems.filter(item => item.section_type === 'featured').length,
      image_text: layoutItems.filter(item => item.section_type === 'image_text').length,
      active: layoutItems.filter(item => item.is_active).length,
      inactive: layoutItems.filter(item => !item.is_active).length,
    }
    return stats
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
          <span className="text-muted-foreground">Loading layout items...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center flex-wrap justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Layout Management</h1>
            <p className="text-muted-foreground mt-1">Manage hero sliders, banners, and other layout elements</p>
          </div>
          <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
            <DialogTrigger asChild >
              <Button 
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleCreate}
              >
                <Plus className="w-4 h-4" />
                Add Layout Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Layout Item' : 'Create New Layout Item'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Basic Info */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
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
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter subtitle" {...field} />
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
                                placeholder="Enter description"
                                className="resize-none"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="section_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Section Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select section type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hero_slider">Hero Slider</SelectItem>
                                {/* <SelectItem value="image_text">Image & Text</SelectItem> */}
                                <SelectItem value="banner">Banner</SelectItem>
                                {/* <SelectItem value="featured">Featured Section</SelectItem> */}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="button_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Text</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter button text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="button_link"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Button Link</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter button link" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="order_index"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Order Index</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="0" 
                                value={field.value || 0}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                onBlur={field.onBlur}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                              />
                            </FormControl>
                            <FormLabel>Active</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Right Column - Image Upload */}
                    <div className="space-y-4">
                      <div>
                        <FormLabel>Image</FormLabel>
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload an image for this layout item
                        </p>
                        
                        {!imagePreview ? (
                          <div className="relative">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <div className="space-y-2">
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
                              alt="Layout item preview"
                              className="w-full h-56 object-contain rounded-lg border"
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
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {editingItem ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          {editingItem ? 'Update Item' : 'Create Item'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getSectionStats().hero}</div>
              <p className="text-sm text-muted-foreground">Hero Sliders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getSectionStats().banner}</div>
              <p className="text-sm text-muted-foreground">Banners</p>
            </CardContent>
          </Card>
          {/* <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getSectionStats().featured}</div>
              <p className="text-sm text-muted-foreground">Featured</p>
            </CardContent>
          </Card> */}
          {/* <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getSectionStats().image_text}</div>
              <p className="text-sm text-muted-foreground">Image & Text</p>
            </CardContent>
          </Card> */}
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getSectionStats().active}</div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{getSectionStats().inactive}</div>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({layoutItems.length})</TabsTrigger>
              <TabsTrigger value="hero">Hero ({getSectionStats().hero})</TabsTrigger>
              <TabsTrigger value="banner">Banner ({getSectionStats().banner})</TabsTrigger>
              {/* <TabsTrigger value="featured">Featured ({getSectionStats().featured})</TabsTrigger>
              <TabsTrigger value="image_text">Image & Text ({getSectionStats().image_text})</TabsTrigger> */}
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Hero Slider Preview - Only show on "all" or "hero" tab */}
          {(activeTab === "all" || activeTab === "hero") && heroSlides.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hero Slider Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="overflow-hidden rounded-lg">
                    <div 
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {heroSlides.map((slide, index) => (
                        <div key={slide.id} className="w-full shrink-0">
                          <div className="relative h-64 md:h-96">
                            {slide.image && (
                              <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="text-center text-white p-6">
                                <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                                {slide.subtitle && (
                                  <p className="text-lg md:text-xl mb-4">{slide.subtitle}</p>
                                )}
                                {slide.description && (
                                  <p className="text-sm md:text-base mb-6 max-w-2xl mx-auto">{slide.description}</p>
                                )}
                                {slide.button_text && (
                                  <Button size="lg" className="bg-primary hover:bg-primary/90">
                                    {slide.button_text}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {heroSlides.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {heroSlides.map((_, index) => (
                          <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentSlide ? 'bg-white' : 'bg-white/50'
                            }`}
                            onClick={() => setCurrentSlide(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Layout Items Display */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" && "All Layout Items"}
                {activeTab === "hero" && "Hero Sliders"}
                {activeTab === "banner" && "Banners"}
                {activeTab === "featured" && "Featured Sections"}
                {activeTab === "image_text" && "Image & Text Sections"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">({filteredItems.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground mb-4">No layout items found</div>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "all" ? "Create your first layout item to get started" : "Try selecting a different tab"}
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.section_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                        {item.subtitle && (
                          <p className="text-sm text-muted-foreground mb-2">{item.subtitle}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Order: {item.order_index}</span>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.section_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant={item.is_active ? "default" : "secondary"}>
                            {item.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        {item.subtitle && (
                          <p className="text-sm text-muted-foreground mb-1">{item.subtitle}</p>
                        )}
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Order: {item.order_index}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Layout Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
              </p>
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
                  Delete Item
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Save, Clock, MessageSquare, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface ContactPageContent {
  id: number
  hero_title: string
  hero_description: string
  form_title: string
  business_hours_title: string
  is_active: boolean
}

interface BusinessHour {
  id: number
  day: string
  hours: string
  is_active: boolean
  sort_order: number
}

interface FormSubject {
  id: number
  value: string
  label: string
  is_active: boolean
  sort_order: number
}

export default function ContactUsEditor() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Page Content
  const [pageContent, setPageContent] = useState<ContactPageContent>({
    id: 0,
    hero_title: "Contact Us",
    hero_description: "Have questions about our products? Need technical support? We're here to help!",
    form_title: "Send us a Message",
    business_hours_title: "Business Hours",
    is_active: true
  })

  // Business Hours
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([
    { id: 0, day: "Monday - Friday", hours: "9:00 AM - 6:00 PM", is_active: true, sort_order: 1 },
    { id: 0, day: "Saturday", hours: "10:00 AM - 4:00 PM", is_active: true, sort_order: 2 },
    { id: 0, day: "Sunday", hours: "Closed", is_active: true, sort_order: 3 }
  ])

  // Form Subjects
  const [formSubjects, setFormSubjects] = useState<FormSubject[]>([
    { id: 0, value: "general", label: "General Inquiry", is_active: true, sort_order: 1 },
    { id: 0, value: "technical", label: "Technical Support", is_active: true, sort_order: 2 },
    { id: 0, value: "order", label: "Order Status", is_active: true, sort_order: 3 },
    { id: 0, value: "return", label: "Returns & Refunds", is_active: true, sort_order: 4 },
    { id: 0, value: "partnership", label: "Partnership", is_active: true, sort_order: 5 }
  ])

  useEffect(() => {
    fetchContactPageData()
  }, [])

  const fetchContactPageData = async () => {
    try {
      setLoading(true)
      
      // Fetch page content
      const { data: pageData, error: pageError } = await supabase
        .from('contact_page_content')
        .select('*')
        .single()

      if (pageError && pageError.code !== 'PGRST116') {
        console.error('Error fetching page content:', pageError)
      } else if (pageData) {
        setPageContent(pageData)
      }

      // Fetch business hours
      const { data: hoursData, error: hoursError } = await supabase
        .from('contact_business_hours')
        .select('*')
        .order('sort_order', { ascending: true })

      if (hoursError) {
        console.error('Error fetching business hours:', hoursError)
      } else if (hoursData && hoursData.length > 0) {
        setBusinessHours(hoursData)
      }

      // Fetch form subjects
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('contact_form_subjects')
        .select('*')
        .order('sort_order', { ascending: true })

      if (subjectsError) {
        console.error('Error fetching form subjects:', subjectsError)
      } else if (subjectsData && subjectsData.length > 0) {
        setFormSubjects(subjectsData)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePageContent = async () => {
    try {
      setSaving(true)
      
      if (pageContent.id) {
        // Update existing
        const { error } = await supabase
          .from('contact_page_content')
          .update(pageContent)
          .eq('id', pageContent.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('contact_page_content')
          .insert(pageContent)

        if (error) throw error
      }

      toast({
        title: "Success",
        description: "Page content saved successfully",
      })
    } catch (err) {
      console.error('Error saving page content:', err)
      toast({
        title: "Error",
        description: "Failed to save page content",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBusinessHours = async () => {
    try {
      setSaving(true)
      
      for (const hour of businessHours) {
        if (hour.id) {
          // Update existing
          const { error } = await supabase
            .from('contact_business_hours')
            .update(hour)
            .eq('id', hour.id)

          if (error) throw error
        } else {
          // Insert new
          const { error } = await supabase
            .from('contact_business_hours')
            .insert(hour)

          if (error) throw error
        }
      }

      toast({
        title: "Success",
        description: "Business hours saved successfully",
      })
    } catch (err) {
      console.error('Error saving business hours:', err)
      toast({
        title: "Error",
        description: "Failed to save business hours",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFormSubjects = async () => {
    try {
      setSaving(true)
      
      for (const subject of formSubjects) {
        if (subject.id) {
          // Update existing
          const { error } = await supabase
            .from('contact_form_subjects')
            .update(subject)
            .eq('id', subject.id)

          if (error) throw error
        } else {
          // Insert new
          const { error } = await supabase
            .from('contact_form_subjects')
            .insert(subject)

          if (error) throw error
        }
      }

      toast({
        title: "Success",
        description: "Form subjects saved successfully",
      })
    } catch (err) {
      console.error('Error saving form subjects:', err)
      toast({
        title: "Error",
        description: "Failed to save form subjects",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addBusinessHour = () => {
    const newHour: BusinessHour = {
      id: 0,
      day: "",
      hours: "",
      is_active: true,
      sort_order: businessHours.length + 1
    }
    setBusinessHours([...businessHours, newHour])
  }

  const removeBusinessHour = (index: number) => {
    const newHours = businessHours.filter((_, i) => i !== index)
    setBusinessHours(newHours)
  }

  const updateBusinessHour = (index: number, field: keyof BusinessHour, value: any) => {
    const newHours = [...businessHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setBusinessHours(newHours)
  }

  const addFormSubject = () => {
    const newSubject: FormSubject = {
      id: 0,
      value: "",
      label: "",
      is_active: true,
      sort_order: formSubjects.length + 1
    }
    setFormSubjects([...formSubjects, newSubject])
  }

  const removeFormSubject = (index: number) => {
    const newSubjects = formSubjects.filter((_, i) => i !== index)
    setFormSubjects(newSubjects)
  }

  const updateFormSubject = (index: number, field: keyof FormSubject, value: any) => {
    const newSubjects = [...formSubjects]
    newSubjects[index] = { ...newSubjects[index], [field]: value }
    setFormSubjects(newSubjects)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold wrap-break-word">Contact Us Editor</h1>
              <p className="text-muted-foreground text-sm sm:text-base wrap-break-word">Manage your contact page content and settings</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold wrap-break-word">Contact Us Editor</h1>
            <p className="text-muted-foreground text-sm sm:text-base wrap-break-word">Manage your contact page content and settings</p>
          </div>
          <Badge variant={pageContent.is_active ? "default" : "secondary"} className="shrink-0">
            {pageContent.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Tabs defaultValue="content" className="space-y-4 sm:space-y-6">
          <div className="w-full overflow-x-auto">
            <TabsList className="w-full sm:w-auto inline-flex sm:grid sm:grid-cols-3">
              <TabsTrigger value="content" className="flex-1 sm:flex-none whitespace-nowrap">Page Content</TabsTrigger>
              <TabsTrigger value="hours" className="flex-1 sm:flex-none whitespace-nowrap">Business Hours</TabsTrigger>
              <TabsTrigger value="subjects" className="flex-1 sm:flex-none whitespace-nowrap">Form Subjects</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="content" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MessageSquare className="w-5 h-5" />
                  Page Content
                </CardTitle>
                <CardDescription className="text-sm">
                  Edit the main content displayed on your contact page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hero_title" className="text-sm font-medium">Hero Title</Label>
                    <Input
                      id="hero_title"
                      value={pageContent.hero_title}
                      onChange={(e) => setPageContent({ ...pageContent, hero_title: e.target.value })}
                      placeholder="Contact Us"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="form_title" className="text-sm font-medium">Form Section Title</Label>
                    <Input
                      id="form_title"
                      value={pageContent.form_title}
                      onChange={(e) => setPageContent({ ...pageContent, form_title: e.target.value })}
                      placeholder="Send us a Message"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_description" className="text-sm font-medium">Hero Description</Label>
                  <Textarea
                    id="hero_description"
                    value={pageContent.hero_description}
                    onChange={(e) => setPageContent({ ...pageContent, hero_description: e.target.value })}
                    placeholder="Have questions about our products? Need technical support? We're here to help!"
                    rows={3}
                    className="w-full resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={pageContent.is_active}
                      onCheckedChange={(checked) => setPageContent({ ...pageContent, is_active: checked })}
                    />
                    <Label htmlFor="is_active" className="text-sm font-medium">Page is active</Label>
                  </div>
                  <Button onClick={handleSavePageContent} disabled={saving} className="w-full sm:w-auto">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Content
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Clock className="w-5 h-5" />
                  Business Hours
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage your business hours display
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {businessHours.map((hour, index) => (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Day</Label>
                        <Input
                          value={hour.day}
                          onChange={(e) => updateBusinessHour(index, 'day', e.target.value)}
                          placeholder="Monday - Friday"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Hours</Label>
                        <Input
                          value={hour.hours}
                          onChange={(e) => updateBusinessHour(index, 'hours', e.target.value)}
                          placeholder="9:00 AM - 6:00 PM"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hour.is_active}
                            onCheckedChange={(checked) => updateBusinessHour(index, 'is_active', checked)}
                          />
                          <Label className="text-sm font-medium">Active</Label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBusinessHour(index)}
                          className="mt-2 sm:mt-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button onClick={addBusinessHour} variant="outline" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business Hour
                  </Button>
                  <Button onClick={handleSaveBusinessHours} disabled={saving} className="w-full sm:w-auto">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Hours
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Send className="w-5 h-5" />
                  Form Subjects
                </CardTitle>
                <CardDescription className="text-sm">
                  Manage the subject options in the contact form dropdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formSubjects.map((subject, index) => (
                  <div key={index} className="p-3 sm:p-4 border rounded-lg space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Value</Label>
                        <Input
                          value={subject.value}
                          onChange={(e) => updateFormSubject(index, 'value', e.target.value)}
                          placeholder="general"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Label</Label>
                        <Input
                          value={subject.label}
                          onChange={(e) => updateFormSubject(index, 'label', e.target.value)}
                          placeholder="General Inquiry"
                          className="w-full"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={subject.is_active}
                            onCheckedChange={(checked) => updateFormSubject(index, 'is_active', checked)}
                          />
                          <Label className="text-sm font-medium">Active</Label>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFormSubject(index)}
                          className="mt-2 sm:mt-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button onClick={addFormSubject} variant="outline" className="w-full sm:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Subject
                  </Button>
                  <Button onClick={handleSaveFormSubjects} disabled={saving} className="w-full sm:w-auto">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Subjects
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

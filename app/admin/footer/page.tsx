"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Edit2, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toastUtils } from "@/lib/toast-utils"

interface FooterContact {
  id: number
  icon_type: string
  title: string
  subtitle: string
  is_active: boolean
  sort_order: number
}

export default function FooterManagementPage() {
  const [contacts, setContacts] = useState<FooterContact[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    icon_type: 'mail',
    title: '',
    subtitle: '',
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_contact')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error
      setContacts(data || [])
    } catch (err) {
      console.error('Error fetching contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        // Update existing contact
        const { error } = await supabase
          .from('footer_contact')
          .update(formData)
          .eq('id', editingId)
        
        if (error) throw error
        setEditingId(null)
      }

      // Reset form
      setFormData({
        icon_type: 'mail',
        title: '',
        subtitle: '',
        is_active: true,
        sort_order: 0
      })
      
      fetchContacts()
    } catch (err) {
      console.error('Error saving contact:', err)
    }
  }

  const handleEdit = (contact: FooterContact) => {
    setEditingId(contact.id)
    setFormData({
      icon_type: contact.icon_type,
      title: contact.title,
      subtitle: contact.subtitle,
      is_active: contact.is_active,
      sort_order: contact.sort_order
    })
    // Scroll to top when edit is clicked
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      icon_type: 'mail',
      title: '',
      subtitle: '',
      is_active: true,
      sort_order: 0
    })
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2"></div>
          <span>Loading footer management...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Footer Management</h1>
            <p className="text-muted-foreground">Manage footer contact information</p>
          </div>
        </div>

        {/* Edit Form */}
        {editingId && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon_type">Icon Type</Label>
                    <Select value={formData.icon_type} onValueChange={(value) => setFormData({...formData, icon_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mail">Mail</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="map_pin">Map Pin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="sort_order">Sort Order</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Contacts List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className={!contact.is_active ? 'opacity-50' : ''}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">Icon:</span>
                      <span className="font-medium">{contact.icon_type}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Title:</span>
                      <p className="font-medium">{contact.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Subtitle:</span>
                      <p className="text-sm">{contact.subtitle}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Order: {contact.sort_order}</span>
                      <span>Status: {contact.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(contact)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

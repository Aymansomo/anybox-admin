"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Trash2, ToggleLeft as Toggle2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

interface StaffMember {
  id: number
  username: string
  email: string
  full_name: string
  role: "manager" | "staff"
  is_active: boolean
  last_login: string | null
  join_date: string
  created_at: string
  updated_at: string
}

interface ManagerStaffTableProps {
  onAddStaff?: () => void
}

export function ManagerStaffTable({ onAddStaff }: ManagerStaffTableProps) {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    full_name: "",
    role: "staff" as "staff" | "manager",
    is_active: true,
    password: ""
  })

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/manager-staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data.staff || [])
      }
    } catch (error) {
      console.error('Error fetching staff:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
    
    // Listen for custom event to open dialog
    const handleOpenDialog = () => {
      setIsDialogOpen(true)
      setEditingId(null)
      setFormData({ username: "", email: "", full_name: "", role: "staff", is_active: true, password: "" })
    }
    
    window.addEventListener('openStaffDialog', handleOpenDialog)
    
    return () => {
      window.removeEventListener('openStaffDialog', handleOpenDialog)
    }
  }, [])

  const handleEdit = (member: StaffMember) => {
    // Managers cannot edit other managers
    if (member.role === 'manager' && member.id !== editingId) {
      toast.error('You cannot edit other managers')
      return
    }
    
    setEditingId(member.id)
    setFormData({ 
      username: member.username,
      email: member.email, 
      full_name: member.full_name, 
      role: member.role, 
      is_active: member.is_active,
      password: ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (member: StaffMember) => {
    // Managers cannot delete other managers
    if (member.role === 'manager') {
      toast.error('You cannot delete managers')
      return
    }
    
    setDeletingStaff(member)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingStaff) return

    try {
      const response = await fetch(`/api/manager-staff/${deletingStaff.id}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setStaff(staff.filter((s) => s.id !== deletingStaff.id))
        toast.success(`${deletingStaff.full_name} has been removed from staff successfully`)
        setIsDeleteDialogOpen(false)
        setDeletingStaff(null)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to delete staff member')
      }
    } catch (error) {
      console.error('Error deleting staff:', error)
      toast.error('Network error. Please try again.')
    }
  }

  const handleSave = async () => {
    // Basic validation
    if (!formData.username || !formData.email || !formData.full_name) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!editingId && !formData.password) {
      toast.error('Password is required for new staff members')
      return
    }

    // Managers cannot create managers
    if (!editingId && formData.role === 'manager') {
      toast.error('Managers cannot create other managers')
      return
    }

    setSaving(true)
    try {
      const url = editingId ? `/api/manager-staff/${editingId}` : '/api/manager-staff'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchStaff() // Refresh data
        setIsDialogOpen(false)
        setEditingId(null)
        setFormData({ username: "", email: "", full_name: "", role: "staff", is_active: true, password: "" })
        toast.success(editingId ? 'Staff member updated successfully!' : 'Staff member added successfully!')
      } else {
        toast.error(data.error || 'Failed to save staff member')
      }
    } catch (error) {
      console.error('Error saving staff:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (id: number) => {
    const member = staff.find(s => s.id === id)
    if (member) {
      // Managers cannot deactivate other managers
      if (member.role === 'manager' && member.id !== id) {
        toast.error('You cannot deactivate other managers')
        return
      }
      
      try {
        const response = await fetch(`/api/manager-staff/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...member,
            is_active: !member.is_active
          }),
        })
        if (response.ok) {
          await fetchStaff() // Refresh data
          toast.success(`Staff member ${!member.is_active ? 'activated' : 'deactivated'} successfully!`)
        } else {
          const data = await response.json()
          toast.error(data.error || 'Failed to update staff status')
        }
      } catch (error) {
        console.error('Error toggling status:', error)
        toast.error('Network error. Please try again.')
      }
    }
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Role</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Orders</th>
                  <th className="text-left py-4 px-6 font-semibold text-foreground">Joined</th>
                  <th className="text-right py-4 px-6 font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading staff data...
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-foreground">{member.full_name}</td>
                      <td className="py-4 px-6 text-muted-foreground">{member.email}</td>
                      <td className="py-4 px-6">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {member.role === "manager" ? "Manager" : "Staff"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={
                            member.is_active
                              ? "bg-green-500/10 text-green-500 border-green-500/30"
                              : "bg-muted text-muted-foreground border-border"
                          }
                        >
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-foreground font-medium">-</td>
                      <td className="py-4 px-6 text-muted-foreground text-sm">
                        {new Date(member.join_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleStatus(member.id)}
                            title={member.is_active ? "Deactivate" : "Activate"}
                            disabled={member.role === 'manager' && member.id !== editingId}
                          >
                            <Toggle2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8" 
                            onClick={() => handleEdit(member)}
                            disabled={member.role === 'manager' && member.id !== editingId}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(member)}
                            disabled={member.role === 'manager'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

      {/* Dialog for adding/editing staff */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {editingId ? "(leave blank to keep current)" : ""}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={editingId ? "••••••••" : "Enter password"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as "staff" | "manager" })} disabled={!!editingId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  {editingId && <SelectItem value="manager">Manager</SelectItem>}
                </SelectContent>
              </Select>
              {!editingId && (
                <p className="text-xs text-muted-foreground">Managers can only create staff members. Only admins can create managers.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="is_active">Status</Label>
              <Select
                value={formData.is_active ? "active" : "inactive"}
                onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave} 
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={saving}
              >
                {saving ? 'Saving...' : `${editingId ? "Update" : "Add"} Staff`}
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 bg-transparent" 
                onClick={() => setIsDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground mb-2">
              Are you sure you want to remove <span className="font-semibold">{deletingStaff?.full_name}</span> from the staff?
            </p>
            <p className="text-muted-foreground text-sm">
              This action cannot be undone. The staff member will lose access to the system immediately.
            </p>
            {deletingStaff && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm">
                  <p><span className="font-medium">Email:</span> {deletingStaff.email}</p>
                  <p><span className="font-medium">Role:</span> {deletingStaff.role === "manager" ? "Manager" : "Staff"}</p>
                  <p><span className="font-medium">Status:</span> {deletingStaff.is_active ? "Active" : "Inactive"}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setDeletingStaff(null)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              className="flex-1"
            >
              Remove Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

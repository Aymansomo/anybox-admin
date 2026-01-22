"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit2, Trash2, ToggleLeft as Toggle2 } from "lucide-react"

interface StaffMember {
  id: number
  name: string
  email: string
  role: "manager" | "staff"
  status: "active" | "inactive"
  joinDate: string
  ordersAssigned: number
}

const mockStaff: StaffMember[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "manager",
    status: "active",
    joinDate: "2023-06-15",
    ordersAssigned: 24,
  },
  {
    id: 2,
    name: "Mike Chen",
    email: "mike@company.com",
    role: "staff",
    status: "active",
    joinDate: "2023-08-20",
    ordersAssigned: 18,
  },
  {
    id: 3,
    name: "John Smith",
    email: "john@company.com",
    role: "staff",
    status: "active",
    joinDate: "2023-09-10",
    ordersAssigned: 15,
  },
  {
    id: 4,
    name: "Emma Wilson",
    email: "emma@company.com",
    role: "staff",
    status: "inactive",
    joinDate: "2023-07-01",
    ordersAssigned: 0,
  },
  {
    id: 5,
    name: "David Brown",
    email: "david@company.com",
    role: "manager",
    status: "active",
    joinDate: "2023-05-15",
    ordersAssigned: 32,
  },
]

interface StaffTableProps {
  onAddStaff?: () => void
}

export function StaffTable({ onAddStaff }: StaffTableProps) {
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff" as const,
    status: "active" as const,
  })

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id)
    setFormData({ name: member.name, email: member.email, role: member.role, status: member.status })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this staff member?")) {
      setStaff(staff.filter((s) => s.id !== id))
    }
  }

  const handleSave = () => {
    if (editingId) {
      setStaff(
        staff.map((s) =>
          s.id === editingId
            ? { ...s, name: formData.name, email: formData.email, role: formData.role, status: formData.status }
            : s,
        ),
      )
    } else {
      setStaff([
        ...staff,
        {
          id: Math.max(...staff.map((s) => s.id)) + 1,
          ...formData,
          joinDate: new Date().toISOString().split("T")[0],
          ordersAssigned: 0,
        },
      ])
    }
    setIsDialogOpen(false)
    setEditingId(null)
    setFormData({ name: "", email: "", role: "staff", status: "active" })
  }

  const toggleStatus = (id: number) => {
    setStaff(staff.map((s) => (s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)))
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
                {staff.map((member) => (
                  <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{member.name}</td>
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
                          member.status === "active"
                            ? "bg-green-500/10 text-green-500 border-green-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }
                      >
                        {member.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-foreground font-medium">{member.ordersAssigned}</td>
                    <td className="py-4 px-6 text-muted-foreground text-sm">{member.joinDate}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => toggleStatus(member.id)}
                          title={member.status === "active" ? "Deactivate" : "Activate"}
                        >
                          <Toggle2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(member)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
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
              <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                {editingId ? "Update" : "Add"} Staff
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, MessageSquare } from "lucide-react"

interface Order {
  id: string
  customerName: string
  items: number
  total: number
  currentStatus: "pending" | "confirmed" | "packed" | "shipped"
  dueDate: string
}

const mockAssignedOrders: Order[] = [
  {
    id: "ORD-2024-004",
    customerName: "Alice Williams",
    items: 2,
    total: 799.99,
    currentStatus: "confirmed",
    dueDate: "2024-01-25",
  },
  {
    id: "ORD-2024-008",
    customerName: "Tom Anderson",
    items: 1,
    total: 599.99,
    currentStatus: "pending",
    dueDate: "2024-01-24",
  },
  {
    id: "ORD-2024-009",
    customerName: "Lisa Garcia",
    items: 3,
    total: 1299.97,
    currentStatus: "packed",
    dueDate: "2024-01-26",
  },
  {
    id: "ORD-2024-010",
    customerName: "Ryan White",
    items: 1,
    total: 79.99,
    currentStatus: "confirmed",
    dueDate: "2024-01-23",
  },
  {
    id: "ORD-2024-011",
    customerName: "Jennifer Lee",
    items: 4,
    total: 2199.96,
    currentStatus: "shipped",
    dueDate: "2024-01-27",
  },
]

const statusConfig = {
  pending: { label: "Pending", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30" },
  confirmed: { label: "Confirmed", color: "text-blue-500 bg-blue-500/10 border-blue-500/30" },
  packed: { label: "Packed", color: "text-purple-500 bg-purple-500/10 border-purple-500/30" },
  shipped: { label: "Shipped", color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30" },
}

export function StaffOrders() {
  const [orders, setOrders] = useState<Order[]>(mockAssignedOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isNotesOpen, setIsNotesOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [newStatus, setNewStatus] = useState("")

  const handleOpenNotes = (order: Order) => {
    setSelectedOrder(order)
    setNewStatus(order.currentStatus)
    setNotes("")
    setIsNotesOpen(true)
  }

  const handleSaveUpdate = () => {
    if (selectedOrder) {
      setOrders(orders.map((o) => (o.id === selectedOrder.id ? { ...o, currentStatus: newStatus as any } : o)))
      setIsNotesOpen(false)
      alert("Order updated successfully!")
    }
  }

  return (
    <div>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Your Assigned Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground text-sm">Due Date</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const config = statusConfig[order.currentStatus]
                  return (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-foreground text-sm">{order.id}</td>
                      <td className="py-3 px-4 text-foreground font-medium text-sm">{order.customerName}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{order.items}</td>
                      <td className="py-3 px-4 font-semibold text-foreground text-sm">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={`text-xs ${config.color}`}>
                          {config.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{order.dueDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenNotes(order)}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Dialog for updating order status and adding notes */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Update Order {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Order Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="packed">Packed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Internal Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about this order..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveUpdate}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Update Order
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsNotesOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

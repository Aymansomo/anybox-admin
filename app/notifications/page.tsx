"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, AlertCircle, ShoppingCart, Truck } from "lucide-react"

interface Notification {
  id: number
  type: "order" | "alert" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "order",
    title: "New Order",
    message: "Order ORD-2024-012 received from Sarah Anderson",
    timestamp: "2024-01-19 10:30 AM",
    read: false,
  },
  {
    id: 2,
    type: "alert",
    title: "Low Stock Alert",
    message: 'Samsung 55" TV stock is below 5 units',
    timestamp: "2024-01-19 09:15 AM",
    read: false,
  },
  {
    id: 3,
    type: "order",
    title: "Order Delivered",
    message: "Order ORD-2024-001 has been delivered",
    timestamp: "2024-01-18 04:30 PM",
    read: true,
  },
  {
    id: 4,
    type: "system",
    title: "System Maintenance",
    message: "Scheduled maintenance completed successfully",
    timestamp: "2024-01-18 02:00 AM",
    read: true,
  },
  {
    id: 5,
    type: "order",
    title: "New Order",
    message: "Order ORD-2024-011 received from Jennifer Lee",
    timestamp: "2024-01-17 11:45 PM",
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const handleDismiss = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <ShoppingCart className="w-5 h-5 text-blue-500" />
      case "alert":
        return <AlertCircle className="w-5 h-5 text-destructive" />
      case "system":
        return <Truck className="w-5 h-5 text-primary" />
      default:
        return null
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`bg-card border-border transition-colors ${
                  !notification.read ? "border-primary/30 bg-primary/5" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">{notification.timestamp}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 text-xs"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDismiss(notification.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {!notification.read && (
                        <Badge className="mt-3 bg-primary/20 text-primary border-primary/30">Unread</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

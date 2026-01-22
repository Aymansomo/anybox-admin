"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function NotificationPreferences() {
  const [isSaving, setIsSaving] = useState(false)
  const [preferences, setPreferences] = useState({
    newOrder: true,
    orderUpdate: true,
    lowStock: true,
    customerMessage: true,
    systemAlert: true,
    emailNotifications: true,
    pushNotifications: false,
  })

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("Notification preferences saved successfully!")
    }, 500)
  }

  const notifications = [
    { key: "newOrder", label: "New Order Notifications", description: "Get notified when new orders arrive" },
    {
      key: "orderUpdate",
      label: "Order Update Notifications",
      description: "Receive updates about order status changes",
    },
    { key: "lowStock", label: "Low Stock Alerts", description: "Get alerted when products are running low" },
    { key: "customerMessage", label: "Customer Messages", description: "Receive customer inquiries and messages" },
    { key: "systemAlert", label: "System Alerts", description: "Important system and security notifications" },
  ]

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.key}
              className="flex items-start justify-between py-3 border-b border-border last:border-b-0"
            >
              <div>
                <label className="font-medium text-foreground cursor-pointer block mb-1">{notification.label}</label>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
              </div>
              <input
                type="checkbox"
                checked={preferences[notification.key as keyof typeof preferences]}
                onChange={() => handleToggle(notification.key as keyof typeof preferences)}
                className="w-4 h-4 rounded border-border bg-muted mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start justify-between py-3 border-b border-border">
            <div>
              <label className="font-medium text-foreground cursor-pointer block mb-1">Email Notifications</label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
              className="w-4 h-4 rounded border-border bg-muted mt-1"
            />
          </div>

          <div className="flex items-start justify-between py-3">
            <div>
              <label className="font-medium text-foreground cursor-pointer block mb-1">Push Notifications</label>
              <p className="text-sm text-muted-foreground">Receive browser push notifications (requires permission)</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.pushNotifications}
              onChange={() => handleToggle("pushNotifications")}
              className="w-4 h-4 rounded border-border bg-muted mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  )
}

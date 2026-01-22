"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { StoreSettings } from "@/components/store-settings"
import { OrderRulesSettings } from "@/components/order-rules-settings"
import { NotificationPreferences } from "@/components/notification-preferences"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your store configuration and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border">
            <TabsTrigger value="store">Store Info</TabsTrigger>
            <TabsTrigger value="rules">Order Rules</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="mt-6">
            <StoreSettings />
          </TabsContent>

          <TabsContent value="rules" className="mt-6">
            <OrderRulesSettings />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationPreferences />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}

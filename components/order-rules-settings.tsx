"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function OrderRulesSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    minOrder: "10",
    maxOrder: "999999",
    processingDays: "2",
    shippingDays: "3",
    lowStockThreshold: "10",
    enableCOD: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("Order rules saved successfully!")
    }, 500)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Order Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minOrder">Minimum Order Amount ($)</Label>
            <Input
              id="minOrder"
              name="minOrder"
              type="number"
              value={formData.minOrder}
              onChange={handleChange}
              placeholder="10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxOrder">Maximum Order Amount ($)</Label>
            <Input
              id="maxOrder"
              name="maxOrder"
              type="number"
              value={formData.maxOrder}
              onChange={handleChange}
              placeholder="999999"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="processingDays">Order Processing Days</Label>
            <Input
              id="processingDays"
              name="processingDays"
              type="number"
              value={formData.processingDays}
              onChange={handleChange}
              placeholder="2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shippingDays">Estimated Shipping Days</Label>
            <Input
              id="shippingDays"
              name="shippingDays"
              type="number"
              value={formData.shippingDays}
              onChange={handleChange}
              placeholder="3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low Stock Threshold (Units)</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              value={formData.lowStockThreshold}
              onChange={handleChange}
              placeholder="10"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <input
              id="enableCOD"
              name="enableCOD"
              type="checkbox"
              checked={formData.enableCOD}
              onChange={handleChange}
              className="w-4 h-4 rounded border-border bg-muted"
            />
            <label htmlFor="enableCOD" className="text-sm text-foreground font-medium cursor-pointer">
              Enable Cash on Delivery (COD)
            </label>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Rules"}
        </Button>
      </CardContent>
    </Card>
  )
}

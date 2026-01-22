"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { Navbar } from "./navbar"

interface DashboardLayoutProps {
  children: React.ReactNode
  isAdmin?: boolean
}

export function DashboardLayout({ children, isAdmin = true }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      <Navbar />
      <main className="md:ml-64 pt-16 pb-4 px-4 md:px-6">{children}</main>
    </div>
  )
}

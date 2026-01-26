"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toastUtils } from "@/lib/toast-utils"

interface UserInfo {
  name: string
  email: string
  initials: string
  isAdmin: boolean
}

export function Navbar() {
  const [user, setUser] = useState<UserInfo>({
    name: "Admin",
    email: "",
    initials: "AD",
    isAdmin: true
  })

  useEffect(() => {
    // Check if staff user is logged in
    const staffUser = localStorage.getItem('staffUser')
    if (staffUser) {
      try {
        const staff = JSON.parse(staffUser)
        const initials = staff.full_name
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase())
          .join('')
          .slice(0, 2)
        
        setUser({
          name: staff.full_name,
          email: staff.email,
          initials: initials || 'ST',
          isAdmin: false
        })
      } catch (error) {
        console.error('Error parsing staff user:', error)
      }
    }
    // You can also check for admin user here if needed
  }, [])

  const handleLogout = () => {
    if (user.isAdmin) {
      // Handle admin logout - clear all authentication data
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('userRole')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('adminData')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
      
      // Show success toast
      toastUtils.success("Admin logged out successfully")
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login'
      }, 1000)
    } else {
      // Handle staff logout
      localStorage.removeItem('staffUser')
      localStorage.removeItem('staffToken')
      window.location.href = '/staff-login'
    }
  }
  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border md:ml-64">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side - Can add breadcrumbs here */}
        <div className="flex-1" />

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
          </Button> */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer text-destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, ShoppingCart, Users, Bell, Settings, Menu, X, FolderOpen, Palette, Info, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href?: string
  icon: React.ReactNode
  adminOnly?: boolean
  badge?: number
  children?: NavItem[]
  isDropdown?: boolean
}

const adminNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Layout",
    icon: <Palette className="w-5 h-5" />,
    adminOnly: true,
    isDropdown: true,
    children: [
      {
        label: "Home",
        href: "/layout",
        icon: <LayoutDashboard className="w-4 h-4" />,
        adminOnly: true,
      },
      {
        label: "About Us",
        href: "/layout/about-us",
        icon: <Info className="w-4 h-4" />,
        adminOnly: true,
      },
    ],
  },
  {
    label: "Categories",
    href: "/categories",
    icon: <FolderOpen className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    label: "Products",
    href: "/products",
    icon: <Package className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: "Staff",
    href: "/staff",
    icon: <Users className="w-5 h-5" />,
    adminOnly: true,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="w-5 h-5" />,
    badge: 3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
    adminOnly: true,
  },
]

const staffNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/staff-dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "My Orders",
    href: "/staff-orders",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="w-5 h-5" />,
    badge: 3,
  },
]

const managerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/manager-dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Orders Management",
    href: "/manager-orders",
    icon: <ShoppingCart className="w-5 h-5" />,
  },
  {
    label: "Staff Management",
    href: "/manager-staff",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: <Bell className="w-5 h-5" />,
    badge: 3,
  },
]

export function Sidebar({ isAdmin = true, isManager = false }: { isAdmin?: boolean; isManager?: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState<string[]>(["Layout"])

  const navItems = isAdmin ? adminNavItems : isManager ? managerNavItems : staffNavItems
  const filteredItems = navItems.filter((item: NavItem) => !item.adminOnly || isAdmin)

  const toggleDropdown = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isItemActive = (item: NavItem): boolean => {
    if (item.href) {
      // For exact match on parent items, check if pathname exactly equals href
      // or if it's a child item that should highlight the parent
      if (item.children) {
        return item.children.some(child => child.href && (pathname === child.href || pathname.startsWith(child.href + '/')))
      }
      return pathname === item.href || pathname.startsWith(item.href + '/')
    }
    if (item.children) {
      return item.children.some(child => child.href && (pathname === child.href || pathname.startsWith(child.href + '/')))
    }
    return false
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 z-40",
          isOpen ? "w-64" : "w-0 md:w-64",
          "overflow-hidden md:overflow-visible",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <span className="text-sidebar-primary-foreground font-bold text-sm">{isAdmin ? "AD" : isManager ? "MG" : "ST"}</span>
              </div>
              <h1 className="font-bold text-sidebar-foreground text-lg">{isAdmin ? "Admin" : isManager ? "Manager" : "Staff"}</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredItems.map((item) => {
              const isActive = isItemActive(item)
              const isExpanded = expandedItems.includes(item.label)
              
              if (item.isDropdown && item.children) {
                return (
                  <div key={item.label} className="space-y-1">
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {item.children.map((child) => {
                          const isChildActive = child.href ? pathname === child.href || pathname.startsWith(child.href + '/') : false
                          return (
                            <Link
                              key={child.href || child.label}
                              href={child.href || "#"}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors font-medium text-sm",
                                isChildActive
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                              )}
                            >
                              {child.icon}
                              <span>{child.label}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href || "#"}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60 text-center">{isAdmin ? "Admin" : isManager ? "Manager" : "Staff"} Dashboard v1.0</div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

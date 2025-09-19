"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Menu,
  Package,
  Users,
  Building2,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Warehouse,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Buyers", href: "/dashboard/buyers", icon: Users },
  { name: "Suppliers", href: "/dashboard/suppliers", icon: Building2 },
  { name: "Items", href: "/dashboard/items", icon: Package },
  { name: "Sales Contracts", href: "/dashboard/sales-contracts", icon: FileText },
  { name: "Purchase Invoices", href: "/dashboard/purchase-invoices", icon: Receipt },
  { name: "Inventory Transactions", href: "/dashboard/inventory-transactions", icon: Warehouse },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Prefetch navigation routes for better performance
  useEffect(() => {
    navigation.forEach((item) => {
      router.prefetch(item.href)
    })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("fabrimentory_auth")
    router.replace("/login")
  }

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col bg-primary">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-primary-foreground/20">
        <div className="w-8 h-8 bg-primary-foreground/20 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-primary-foreground">Fabrimentory</h1>
          <p className="text-xs text-primary-foreground/70">Inventory System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-primary-foreground hover:bg-primary-foreground/10",
                isActive && "bg-primary-foreground/20 text-primary-foreground"
              )}
              onClick={() => {
                if (mobile) setSidebarOpen(false)
                router.push(item.href)
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
              {item.name === "Reports" && (
                <Badge variant="secondary" className="ml-auto">
                  New
                </Badge>
              )}
            </Button>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-primary-foreground/20 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-primary-foreground">Admin User</p>
            <p className="text-xs text-primary-foreground/70 truncate">admin@fabrimentory.com</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden bg-transparent">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>

          {/* Company Information */}
          <div className="flex-1 flex flex-col justify-center ml-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-3xl text-foreground tracking-tight">Sinha Knit Industries Ltd.</h1>
                <p className="text-[13px] text-muted-foreground font-medium">Chamurkhan, Uttarkhan, Uttara, Dhaka-1230</p>
              </div>
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}

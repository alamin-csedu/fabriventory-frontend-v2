"use client"


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
  ChevronDown,
  ChevronRight,
  Palette,
  Database,
  Ruler,
  ArrowRightLeft,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  { name: "Dashboard", href: "/", icon: Home, roles: ["super_admin", "admin", "manager", "user", "viewer"] },
  { name: "Sales Contracts", href: "/sales-contracts", icon: FileText, roles: ["super_admin", "admin", "manager", "user"] },
  { name: "Stock Pipeline", href: "/stock-pipeline", icon: Receipt, roles: ["super_admin", "admin", "manager", "user"] },
  { name: "Stock Transfer", href: "/inventory-transactions", icon: Warehouse, roles: ["super_admin", "admin", "manager", "user"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["super_admin", "admin", "manager"] },
 // { name: "User Management", href: "/users", icon: UserCog, roles: ["super_admin", "admin"] },
// { name: "Role Management", href: "/roles", icon: Shield, roles: ["super_admin"] },
// { name: "Super Admin Panel", href: "/admin", icon: Settings, roles: ["super_admin"] },
  { 
    name: "Settings", 
    icon: Settings, 
    roles: ["super_admin", "admin"],
    submenu: [
      { name: "Vendors", href: "/settings/vendors", icon: Building2 },
      { name: "Customers", href: "/settings/customers", icon: Users },
      { name: "Storage", href: "/settings/storage", icon: Warehouse },
      { name: "Items", href: "/settings/items", icon: Package },
      { name: "Jobs", href: "/settings/jobs", icon: FileText },
      { name: "Units", href: "/settings/units", icon: Ruler },
      { name: "Unit Conversions", href: "/settings/unit-conversions", icon: ArrowRightLeft },
      { name: "Categories", href: "/settings/categories", icon: Tag },
      { name: "Colors", href: "/settings/colors", icon: Palette },
    ]
  },
]

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, hasAnyRole, roles } = useAuth()

  // Filter navigation based on user roles
  const filteredNavigation = navigation.filter(item => 
    item.roles && hasAnyRole(item.roles)
  )

  // Prefetch navigation routes for better performance
  useEffect(() => {
    filteredNavigation.forEach((item) => {
      if (item.href) {
        router.prefetch(item.href)
      }
      // Prefetch submenu routes
      if (item.submenu) {
        item.submenu.forEach((subItem) => {
          if (subItem.href) {
            router.prefetch(subItem.href)
          }
        })
      }
    })
  }, [router, filteredNavigation])

  // Auto-expand parent menu when current page is a submenu item
  useEffect(() => {
    const newExpandedMenus = {}
    
    filteredNavigation.forEach((item) => {
      if (item.submenu) {
        // Check if current pathname matches any submenu item
        const isSubmenuActive = item.submenu.some(subItem => pathname === subItem.href)
        if (isSubmenuActive) {
          newExpandedMenus[item.name] = true
        }
      }
    })
    
    // Only update if there are changes to avoid unnecessary re-renders
    if (Object.keys(newExpandedMenus).length > 0) {
      setExpandedMenus(prev => {
        // Check if we actually need to update by comparing with current state
        const hasChanges = Object.keys(newExpandedMenus).some(
          key => !prev[key] && newExpandedMenus[key]
        )
        
        if (!hasChanges) {
          return prev // Return same reference to prevent re-render
        }
        
        return {
          ...prev,
          ...newExpandedMenus
        }
      })
    }
  }, [pathname]) // Remove filteredNavigation from dependencies

  const handleLogout = async () => {
    await logout()
  }

  const toggleSubmenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }))
  }

  const Sidebar = ({ mobile = false }) => (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-sidebar-primary/20 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-sidebar-primary" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-sidebar-foreground">FABRIMENTORY</h1>
          <p className="text-[8px] text-sidebar-foreground/70">Enforced Efficiency</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          const hasSubmenu = item.submenu && item.submenu.length > 0
          const isExpanded = expandedMenus[item.name]
          
          return (
            <div key={item.name} className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground"
                )}
                onClick={() => {
                  if (hasSubmenu) {
                    toggleSubmenu(item.name)
                  } else {
                    if (mobile) setSidebarOpen(false)
                    router.push(item.href)
                  }
                }}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {hasSubmenu && (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  ) : (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )
                )}
                {item.name === "Reports" && (
                  <Badge variant="secondary" className="ml-auto">
                    New
                  </Badge>
                )}
                {item.name === "User Management" && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Admin
                  </Badge>
                )}
                {item.name === "Role Management" && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    Super Admin
                  </Badge>
                )}
              </Button>
              
              {/* Submenu */}
              {hasSubmenu && isExpanded && (
                <div className="ml-4 space-y-1">
                  {item.submenu.map((subItem, index) => {
                    const isSubActive = pathname === subItem.href
                    return (
                      <Button
                        key={`${item.name}-${subItem.name}-${index}`}
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent text-sm",
                          isSubActive && "bg-sidebar-primary/20 text-sidebar-primary"
                        )}
                        onClick={() => {
                          if (mobile) setSidebarOpen(false)
                          router.push(subItem.href)
                        }}
                      >
                        <subItem.icon className="h-3 w-3" />
                        {subItem.name}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-sidebar-primary/20 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-primary">
              {(user)?.first_name?.[0] || (user)?.username?.[0] || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-sidebar-foreground">
              {user ? `${user.first_name} ${user.last_name}` : 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user?.email || 'user@example.com'}
            </p>
            {roles && roles.length > 0 && (
              <div className="flex gap-1 mt-1">
                {roles.slice(0, 2).map((role, index) => (
                  <Badge key={role || index} variant="secondary" className="text-xs px-1 py-0">
                    {role?.replace('_', ' ') || 'Unknown Role'}
                  </Badge>
                ))}
                {roles.length > 2 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    +{roles.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 bg-transparent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
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

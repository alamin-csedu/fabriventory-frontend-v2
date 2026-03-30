"use client"


import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Menu,
  Package,
  FileText,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Warehouse,
  ChevronDown,
  ChevronRight,
  Boxes,
  Briefcase,
  Building2,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/auth-context"
import { GlobalSearchCommand, GlobalSearchTrigger } from "@/components/global-search-command"

const ORGANIZATION_NAME = "XYZ Knit Industries Limited"
const ORGANIZATION_ADDRESS = "Uttarkhan, Uttara, Dhaka-1230"

const navigation = [
  { name: "Home", href: "/dashboard", icon: Home, roles: ["super_admin", "admin", "manager", "user", "viewer"] },
  { name: "Jobs", href: "/settings/jobs", icon: Briefcase, roles: ["super_admin", "admin", "manager", "user"] },
  { name: "Stocks", href: "/stocks", icon: Boxes, roles: ["super_admin", "admin", "manager", "user", "viewer"] },
  { name: "Bookings", href: "/stock-pipeline", icon: Receipt, roles: ["super_admin", "admin", "manager", "user"] },
  { name: "Orders", href: "/sales-contracts", icon: FileText, roles: ["super_admin", "admin", "manager", "user"] },
  { name: "Transfers", href: "/stock-transfer", icon: Warehouse, roles: ["super_admin", "admin", "manager", "user"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["super_admin", "admin", "manager"] },
 // { name: "User Management", href: "/users", icon: UserCog, roles: ["super_admin", "admin"] },
// { name: "Role Management", href: "/roles", icon: Shield, roles: ["super_admin"] },
// { name: "Super Admin Panel", href: "/admin", icon: Settings, roles: ["super_admin"] },
  { name: "Settings", href: "/settings/vendors", icon: Settings, roles: ["super_admin", "admin"] },
]

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState({})
  const [commandOpen, setCommandOpen] = useState(false)
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

  const isNavItemActive = (item) => {
    if (!item.href) return false
    if (item.name === "Home") return pathname === "/dashboard"
    if (item.name === "Settings") {
      return (
        pathname.startsWith("/settings") &&
        pathname !== "/settings/jobs" &&
        !pathname.startsWith("/settings/jobs/")
      )
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  const Sidebar = ({ mobile = false }) => (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Logo — click to go Home (dashboard) */}
      <button
        type="button"
        className="flex h-16 items-center gap-2 px-6 border-b border-sidebar-border w-full text-left hover:bg-sidebar-accent/50 transition-colors shrink-0"
        onClick={() => {
          router.push("/dashboard")
          if (mobile) setSidebarOpen(false)
        }}
      >
        <div className="w-8 h-8 bg-sidebar-primary/20 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-sidebar-primary" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-sidebar-foreground">FABRIVENTORY</h1>
          <p className="text-[8px] text-sidebar-foreground/70">Enforced Efficiency</p>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {filteredNavigation.map((item) => {
          const isActive = isNavItemActive(item)
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

      {/* Organization — bottom */}
      <div className="shrink-0 border-t border-sidebar-border bg-gradient-to-b from-sidebar-accent/25 to-transparent px-3 pb-4 pt-3">
        <div className="rounded-xl border border-sidebar-border/70 bg-sidebar/90 p-3.5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm">
          <div className="flex gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary/12 ring-1 ring-sidebar-primary/20">
              <Building2 className="h-5 w-5 text-sidebar-primary" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <p
                    tabIndex={0}
                    className="block w-full cursor-default truncate text-left text-sm font-semibold leading-snug tracking-tight text-sidebar-foreground"
                  >
                    {ORGANIZATION_NAME}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" sideOffset={10} className="max-w-sm text-balance">
                  <span className="text-sm font-medium">{ORGANIZATION_NAME}</span>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <p
                    tabIndex={0}
                    className="line-clamp-2 w-full cursor-default text-left text-xs leading-snug text-sidebar-foreground/75"
                  >
                    {ORGANIZATION_ADDRESS}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="right" align="start" sideOffset={10} className="max-w-sm text-balance">
                  <span className="text-xs leading-relaxed">{ORGANIZATION_ADDRESS}</span>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
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
        <header className="flex h-14 sm:h-16 items-center gap-2 sm:gap-4 border-b px-3 sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden bg-transparent shrink-0">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <Sidebar mobile />
            </SheetContent>
          </Sheet>

          {/* Global search + home */}
          <div className="ml-1 flex min-w-0 flex-1 items-center gap-2 sm:ml-4 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:h-10 sm:w-10"
              aria-label="Go to Home"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <GlobalSearchTrigger
              onClick={() => setCommandOpen(true)}
              className="h-9 w-full max-w-full flex-1 border-border/80 bg-muted/40 text-left font-normal shadow-sm hover:bg-muted/60 sm:max-w-xl lg:max-w-2xl"
            />
            <GlobalSearchCommand open={commandOpen} onOpenChange={setCommandOpen} hasAnyRole={hasAnyRole} />
          </div>

          {/* Theme + profile */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-9 shrink-0 gap-2 rounded-full border-sidebar-border bg-background px-3 sm:px-4"
                  aria-label="Account menu"
                >
                  <span className="text-sm font-semibold text-primary">
                    {(user)?.first_name?.[0] || (user)?.username?.[0] || "U"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground opacity-70" aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user ? `${user.first_name} ${user.last_name}`.trim() || user.username : "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user?.email || "user@example.com"}
                    </p>
                    {roles && roles.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {roles.slice(0, 3).map((role, index) => (
                          <Badge key={role || index} variant="secondary" className="text-[10px] px-1 py-0 font-normal">
                            {role?.replace("_", " ") || "Unknown"}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
      </div>
    </div>
  )
}

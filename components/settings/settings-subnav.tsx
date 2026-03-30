"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2,
  Users,
  Warehouse,
  Package,
  Ruler,
  ArrowRightLeft,
  Tag,
  Palette,
} from "lucide-react"
import { cn } from "@/lib/utils"

export const SETTINGS_NAV_ITEMS = [
  { name: "Vendors", href: "/settings/vendors", icon: Building2 },
  { name: "Customers", href: "/settings/customers", icon: Users },
  { name: "Storage", href: "/settings/storage", icon: Warehouse },
  { name: "Items", href: "/settings/items", icon: Package },
  { name: "Units", href: "/settings/units", icon: Ruler },
  { name: "Unit conversions", href: "/settings/unit-conversions", icon: ArrowRightLeft },
  { name: "Categories", href: "/settings/categories", icon: Tag },
  { name: "Colors", href: "/settings/colors", icon: Palette },
] as const

export function SettingsSubnav() {
  const pathname = usePathname()

  return (
    <div className="sticky top-0 z-10 border-b border-border/80 bg-background/95 pb-px backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav
        className="-mb-px flex gap-0.5 overflow-x-auto scrollbar-thin pb-0"
        aria-label="Settings sections"
      >
        {SETTINGS_NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={cn(
                "inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors sm:px-4",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  Search,
  Receipt,
  FileText,
  Boxes,
  Briefcase,
  BarChart3,
  Settings,
  Package,
  PlusCircle,
  ArrowRightLeft,
} from "lucide-react"

export type GlobalAction = {
  id: string
  title: string
  subtitle?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles?: string[]
  keywords?: string
}

const BASE_ACTIONS: GlobalAction[] = [
  {
    id: "home",
    title: "Home",
    subtitle: "Dashboard overview",
    href: "/dashboard",
    icon: Home,
    keywords: "start dashboard",
    roles: ["super_admin", "admin", "manager", "user", "viewer"],
  },
  {
    id: "create-booking",
    title: "Create booking",
    subtitle: "Open bookings — add a ledger entry",
    href: "/stock-pipeline?action=add-booking",
    icon: PlusCircle,
    keywords: "booking pipeline stock ledger add",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "bookings",
    title: "See bookings",
    subtitle: "Stock pipeline / bookings list",
    href: "/stock-pipeline",
    icon: Receipt,
    keywords: "bookings pipeline ledger",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "new-order",
    title: "New order",
    subtitle: "Sales contracts / orders",
    href: "/sales-contracts?action=add-order",
    icon: PlusCircle,
    keywords: "order sales contract add",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "orders",
    title: "See orders",
    subtitle: "Browse sales orders",
    href: "/sales-contracts",
    icon: FileText,
    keywords: "orders contracts sales",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "transfer",
    title: "New stock transfer",
    subtitle: "Move inventory between locations",
    href: "/stock-transfer?action=add-transfer",
    icon: ArrowRightLeft,
    keywords: "transfer move stock",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "stocks",
    title: "See stocks",
    subtitle: "Inventory by item or storage",
    href: "/stocks",
    icon: Boxes,
    keywords: "inventory stock quantity",
    roles: ["super_admin", "admin", "manager", "user", "viewer"],
  },
  {
    id: "items",
    title: "See items",
    subtitle: "Catalog items (settings)",
    href: "/settings/items",
    icon: Package,
    keywords: "items catalog sku product",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "add-item",
    title: "Add item",
    subtitle: "Create catalog item",
    href: "/settings/items?action=add-item",
    icon: PlusCircle,
    keywords: "new item sku product catalog",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "jobs",
    title: "Jobs",
    subtitle: "Job definitions",
    href: "/settings/jobs",
    icon: Briefcase,
    keywords: "jobs work",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "add-job",
    title: "New job",
    subtitle: "Create a job",
    href: "/settings/jobs?action=add-job",
    icon: PlusCircle,
    keywords: "add job create",
    roles: ["super_admin", "admin", "manager", "user"],
  },
  {
    id: "reports",
    title: "Reports",
    subtitle: "Analytics and reports",
    href: "/reports",
    icon: BarChart3,
    keywords: "analytics stats",
    roles: ["super_admin", "admin", "manager"],
  },
  {
    id: "settings",
    title: "Settings",
    subtitle: "Vendors, storage, units…",
    href: "/settings/vendors",
    icon: Settings,
    keywords: "preferences configuration",
    roles: ["super_admin", "admin"],
  },
  {
    id: "add-vendor",
    title: "Add vendor",
    subtitle: "Register a vendor",
    href: "/settings/vendors?action=add-vendor",
    icon: PlusCircle,
    keywords: "supplier vendor new",
    roles: ["super_admin", "admin"],
  },
]

type GlobalSearchCommandProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasAnyRole: (roles: string[]) => boolean
}

export function GlobalSearchCommand({ open, onOpenChange, hasAnyRole }: GlobalSearchCommandProps) {
  const router = useRouter()

  const actions = useMemo(() => {
    return BASE_ACTIONS.filter((a) => !a.roles?.length || hasAnyRole(a.roles))
  }, [hasAnyRole])

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const run = (href: string) => {
    onOpenChange(false)
    router.push(href)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search and actions"
      description="Jump to a page or run a quick action"
      className="max-w-lg"
    >
      <CommandInput placeholder="Search actions, pages…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions & pages">
          {actions.map((a) => {
            const Icon = a.icon
            const value = `${a.title} ${a.subtitle ?? ""} ${a.keywords ?? ""}`
            return (
              <CommandItem
                key={a.id}
                value={value}
                onSelect={() => run(a.href)}
                className="cursor-pointer"
              >
                <Icon className="size-4" />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-medium">{a.title}</span>
                  {a.subtitle ? (
                    <span className="text-xs text-muted-foreground">{a.subtitle}</span>
                  ) : null}
                </div>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export function GlobalSearchTrigger({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      className={cn("flex w-full justify-between gap-2", className)}
      aria-label="Open search and actions"
    >
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-60" />
      <span className="truncate text-muted-foreground">Search or jump to…</span>
      <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground sm:inline">⌘K</span>
    </Button>
  )
}

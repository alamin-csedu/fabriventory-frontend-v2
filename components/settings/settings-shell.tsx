"use client"

import { usePathname } from "next/navigation"
import { SettingsSubnav } from "@/components/settings/settings-subnav"

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isJobsRoute = pathname === "/settings/jobs" || pathname.startsWith("/settings/jobs/")

  if (isJobsRoute) {
    return <>{children}</>
  }

  return (
    <div className="space-y-6">
      <SettingsSubnav />
      <div className="min-h-[200px]">{children}</div>
    </div>
  )
}

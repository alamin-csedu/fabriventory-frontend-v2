"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, SearchX } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"

export function DashboardNotFound() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/50">
            <SearchX className="h-7 w-7 text-muted-foreground" aria-hidden />
          </div>
          <p className="font-mono text-5xl font-bold tabular-nums tracking-tighter text-primary/90 sm:text-6xl">404</p>
          <h1 className="mt-4 text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Page not found
          </h1>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            This URL doesn&apos;t match any page in FABRIVENTORY. Check the address or return to your workspace.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="gap-2">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

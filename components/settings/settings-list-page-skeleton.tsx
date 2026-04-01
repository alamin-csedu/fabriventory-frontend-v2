"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Full-page loading state for settings list pages (header + search + table — no metric cards). */
export function SettingsListPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-48 sm:w-64" />
        <Skeleton className="h-10 w-32 shrink-0" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center gap-4">
            <Skeleton className="h-10 w-full max-w-sm" />
          </div>
          <div className="rounded-md border">
            <div className="border-b p-4">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-4 flex-1 max-w-md" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

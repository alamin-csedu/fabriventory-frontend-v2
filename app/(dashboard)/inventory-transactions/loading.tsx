import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          {/* Search and Filters Skeleton */}
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Table Skeleton */}
          <div className="rounded-md border">
            <div className="p-4">
              <div className="space-y-3">
                {/* Table Header */}
                <div className="grid grid-cols-11 gap-4">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
                
                {/* Table Rows */}
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-11 gap-4 py-2">
                    {Array.from({ length: 11 }).map((_, colIndex) => (
                      <Skeleton key={colIndex} className="h-4 w-full" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

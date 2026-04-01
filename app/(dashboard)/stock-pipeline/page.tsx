"use client"

import { StockLedgerTable } from "@/components/stock-ledger/stock-ledger-table"
import { AddStockLedgerDialog } from "@/components/stock-ledger/add-stock-ledger-dialog"
import { EditStockLedgerDialog } from "@/components/stock-ledger/edit-stock-ledger-dialog"
import { ViewStockLedgerDialog } from "@/components/stock-ledger/view-stock-ledger-dialog"
import { OpenModalFromAction } from "@/components/open-modal-from-action"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function StockLedgerPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("Booking")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedStockLedger, setSelectedStockLedger] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEdit = (stockLedger: any) => {
    setSelectedStockLedger(stockLedger)
    setIsEditDialogOpen(true)
  }

  const handleView = (stockLedger: any) => {
    setSelectedStockLedger(stockLedger)
    setIsViewDialogOpen(true)
  }

  const handleGoToTimeline = (stockLedger: any) => {
    router.push(`/stock-pipeline/${stockLedger.id}/timeline`)
  }

  return (
    <div className="space-y-6">
      <OpenModalFromAction action="add-booking" onOpen={() => setIsAddDialogOpen(true)} />

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-balance text-xl font-semibold sm:text-2xl">Bookings</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Booking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Entries</CardTitle>
          <CardDescription>
            Click a row to view details. For bookings, use &quot;Go&quot; in the row or the menu for the delivery timeline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Booking">Booking Only</SelectItem>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <StockLedgerTable
            searchTerm={searchTerm}
            typeFilter={typeFilter}
            refreshTrigger={refreshTrigger}
            onEdit={handleEdit}
            onView={handleView}
            onGoToTimeline={handleGoToTimeline}
          />
        </CardContent>
      </Card>

      <AddStockLedgerDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onSuccess={handleRefresh} />

      <EditStockLedgerDialog
        stockLedger={selectedStockLedger}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleRefresh}
      />

      <ViewStockLedgerDialog
        stockLedger={selectedStockLedger}
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </div>
  )
}

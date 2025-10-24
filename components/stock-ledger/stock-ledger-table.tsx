"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Plus } from "lucide-react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface StockLedger {
  id: number
  job_id: number
  type: "Booking" | "Delivery" | "IN" | "OUT"
  parent_id: number | null
  vendor_id: number
  delivery_receipt_url: string | null
  payment_reference: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  job?: {
    id: number
    name: string
    description: string
    customer_id: number
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  vendor?: {
    id: number
    name: string
    address: string
    phone_number: string[]
    email: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  parent?: {
    id: number
    job_id: number
    type: string
    parent_id: number | null
    vendor_id: number
    delivery_receipt_url: string
    payment_reference: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
}

interface StockLedgerTableProps {
  searchTerm: string
  typeFilter: string
  onRefresh?: () => void
  onEdit?: (stockLedger: StockLedger) => void
  onView?: (stockLedger: StockLedger) => void
}

export function StockLedgerTable({ searchTerm, typeFilter, onRefresh, onEdit, onView }: StockLedgerTableProps) {
  const [stockLedgers, setStockLedgers] = useState<StockLedger[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStockLedger, setSelectedStockLedger] = useState<StockLedger | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const fetchStockLedgers = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStockLedgers({
        page: 1,
        size: 100,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      })
      setStockLedgers(response.data.data || [])
    } catch (error) {
      console.error("Error fetching stock ledgers:", error)
      toast.error("Failed to fetch stock ledgers")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStockLedgers()
  }, [searchTerm, typeFilter])

  const handleEdit = (stockLedger: StockLedger) => {
    if (onEdit) {
      onEdit(stockLedger)
    } else {
      setSelectedStockLedger(stockLedger)
      setEditDialogOpen(true)
    }
  }

  const handleDelete = (stockLedger: StockLedger) => {
    setSelectedStockLedger(stockLedger)
    setDeleteDialogOpen(true)
  }

  const handleView = (stockLedger: StockLedger) => {
    if (onView) {
      onView(stockLedger)
    } else {
      setSelectedStockLedger(stockLedger)
      setViewDialogOpen(true)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedStockLedger) return

    try {
      await apiService.deleteStockLedger(selectedStockLedger.id)
      setStockLedgers(stockLedgers.filter((sl) => sl.id !== selectedStockLedger.id))
      setDeleteDialogOpen(false)
      toast.success("Stock ledger deleted successfully")
      onRefresh?.()
    } catch (error) {
      console.error("Error deleting stock ledger:", error)
      toast.error("Failed to delete stock ledger")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      Booking: { variant: "default" as const, label: "Booking" },
      Delivery: { variant: "secondary" as const, label: "Delivery" },
      IN: { variant: "default" as const, label: "IN" },
      OUT: { variant: "secondary" as const, label: "OUT" },
    }
    const config = typeConfig[type as keyof typeof typeConfig] || { variant: "outline" as const, label: type }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Payment Reference</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockLedgers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No stock ledgers found
                </TableCell>
              </TableRow>
            ) : (
              stockLedgers.map((stockLedger) => (
                <TableRow key={stockLedger.id}>
                  <TableCell className="font-medium">#{stockLedger.id}</TableCell>
                  <TableCell>{getTypeBadge(stockLedger.type)}</TableCell>
                  <TableCell>
                    {stockLedger.job?.name || `Job #${stockLedger.job_id}`}
                  </TableCell>
                  <TableCell>
                    {stockLedger.vendor?.name || `Vendor #${stockLedger.vendor_id}`}
                  </TableCell>
                  <TableCell>
                    {stockLedger.parent ? `#${stockLedger.parent.id} (${stockLedger.parent.type})` : "None"}
                  </TableCell>
                  <TableCell>
                    {stockLedger.payment_reference || "-"}
                  </TableCell>
                  <TableCell>{formatDate(stockLedger.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(stockLedger)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(stockLedger)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(stockLedger)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      {selectedStockLedger && (
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${deleteDialogOpen ? 'block' : 'hidden'}`}>
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Stock Ledger</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete stock ledger #{selectedStockLedger.id}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

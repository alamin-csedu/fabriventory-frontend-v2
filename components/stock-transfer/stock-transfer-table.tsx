"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { apiService } from "@/lib/api"
import { getFirstNStoragePathSegments } from "@/lib/utils"
import { toast } from "sonner"
import { EditStockTransferDialog } from "@/components/stock-transfer/edit-stock-transfer-dialog"
import { ViewStockTransferDialog } from "@/components/stock-transfer/view-stock-transfer-dialog"
import { DeleteStockTransferDialog } from "@/components/stock-transfer/delete-stock-transfer-dialog"

export interface StockTransferRow {
  id: number
  type: string
  transfer_no: string
  item_id: number
  storage_id?: number | null
  amount: number
  job_id: number
  unit_id?: number | null
  lot_no?: string | null
  style_id?: number | null
  stock_ledger_id?: number | null
  created_at: string
  updated_at: string
  item?: { id: number; name: string }
  job?: { id: number; name: string }
  storage?: { id: number; name: string; address?: string }
  unit?: { id: number; name: string }
}

interface StockTransferTableProps {
  search: string
  transferNo: string
  itemId: string
  jobId: string
  lotNo: string
  page: number
  size: number
  sortBy?: string
  sortDirection?: string
  onRefresh?: () => void
  onTotalChange?: (total: number) => void
}

export function StockTransferTable({
  search,
  transferNo,
  itemId,
  jobId,
  lotNo,
  page,
  size,
  sortBy,
  sortDirection,
  onRefresh,
  onTotalChange,
}: StockTransferTableProps) {
  const [data, setData] = useState<StockTransferRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    onTotalChange?.(total)
  }, [total, onTotalChange])
  const [editId, setEditId] = useState<number | null>(null)
  const [viewId, setViewId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const fetchTransfers = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = { page, size }
      if (search) params.search = search
      if (transferNo) params.transfer_no = transferNo
      if (itemId) params.item_id = itemId
      if (jobId) params.job_id = jobId
      if (lotNo) params.lot_no = lotNo
      if (sortBy) params.sort_by = sortBy
      if (sortDirection) params.sort_direction = sortDirection
      const res = await apiService.getStockTransfers(params)
      const body = res?.data as { data?: StockTransferRow[]; total?: number } | undefined
      setData(body?.data ?? [])
      setTotal(body?.total ?? 0)
    } catch (e) {
      console.error(e)
      toast.error("Failed to load stock transfers")
      setData([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [page, size, search, transferNo, itemId, jobId, lotNo, sortBy, sortDirection])

  const handleEdit = (row: StockTransferRow) => setEditId(row.id)
  const handleView = (row: StockTransferRow) => setViewId(row.id)
  const handleDelete = (row: StockTransferRow) => setDeleteId(row.id)

  const handleEditSuccess = () => {
    setEditId(null)
    fetchTransfers()
    onRefresh?.()
  }

  const handleDeleteSuccess = () => {
    setDeleteId(null)
    fetchTransfers()
    onRefresh?.()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold">#</TableHead>
            <TableHead className="font-semibold">Type</TableHead>
            <TableHead className="font-semibold">Item</TableHead>
            <TableHead className="font-semibold">Storage</TableHead>
            <TableHead className="text-right font-semibold">Quantity</TableHead>
            <TableHead className="font-semibold">Created</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                No stock transfers found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => {
              const unitName = row.unit?.name ?? (row.unit_id ? `#${row.unit_id}` : "")
              const quantityStr = unitName ? `${row.amount} ${unitName}` : String(row.amount)
              return (
              <TableRow key={row.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{row.transfer_no ?? "—"}</TableCell>
                <TableCell>
                  {row.type === "receipt" ? (
                    <Badge variant="default" className="gap-1">
                      <ArrowDownToLine className="h-3 w-3" />
                      Receipt
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <ArrowUpFromLine className="h-3 w-3" />
                      Issue
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{row.item?.name ?? `Item #${row.item_id}`}</TableCell>
                <TableCell>
                  <span title={row.storage ? (row.storage.address ?? row.storage.name) : undefined}>
                    {row.storage
                      ? getFirstNStoragePathSegments(row.storage.address ?? row.storage.name, 3) || row.storage.name
                      : row.storage_id
                        ? `#${row.storage_id}`
                        : "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums">{quantityStr}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(row)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(row)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(row)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
            })
          )}
        </TableBody>
      </Table>

      {editId != null && (
        <EditStockTransferDialog
          open={true}
          onOpenChange={(open: boolean) => !open && setEditId(null)}
          transferId={editId}
          onSuccess={handleEditSuccess}
        />
      )}
      {viewId != null && (
        <ViewStockTransferDialog
          open={true}
          onOpenChange={(open: boolean) => !open && setViewId(null)}
          transferId={viewId}
        />
      )}
      {deleteId != null && (
        <DeleteStockTransferDialog
          open={true}
          onOpenChange={(open: boolean) => !open && setDeleteId(null)}
          transferId={deleteId}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  )
}

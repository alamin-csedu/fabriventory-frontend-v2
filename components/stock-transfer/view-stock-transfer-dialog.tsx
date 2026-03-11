"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiService } from "@/lib/api"
import { getFirstNStoragePathSegments } from "@/lib/utils"
import { toast } from "sonner"
import { Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ViewStockTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transferId: number
}

export function ViewStockTransferDialog({
  open,
  onOpenChange,
  transferId,
}: ViewStockTransferDialogProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    if (!open || !transferId) return
    const load = async () => {
      setLoading(true)
      try {
        const res = await apiService.getStockTransfer(transferId)
        setData((res?.data as Record<string, unknown>) ?? null)
      } catch (e) {
        console.error(e)
        toast.error("Failed to load transfer")
        onOpenChange(false)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, transferId, onOpenChange])

  const item = data?.item as { name?: string } | undefined
  const job = data?.job as { name?: string } | undefined
  const storage = data?.storage as { name?: string; address?: string } | undefined
  const unit = data?.unit as { name?: string } | undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Stock transfer</DialogTitle>
          <DialogDescription>Transfer details</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : data ? (
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transfer #</span>
              <span className="font-medium">{String(data.transfer_no ?? "—")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              {data.type === "receipt" ? (
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
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Item</span>
              <span>{item?.name ?? `#${data.item_id}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Job</span>
              <span>{job?.name ?? `#${data.job_id}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage</span>
              <span title={storage ? (storage.address ?? storage.name) : undefined}>
                {data.storage_id != null
                  ? (storage
                    ? (storage.address ? getFirstNStoragePathSegments(storage.address, 3) : storage.name) ?? `#${data.storage_id}`
                    : `#${data.storage_id}`)
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="tabular-nums">{data.amount != null ? String(data.amount) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit</span>
              <span>{data.unit_id != null ? (unit?.name ?? `#${data.unit_id}`) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lot number</span>
              <span>{data.lot_no ? String(data.lot_no) : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{data.created_at ? new Date(String(data.created_at)).toLocaleString() : "—"}</span>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

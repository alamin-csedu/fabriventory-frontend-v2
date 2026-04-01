"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface EditStockTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transferId: number
  onSuccess?: () => void
}

export function EditStockTransferDialog({
  open,
  onOpenChange,
  transferId,
  onSuccess,
}: EditStockTransferDialogProps) {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [items, setItems] = useState<{ id: number; name: string }[]>([])
  const [storages, setStorages] = useState<{ id: number; name: string }[]>([])
  const [jobs, setJobs] = useState<{ id: number; name: string }[]>([])
  const [units, setUnits] = useState<{ id: number; name: string }[]>([])

  const [transferNo, setTransferNo] = useState("")
  const [itemId, setItemId] = useState("")
  const [storageId, setStorageId] = useState("")
  const [amount, setAmount] = useState("")
  const [jobId, setJobId] = useState("")
  const [unitId, setUnitId] = useState("")
  const [lotNo, setLotNo] = useState("")

  useEffect(() => {
    if (!open || !transferId) return
    const load = async () => {
      setFetching(true)
      try {
        const [transferRes, itemsRes, storagesRes, jobsRes, unitsRes] = await Promise.all([
          apiService.getStockTransfer(transferId),
          apiService.getItems({ page: 1, size: 500 }),
          apiService.getStorages({ page: 1, size: 500 }),
          apiService.getJobs({ page: 1, size: 500 }),
          apiService.getUnits({ page: 1, size: 500 }),
        ])
        const t = transferRes?.data as Record<string, unknown> | undefined
        if (t) {
          setTransferNo(String(t.transfer_no ?? ""))
          setItemId(t.item_id != null ? String(t.item_id) : "")
          setStorageId(t.storage_id != null ? String(t.storage_id) : "")
          setAmount(t.amount != null ? String(t.amount) : "")
          setJobId(t.job_id != null ? String(t.job_id) : "")
          setUnitId(t.unit_id != null ? String(t.unit_id) : "")
          setLotNo(String(t.lot_no ?? ""))
        }
        if (itemsRes?.data?.data) setItems(itemsRes.data.data)
        if (storagesRes?.data?.data) setStorages(storagesRes.data.data)
        if (jobsRes?.data?.data) setJobs(jobsRes.data.data)
        if (unitsRes?.data?.data) setUnits(unitsRes.data.data)
      } catch (e) {
        console.error(e)
        toast.error("Failed to load transfer")
        onOpenChange(false)
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [open, transferId, onOpenChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const itemIdNum = itemId ? Number(itemId) : undefined
    const jobIdNum = jobId ? Number(jobId) : undefined
    const amountNum = amount ? Number(amount) : undefined
    const storageIdNum = storageId ? Number(storageId) : undefined
    const unitIdNum = unitId ? Number(unitId) : undefined

    if (!itemIdNum || !jobIdNum || amountNum == null || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Item, Job, and Amount (positive) are required")
      return
    }

    setLoading(true)
    try {
      await apiService.updateStockTransfer(transferId, {
        transfer_no: transferNo.trim() || undefined,
        item_id: itemIdNum,
        job_id: jobIdNum,
        amount: amountNum,
        storage_id: storageIdNum ?? undefined,
        unit_id: unitIdNum ?? undefined,
        lot_no: lotNo.trim() || undefined,
      })
      toast.success("Stock transfer updated")
      onOpenChange(false)
      onSuccess?.()
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to update transfer"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit stock transfer</DialogTitle>
          <DialogDescription>Update transfer details. Storage stock is updated when storage_id is set.</DialogDescription>
        </DialogHeader>
        {fetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Transfer number</Label>
              <Input
                placeholder="Auto-generated if empty"
                value={transferNo}
                onChange={(e) => setTransferNo(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Item *</Label>
              <Combobox
                options={[{ value: "all", label: "Select item" }, ...items.map((i) => ({ value: String(i.id), label: i.name }))]}
                value={itemId || "all"}
                onValueChange={(v) => setItemId(v === "all" ? "" : String(v))}
                placeholder="Select item"
                searchPlaceholder="Search items..."
                emptyText="No item found."
              />
            </div>
            <div className="space-y-2">
              <Label>Job *</Label>
              <Combobox
                options={[{ value: "all", label: "Select job" }, ...jobs.map((j) => ({ value: String(j.id), label: (j as { name?: string }).name ?? "Job" }))]}
                value={jobId || "all"}
                onValueChange={(v) => setJobId(v === "all" ? "" : String(v))}
                placeholder="Select job"
                searchPlaceholder="Search jobs..."
                emptyText="No job found."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Storage</Label>
                <Combobox
                  options={[{ value: "all", label: "None" }, ...storages.map((s) => ({ value: String(s.id), label: s.name }))]}
                  value={storageId || "all"}
                  onValueChange={(v) => setStorageId(v === "all" ? "" : String(v))}
                  placeholder="None"
                  searchPlaceholder="Search storages..."
                  emptyText="No storage found."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Combobox
                  options={[{ value: "all", label: "None" }, ...units.map((u) => ({ value: String(u.id), label: (u as { name?: string }).name ?? "Unit" }))]}
                  value={unitId || "all"}
                  onValueChange={(v) => setUnitId(v === "all" ? "" : String(v))}
                  placeholder="None"
                  searchPlaceholder="Search units..."
                  emptyText="No unit found."
                />
              </div>
              <div className="space-y-2">
                <Label>Lot number</Label>
                <Input placeholder="LOT-12345" value={lotNo} onChange={(e) => setLotNo(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

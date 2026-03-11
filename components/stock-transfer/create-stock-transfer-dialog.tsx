"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { apiService } from "@/lib/api"
import { getFirstNStoragePathSegments } from "@/lib/utils"
import { toast } from "sonner"
import { Loader2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

interface StockByItemRow {
  item_id: number
  item: { id: number; name: string }
  total_quantity: number
  storages: Array<{
    storage_id: number
    storage: { id: number; name: string; address?: string }
    quantity: number
    unit_id: number
    unit: { id: number; name: string }
  }>
}

export interface CreateStockTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialItemId?: number
  initialStorageId?: number
}

export function CreateStockTransferDialog({
  open,
  onOpenChange,
  onSuccess,
  initialItemId,
  initialStorageId,
}: CreateStockTransferDialogProps) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<{ id: number; name: string }[]>([])
  const [storages, setStorages] = useState<{ id: number; name: string; address?: string }[]>([])
  const [units, setUnits] = useState<{ id: number; name: string }[]>([])
  const [itemsInStock, setItemsInStock] = useState<StockByItemRow[]>([])

  const [type, setType] = useState<"receipt" | "issue">("issue")
  const [itemId, setItemId] = useState<string>(initialItemId ? String(initialItemId) : "")
  const [storageId, setStorageId] = useState<string>(initialStorageId ? String(initialStorageId) : "")
  const [amount, setAmount] = useState<string>("")
  const [unitId, setUnitId] = useState<string>("")
  const [comment, setComment] = useState<string>("")

  useEffect(() => {
    if (initialItemId) setItemId(String(initialItemId))
    if (initialStorageId) setStorageId(String(initialStorageId))
  }, [initialItemId, initialStorageId, open])

  useEffect(() => {
    if (!open) return
    const load = async () => {
      try {
        const [itemsRes, storagesRes, unitsRes, stockRes] = await Promise.all([
          apiService.getItems({ page: 1, size: 500 }),
          apiService.getStorages({ page: 1, size: 500 }),
          apiService.getUnits({ page: 1, size: 500 }),
          apiService.getStorageStockGrouped({ group_by: "item", page: 1, size: 500 }),
        ])
        if (itemsRes?.data?.data) setItems(itemsRes.data.data)
        if (storagesRes?.data?.data) setStorages(storagesRes.data.data)
        if (unitsRes?.data?.data) setUnits(unitsRes.data.data)
        const stockData = (stockRes?.data as { data?: StockByItemRow[] })?.data
        if (stockData) setItemsInStock(stockData)
      } catch (e) {
        console.error(e)
        toast.error("Failed to load options")
      }
    }
    load()
  }, [open])

  const selectedItemInStock = useMemo(
    () => (type === "issue" && itemId ? itemsInStock.find((i) => String(i.item_id) === itemId) : null),
    [type, itemId, itemsInStock]
  )

  const issueItemOptions = useMemo(
    () =>
      itemsInStock.map((i) => ({
        value: String(i.item_id),
        label: i.item?.name ? `${i.item.name} (${i.total_quantity} in stock)` : `Item #${i.item_id}`,
      })),
    [itemsInStock]
  )

  const issueStorageOptions = useMemo(() => {
    if (!selectedItemInStock?.storages?.length) return []
    return selectedItemInStock.storages.map((s) => {
      const fullPath = s.storage?.address ?? s.storage?.name ?? `Storage #${s.storage_id}`
      const shortLabel = getFirstNStoragePathSegments(fullPath, 3) || fullPath
      return {
        value: String(s.storage_id),
        label: `${shortLabel} — ${s.quantity} ${s.unit?.name ?? ""}`.trim(),
        title: `${fullPath} — ${s.quantity} ${s.unit?.name ?? ""}`.trim(),
      }
    })
  }, [selectedItemInStock])

  // Only sync unit from storage when type is "issue". Do not clear unit when type is "receipt" or when storage changes in receipt mode.
  useEffect(() => {
    if (type === "issue" && selectedItemInStock) {
      if (storageId) {
        const storageRow = selectedItemInStock.storages?.find((s) => String(s.storage_id) === storageId)
        if (storageRow?.unit_id) setUnitId(String(storageRow.unit_id))
        else {
          const first = selectedItemInStock.storages?.[0]
          if (first?.unit_id) setUnitId(String(first.unit_id))
          else setUnitId("")
        }
      } else {
        const first = selectedItemInStock.storages?.[0]
        if (first?.unit_id) setUnitId(String(first.unit_id))
        else setUnitId("")
      }
    }
  }, [type, selectedItemInStock, storageId])

  useEffect(() => {
    if (type === "issue") {
      setStorageId("")
    }
  }, [type, itemId])

  // When switching to receipt, clear unit so user must select one (unit is required for receipt)
  useEffect(() => {
    if (type === "receipt") {
      setUnitId("")
    }
  }, [type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const itemIdNum = itemId ? Number(itemId) : undefined
    const amountNum = amount ? Number(amount) : undefined
    const storageIdNum = storageId ? Number(storageId) : undefined
    const unitIdNum = unitId ? Number(unitId) : undefined

    if (!itemIdNum || amountNum == null || isNaN(amountNum) || amountNum <= 0) {
      toast.error("Item and Amount (positive) are required")
      return
    }
    if (!comment.trim()) {
      toast.error("Comment is required")
      return
    }
    if (type === "issue" && !storageIdNum) {
      toast.error("For issue, please select a storage (where to issue from)")
      return
    }
    if (type === "receipt" && (!unitIdNum || unitId === "")) {
      toast.error("Unit is required for receipt")
      return
    }

    setLoading(true)
    try {
      await apiService.createStockTransfer({
        type,
        item_id: itemIdNum,
        amount: amountNum,
        ...(storageIdNum && { storage_id: storageIdNum }),
        ...(unitIdNum && { unit_id: unitIdNum }),
        comment: comment.trim(),
      })
      toast.success("Stock transfer created")
      onOpenChange(false)
      setAmount("")
      setComment("")
      onSuccess?.()
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Failed to create transfer"
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>New stock transfer</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "receipt" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setType("receipt")}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Receipt
            </Button>
            <Button
              type="button"
              variant={type === "issue" ? "default" : "outline"}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setType("issue")}
            >
              <ArrowUpFromLine className="h-4 w-4" />
              Issue
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Item *</Label>
            {type === "issue" ? (
              <Combobox
                options={[{ value: "all", label: "Select item in stock" }, ...issueItemOptions]}
                value={itemId || "all"}
                onValueChange={(v) => setItemId(v === "all" ? "" : String(v))}
                placeholder="Select item in stock"
                searchPlaceholder="Search items..."
                emptyText="No items in stock."
              />
            ) : (
              <Combobox
                options={[{ value: "all", label: "Select item" }, ...items.map((i) => ({ value: String(i.id), label: i.name }))]}
                value={itemId || "all"}
                onValueChange={(v) => setItemId(v === "all" ? "" : String(v))}
                placeholder="Select item"
                searchPlaceholder="Search items..."
                emptyText="No item found."
              />
            )}
          </div>

          {type === "issue" && selectedItemInStock && (
            <div className="space-y-2">
              <Label>Storage (from) *</Label>
              <Combobox
                options={issueStorageOptions}
                value={storageId || "all"}
                onValueChange={(v) => setStorageId(v === "all" ? "" : String(v))}
                placeholder="Select storage"
                searchPlaceholder="Search storages..."
                emptyText="No storage with this item."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (quantity) *</Label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            {type === "issue" ? (
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                  readOnly
                  className="bg-muted"
                  value={(() => {
                    if (!selectedItemInStock?.storages?.length) return "—"
                    const row = storageId
                      ? selectedItemInStock.storages.find((s) => String(s.storage_id) === storageId)
                      : selectedItemInStock.storages[0]
                    return row?.unit?.name ? `${row.unit.name} (auto)` : "—"
                  })()}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Combobox
                  options={units.map((u) => ({ value: String(u.id), label: (u as { name?: string }).name ?? `Unit ${u.id}` }))}
                  value={unitId || ""}
                  onValueChange={(v) => setUnitId(v === "" ? "" : String(v))}
                  placeholder="Select unit"
                  searchPlaceholder="Search units..."
                  emptyText="No unit found."
                />
              </div>
            )}
          </div>

          {type === "receipt" && (
            <div className="space-y-2">
              <Label>Storage (optional)</Label>
              <Combobox
                options={[
                  { value: "all", label: "None" },
                  ...storages.map((s) => {
                    const fullPath = s.address ?? s.name
                    const shortLabel = getFirstNStoragePathSegments(fullPath, 3) || fullPath
                    return { value: String(s.id), label: shortLabel, title: fullPath }
                  }),
                ]}
                value={storageId || "all"}
                onValueChange={(v) => setStorageId(v === "all" ? "" : String(v))}
                placeholder="None"
                searchPlaceholder="Search storages..."
                emptyText="No storage found."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Comment *</Label>
            <Textarea
              placeholder="e.g. Initial receipt"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[80px] resize-y"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Create transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

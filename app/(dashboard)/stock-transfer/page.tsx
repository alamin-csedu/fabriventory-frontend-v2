"use client"

import { useState, useEffect } from "react"
import { StockTransferTable } from "@/components/stock-transfer/stock-transfer-table"
import { CreateStockTransferDialog } from "@/components/stock-transfer/create-stock-transfer-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Plus, Search, Warehouse } from "lucide-react"
import { apiService } from "@/lib/api"

export default function StockTransferPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [transferNo, setTransferNo] = useState("")
  const [itemId, setItemId] = useState("")
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [addOpen, setAddOpen] = useState(false)
  const [items, setItems] = useState<{ id: number; name: string }[]>([])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    const load = async () => {
      try {
        const itemsRes = await apiService.getItems({ page: 1, size: 500 })
        if (itemsRes?.data?.data) setItems(itemsRes.data.data)
      } catch {
        // ignore
      }
    }
    load()
  }, [])

  const totalPages = Math.max(1, Math.ceil(total / size))
  const from = total === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, total)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Stock Transfer</h1>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Warehouse className="h-5 w-5" />
            Transfers
          </CardTitle>
          <CardDescription>List, filter, and manage stock transfers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search (transfer #, amount)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="Transfer #"
              value={transferNo}
              onChange={(e) => setTransferNo(e.target.value)}
              className="w-full sm:w-[160px]"
            />
            <Combobox
              options={[{ value: "all", label: "All items" }, ...items.map((i) => ({ value: String(i.id), label: i.name }))]}
              value={itemId || "all"}
              onValueChange={(v) => setItemId(v === "all" ? "" : String(v))}
              placeholder="All items"
              searchPlaceholder="Search items..."
              emptyText="No item found."
              className="w-full sm:w-[200px]"
            />
          </div>

          <div className="rounded-md border overflow-hidden">
            <StockTransferTable
              search={debouncedSearch}
              transferNo={transferNo}
              itemId={itemId}
              jobId=""
              lotNo=""
              page={page}
              size={size}
              onRefresh={() => setPage(1)}
              onTotalChange={setTotal}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              Showing {from} to {to} of {total} transfers
            </p>
            <div className="flex flex-nowrap items-center gap-4">
              {total > 0 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page > 1) setPage((p) => p - 1)
                        }}
                        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                          isActive={p === page}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (page < totalPages) setPage((p) => p + 1)
                        }}
                        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Per page:</span>
                <Combobox
                  options={[10, 20, 50].map((n) => ({ value: String(n), label: String(n) }))}
                  value={String(size)}
                  onValueChange={(v) => setSize(Number(v))}
                  placeholder="Size"
                  searchPlaceholder="Search..."
                  emptyText="No option."
                  className="w-[80px]"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateStockTransferDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={() => setPage(1)}
      />
    </div>
  )
}

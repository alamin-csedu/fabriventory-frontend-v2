"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import {
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  Warehouse,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Palette,
  MapPin,
  Layers,
} from "lucide-react"
import { cn, formatQuantity, getFirstNStoragePathSegments } from "@/lib/utils"

interface StorageStockRow {
  storage_id: number
  storage: { id: number; name: string; address?: string; parent_id: number | null; capacity: number }
  quantity: number
  unit_id: number
  unit: { id: number; name: string }
}

interface ItemStockRow {
  item_id: number
  item: {
    id: number
    name: string
    category_id?: number
    color_id?: number
    category?: { id: number; name: string }
    color?: { id: number; name: string; color_code?: string }
  }
  quantity: number
  unit_id: number
  unit: { id: number; name: string }
}

interface GroupedStockItem {
  item_id: number
  item: {
    id: number
    name: string
    category_id: number
    color_id: number
    attribute: string
    category?: { id: number; name: string }
    color?: { id: number; name: string; color_code?: string }
  }
  total_quantity: number
  storages: StorageStockRow[]
}

interface GroupedStockStorage {
  storage_id: number
  storage: { id: number; name: string; address?: string; parent_id: number | null; capacity: number }
  total_quantity: number
  items: ItemStockRow[]
}

type GroupByMode = "item" | "storage"

export default function StocksPage() {
  const [groupBy, setGroupBy] = useState<GroupByMode>("item")
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [itemFilter, setItemFilter] = useState<string>("")
  const [storageFilter, setStorageFilter] = useState<string>("")
  const [sortBy, setSortBy] = useState("total_quantity")
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [dataItem, setDataItem] = useState<GroupedStockItem[]>([])
  const [dataStorage, setDataStorage] = useState<GroupedStockStorage[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [items, setItems] = useState<{ id: number; name: string }[]>([])
  const [storages, setStorages] = useState<{ id: number; name: string }[]>([])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300)
    return () => clearTimeout(t)
  }, [searchTerm])

  // Load item and storage options for filters
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [itemsRes, storagesRes] = await Promise.all([
          apiService.getItems({ page: 1, size: 500 }),
          apiService.getStorages({ page: 1, size: 500 }),
        ])
        if (itemsRes?.data?.data) setItems(itemsRes.data.data)
        if (storagesRes?.data?.data) setStorages(storagesRes.data.data)
      } catch {
        // Non-blocking
      }
    }
    loadOptions()
  }, [])

  const fetchStocks = async () => {
    try {
      setLoading(true)
      const params: Record<string, string | number> = {
        group_by: groupBy,
        page: currentPage,
        size: pageSize,
        sort_by: sortBy,
        sort_direction: sortDirection,
      }
      if (debouncedSearch) params.search = debouncedSearch
      if (itemFilter) params.item_id = itemFilter
      if (storageFilter) params.storage_id = storageFilter

      const response = await apiService.getStorageStockGrouped(params)
      const body = response?.data as {
        data: GroupedStockItem[] | GroupedStockStorage[]
        page: number
        size: number
        total: number
        sort?: { sort_by: string; sort_direction: string }
      } | undefined
      if (body?.data) {
        if (groupBy === "item") {
          setDataItem(body.data as GroupedStockItem[])
          setDataStorage([])
        } else {
          setDataStorage(body.data as GroupedStockStorage[])
          setDataItem([])
        }
        setTotal(body.total ?? 0)
      } else {
        setDataItem([])
        setDataStorage([])
        setTotal(0)
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load stocks")
      setDataItem([])
      setDataStorage([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks()
  }, [groupBy, currentPage, pageSize, debouncedSearch, itemFilter, storageFilter, sortBy, sortDirection])

  const handleGroupByChange = (mode: GroupByMode) => {
    if (mode === groupBy) return
    setGroupBy(mode)
    setSortBy(mode === "item" ? "total_quantity" : "total_quantity")
    setExpandedRows(new Set())
    setCurrentPage(1)
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection((d) => (d === "ASC" ? "DESC" : "ASC"))
    } else {
      setSortBy(field)
      const defaultDesc = field === "total_quantity" || field === "quantity"
      setSortDirection(defaultDesc ? "DESC" : "ASC")
    }
    setCurrentPage(1)
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column)
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />
    return sortDirection === "ASC" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5" />
    )
  }

  const toggleRow = (itemId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }

  const qtyLabel = (qty: number, unitName: string) =>
    unitName ? `${formatQuantity(qty)} ${unitName}` : formatQuantity(qty)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, total)

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -left-1 top-1 bottom-1 w-1 rounded-full bg-gradient-to-b from-sky-500 via-primary to-violet-500 opacity-90" aria-hidden />
        <div className="pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Inventory
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Stocks
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground text-pretty">
            Group by item or storage, drill into locations, and scan quantities at a glance.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border/60 shadow-lg shadow-black/[0.04] ring-1 ring-black/[0.04] dark:ring-white/10">
        <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-transparent px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex rounded-xl border border-border/80 bg-background/80 p-1 shadow-inner backdrop-blur-sm">
              <Button
                variant={groupBy === "item" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 rounded-lg transition-all",
                  groupBy === "item" ? "shadow-sm ring-1 ring-border/60" : ""
                )}
                onClick={() => handleGroupByChange("item")}
              >
                <Package className="h-4 w-4" />
                By items
              </Button>
              <Button
                variant={groupBy === "storage" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2 rounded-lg transition-all",
                  groupBy === "storage" ? "shadow-sm ring-1 ring-border/60" : ""
                )}
                onClick={() => handleGroupByChange("storage")}
              >
                <Warehouse className="h-4 w-4" />
                By storage
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/50 bg-muted/20 p-3 sm:gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by item"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 border-border/60 bg-background pl-10 shadow-sm"
              />
            </div>
            {groupBy === "item" && (
              <Combobox
                options={[
                  { value: "all", label: "All items" },
                  ...items.map((i) => ({ value: String(i.id), label: i.name })),
                ]}
                value={itemFilter || "all"}
                onValueChange={(v) => setItemFilter(v === "all" ? "" : String(v))}
                placeholder="All items"
                searchPlaceholder="Search items..."
                emptyText="No item found."
                className="w-full sm:w-[200px]"
              />
            )}
            {groupBy === "storage" && (
              <Combobox
                options={[
                  { value: "all", label: "All storages" },
                  ...storages.map((s) => ({ value: String(s.id), label: s.name })),
                ]}
                value={storageFilter || "all"}
                onValueChange={(v) => setStorageFilter(v === "all" ? "" : String(v))}
                placeholder="All storages"
                searchPlaceholder="Search storages..."
                emptyText="No storage found."
                className="w-full sm:w-[200px]"
              />
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/60 bg-background/50 shadow-inner">
                {groupBy === "item" ? (
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="border-b bg-gradient-to-r from-muted/60 via-muted/40 to-transparent hover:bg-muted/50">
                        <TableHead className="w-12 px-3 py-3 font-semibold" />
                        <TableHead className="min-w-[200px] px-3 py-3 font-semibold">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-8 font-semibold hover:bg-muted/70"
                            onClick={() => handleSort("item_name")}
                          >
                            Item
                            <SortIcon column="item_name" />
                          </Button>
                        </TableHead>
                        <TableHead className="min-w-[120px] px-3 py-3 font-semibold">
                          Category
                        </TableHead>
                        <TableHead className="min-w-[100px] px-3 py-3 font-semibold">
                          Color
                        </TableHead>
                        <TableHead className="w-40 px-3 py-3 text-right font-semibold">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-mr-2 ml-auto flex h-8 font-semibold hover:bg-muted/70"
                            onClick={() => handleSort("total_quantity")}
                          >
                            Quantity
                            <SortIcon column="total_quantity" />
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataItem.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-12 text-muted-foreground"
                          >
                            No stock records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        dataItem.flatMap((row) => {
                          const isOpen = expandedRows.has(row.item_id)
                          const unitName = row.storages?.[0]?.unit?.name ?? ""
                          const quantityStr = qtyLabel(row.total_quantity, unitName)
                          return [
                            <TableRow
                              key={row.item_id}
                              className={cn(
                                "cursor-pointer border-b transition-colors odd:bg-muted/[0.25] hover:bg-muted/45",
                                isOpen &&
                                  "bg-primary/[0.12] odd:bg-primary/[0.12] hover:bg-primary/[0.16]"
                              )}
                              onClick={() => toggleRow(row.item_id)}
                              data-state={isOpen ? "open" : "closed"}
                            >
                              <TableCell
                                className={cn(
                                  "w-12 px-3 py-2.5 align-middle",
                                  isOpen && "border-l-[3px] border-l-primary"
                                )}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8 shrink-0",
                                    isOpen &&
                                      "text-primary hover:bg-primary/15 hover:text-primary"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleRow(row.item_id)
                                  }}
                                >
                                  {isOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="min-w-[200px] px-3 py-2.5 align-middle">
                                <div className="flex items-center gap-2">
                                  <Package
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isOpen ? "text-primary" : "text-muted-foreground"
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "font-medium",
                                      isOpen && "text-primary"
                                    )}
                                  >
                                    {row.item?.name ?? "—"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "min-w-[120px] px-3 py-2.5 align-middle",
                                  isOpen && "text-primary/90"
                                )}
                              >
                                {row.item?.category?.name ?? "—"}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "min-w-[100px] px-3 py-2.5 align-middle",
                                  isOpen && "text-primary/90"
                                )}
                              >
                                {row.item?.color?.name ?? "—"}
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "w-40 px-3 py-2.5 text-right align-middle font-medium tabular-nums",
                                  isOpen && "font-semibold text-primary"
                                )}
                              >
                                {quantityStr}
                              </TableCell>
                            </TableRow>,
                            ...(isOpen
                              ? [
                                  <TableRow
                                    key={`${row.item_id}-expand`}
                                    className="border-b bg-transparent hover:bg-transparent"
                                  >
                                    <TableCell colSpan={5} className="p-0">
                                      <div className="relative border-t border-border/60 bg-gradient-to-br from-sky-500/[0.04] via-muted/25 to-violet-500/[0.05] dark:from-sky-400/10 dark:to-violet-500/10">
                                        <div
                                          className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-sky-500 via-primary to-violet-500"
                                          aria-hidden
                                        />
                                        <div className="relative pl-4 pr-3 py-4 sm:pl-6 sm:pr-5">
                                          {row.storages?.length ? (
                                            <div className="mt-3 overflow-hidden rounded-xl border border-border/50 bg-background/90 shadow-sm">
                                              <Table>
                                                <TableHeader>
                                                  <TableRow className="border-b border-border/50 bg-muted/40 hover:bg-muted/40">
                                                    <TableHead className="h-10 w-12 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      #
                                                    </TableHead>
                                                    <TableHead className="h-10 min-w-[200px] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      Location
                                                    </TableHead>
                                                    <TableHead className="h-10 w-40 px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      Qty
                                                    </TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {row.storages.map((s, idx) => {
                                                    const path = s.storage
                                                      ? s.storage.address
                                                        ? getFirstNStoragePathSegments(
                                                            s.storage.address,
                                                            4
                                                          )
                                                        : s.storage.name
                                                      : "—"
                                                    const fullPath =
                                                      s.storage?.address ??
                                                      s.storage?.name ??
                                                      ""
                                                    return (
                                                      <TableRow
                                                        key={`${row.item_id}-${s.storage_id}`}
                                                        className="border-b border-border/30 transition-colors last:border-0 odd:bg-muted/[0.2] hover:bg-muted/40"
                                                      >
                                                        <TableCell className="px-2 py-2.5 text-center align-middle">
                                                          <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-muted/60 font-mono text-[11px] font-medium text-muted-foreground">
                                                            {idx + 1}
                                                          </span>
                                                        </TableCell>
                                                        <TableCell
                                                          className="max-w-[min(100vw,28rem)] px-3 py-2.5 text-sm leading-snug"
                                                          title={fullPath || undefined}
                                                        >
                                                          <span className="font-medium text-foreground">
                                                            {path ?? "—"}
                                                          </span>
                                                        </TableCell>
                                                        <TableCell className="px-3 py-2.5 text-right align-middle">
                                                          <span className="inline-flex rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-semibold tabular-nums text-primary">
                                                            {qtyLabel(
                                                              s.quantity,
                                                              s.unit?.name ?? ""
                                                            )}
                                                          </span>
                                                        </TableCell>
                                                      </TableRow>
                                                    )
                                                  })}
                                                </TableBody>
                                              </Table>
                                            </div>
                                          ) : (
                                            <p className="mt-3 rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
                                              No storage breakdown for this item.
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>,
                                ]
                              : []),
                          ]
                        })
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="border-b bg-gradient-to-r from-muted/60 via-muted/40 to-transparent hover:bg-muted/50">
                        <TableHead className="w-12 px-3 py-3 font-semibold" />
                        <TableHead className="min-w-[220px] px-3 py-3 font-semibold">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-ml-2 h-8 font-semibold hover:bg-muted/70"
                            onClick={() => handleSort("storage_name")}
                          >
                            Storage
                            <SortIcon column="storage_name" />
                          </Button>
                        </TableHead>
                        <TableHead className="w-40 px-3 py-3 text-right font-semibold">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="-mr-2 ml-auto flex h-8 font-semibold hover:bg-muted/70"
                            onClick={() => handleSort("total_quantity")}
                          >
                            Quantity
                            <SortIcon column="total_quantity" />
                          </Button>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dataStorage.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-12 text-muted-foreground"
                          >
                            No stock records found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        dataStorage.flatMap((row) => {
                          const isOpen = expandedRows.has(row.storage_id)
                          const unitName = row.items?.[0]?.unit?.name ?? ""
                          const quantityStr = qtyLabel(row.total_quantity, unitName)
                          const storageTitle = row.storage
                            ? row.storage.address
                              ? getFirstNStoragePathSegments(row.storage.address, 4)
                              : row.storage.name
                            : "—"
                          const storageFull = row.storage?.address ?? row.storage?.name ?? ""
                          return [
                            <TableRow
                              key={row.storage_id}
                              className={cn(
                                "cursor-pointer border-b transition-colors odd:bg-muted/[0.25] hover:bg-muted/45",
                                isOpen &&
                                  "bg-primary/[0.12] odd:bg-primary/[0.12] hover:bg-primary/[0.16]"
                              )}
                              onClick={() => toggleRow(row.storage_id)}
                              data-state={isOpen ? "open" : "closed"}
                            >
                              <TableCell
                                className={cn(
                                  "w-12 px-3 py-2.5 align-middle",
                                  isOpen && "border-l-[3px] border-l-primary"
                                )}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={cn(
                                    "h-8 w-8 shrink-0",
                                    isOpen &&
                                      "text-primary hover:bg-primary/15 hover:text-primary"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleRow(row.storage_id)
                                  }}
                                >
                                  {isOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              <TableCell className="min-w-[220px] px-3 py-2.5 align-middle">
                                <div className="flex items-center gap-2">
                                  <Warehouse
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      isOpen ? "text-primary" : "text-muted-foreground"
                                    )}
                                  />
                                  <span
                                    className={cn(
                                      "font-medium",
                                      isOpen && "text-primary"
                                    )}
                                    title={storageFull || undefined}
                                  >
                                    {storageTitle ?? "—"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell
                                className={cn(
                                  "w-40 px-3 py-2.5 text-right align-middle font-medium tabular-nums",
                                  isOpen && "font-semibold text-primary"
                                )}
                              >
                                {quantityStr}
                              </TableCell>
                            </TableRow>,
                            ...(isOpen
                              ? [
                                  <TableRow
                                    key={`${row.storage_id}-expand`}
                                    className="border-b bg-transparent hover:bg-transparent"
                                  >
                                    <TableCell colSpan={3} className="p-0">
                                      <div className="relative border-t border-border/60 bg-gradient-to-br from-violet-500/[0.05] via-muted/25 to-sky-500/[0.05] dark:from-violet-500/10 dark:to-sky-400/10">
                                        <div
                                          className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 via-primary to-sky-500"
                                          aria-hidden
                                        />
                                        <div className="relative pl-4 pr-3 py-4 sm:pl-6 sm:pr-5">
                                          {row.items?.length ? (
                                            <div className="overflow-hidden rounded-xl border border-border/50 bg-background/90 shadow-sm">
                                              <Table>
                                                <TableHeader>
                                                  <TableRow className="border-b border-border/50 bg-muted/40 hover:bg-muted/40">
                                                    <TableHead className="h-10 w-11 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      #
                                                    </TableHead>
                                                    <TableHead className="h-10 min-w-[160px] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      Item
                                                    </TableHead>
                                                    <TableHead className="h-10 min-w-[100px] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      Category
                                                    </TableHead>
                                                    <TableHead className="h-10 min-w-[88px] px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      Color
                                                    </TableHead>
                                                    <TableHead className="h-10 w-36 px-3 py-2 text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                      Qty
                                                    </TableHead>
                                                  </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                  {row.items.map((it, idx) => (
                                                    <TableRow
                                                      key={`${row.storage_id}-${it.item_id}`}
                                                      className="border-b border-border/30 transition-colors last:border-0 odd:bg-muted/[0.2] hover:bg-muted/40"
                                                    >
                                                      <TableCell className="px-2 py-2.5 text-center align-middle">
                                                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md bg-muted/60 font-mono text-[11px] font-medium text-muted-foreground">
                                                          {idx + 1}
                                                        </span>
                                                      </TableCell>
                                                      <TableCell className="px-3 py-2.5 text-sm font-medium">
                                                        {it.item?.name ?? "—"}
                                                      </TableCell>
                                                      <TableCell className="px-3 py-2.5 text-sm text-muted-foreground">
                                                        {it.item?.category?.name ?? "—"}
                                                      </TableCell>
                                                      <TableCell className="px-3 py-2.5 text-sm">
                                                        <span className="inline-flex items-center gap-2">
                                                          {it.item?.color?.color_code ? (
                                                            <span
                                                              className="h-2.5 w-2.5 shrink-0 rounded-full border border-border/80"
                                                              style={{
                                                                backgroundColor:
                                                                  it.item.color.color_code,
                                                              }}
                                                              aria-hidden
                                                            />
                                                          ) : null}
                                                          <span className="text-muted-foreground">
                                                            {it.item?.color?.name ?? "—"}
                                                          </span>
                                                        </span>
                                                      </TableCell>
                                                      <TableCell className="px-3 py-2.5 text-right align-middle">
                                                        <span className="inline-flex rounded-lg bg-violet-500/10 px-2.5 py-1 text-sm font-semibold tabular-nums text-violet-700 dark:text-violet-300">
                                                          {qtyLabel(
                                                            it.quantity,
                                                            it.unit?.name ?? ""
                                                          )}
                                                        </span>
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            </div>
                                          ) : (
                                            <p className="rounded-xl border border-dashed border-border/70 bg-background/40 px-4 py-8 text-center text-sm text-muted-foreground">
                                              No items in this storage.
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>,
                                ]
                              : []),
                          ]
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <div className="w-full sm:w-auto sm:flex-1 flex justify-center sm:justify-start">
                  <p className="text-sm text-muted-foreground whitespace-nowrap">
                    Showing {from} to {to} of {total}{" "}
                    {groupBy === "item" ? "items" : "storages"}
                  </p>
                </div>
                <div className="w-full sm:w-auto sm:flex-1 flex justify-center">
                  {total > 0 && (
                    <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) setCurrentPage((p) => p - 1)
                          }}
                          className={
                            currentPage <= 1
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                      {(() => {
                        const maxVisible = 7
                        const pages: (number | string)[] = []
                        if (totalPages <= maxVisible) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i)
                        } else {
                          pages.push(1)
                          if (currentPage > 4) pages.push("...")
                          const start = Math.max(2, currentPage - 2)
                          const end = Math.min(totalPages - 1, currentPage + 2)
                          for (let i = start; i <= end; i++) {
                            if (i !== 1 && i !== totalPages) pages.push(i)
                          }
                          if (currentPage < totalPages - 3) pages.push("...")
                          if (totalPages > 1) pages.push(totalPages)
                        }
                        return pages.map((page, index) => (
                          <PaginationItem key={index}>
                            {page === "..." ? (
                              <span className="px-3 py-2 text-muted-foreground">
                                …
                              </span>
                            ) : (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(page as number)
                                }}
                                isActive={page === currentPage}
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))
                      })()}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages)
                              setCurrentPage((p) => p + 1)
                          }}
                          className={
                            currentPage >= totalPages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  )}
                </div>
                <div className="w-full sm:w-auto sm:flex-1 flex justify-center sm:justify-end items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Per page:
                  </span>
                  <Combobox
                    options={[10, 20, 50].map((n) => ({
                      value: String(n),
                      label: String(n),
                    }))}
                    value={String(pageSize)}
                    onValueChange={(v) => setPageSize(Number(v))}
                    placeholder="Size"
                    searchPlaceholder="Search..."
                    emptyText="No option found."
                    className="w-[80px]"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Search, Boxes, ChevronDown, ChevronRight, Package, Warehouse, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn, getFirstNStoragePathSegments } from "@/lib/utils"

interface StorageStockRow {
  storage_id: number
  storage: { id: number; name: string; address?: string; parent_id: number | null; capacity: number }
  quantity: number
  unit_id: number
  unit: { id: number; name: string }
}

interface ItemStockRow {
  item_id: number
  item: { id: number; name: string; category_id?: number; color_id?: number }
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

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const to = Math.min(currentPage * pageSize, total)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-balance">Stocks</h1>
        <p className="text-muted-foreground text-pretty">
          View stock grouped by items or by storage, with pagination and filters
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex rounded-lg border-2 border-input p-1 bg-muted/30">
              <Button
                variant={groupBy === "item" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  groupBy === "item" ? "shadow-sm" : ""
                )}
                onClick={() => handleGroupByChange("item")}
              >
                <Package className="h-4 w-4" />
                By Items
              </Button>
              <Button
                variant={groupBy === "storage" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "gap-2",
                  groupBy === "storage" ? "shadow-sm" : ""
                )}
                onClick={() => handleGroupByChange("storage")}
              >
                <Warehouse className="h-4 w-4" />
                By Storage
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by quantity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                {groupBy === "item" ? (
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
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
                          const quantityStr = unitName
                            ? `${row.total_quantity} ${unitName}`
                            : String(row.total_quantity)
                          return [
                            <TableRow
                              key={row.item_id}
                              className="border-b transition-colors hover:bg-muted/30"
                            >
                              <TableCell className="w-12 px-3 py-2.5 align-middle">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => toggleRow(row.item_id)}
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
                                  <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="font-medium">
                                    {row.item?.name ?? "—"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="min-w-[120px] px-3 py-2.5 align-middle">
                                {row.item?.category?.name ?? "—"}
                              </TableCell>
                              <TableCell className="min-w-[100px] px-3 py-2.5 align-middle">
                                {row.item?.color?.name ?? "—"}
                              </TableCell>
                              <TableCell className="w-40 px-3 py-2.5 text-right align-middle font-medium tabular-nums">
                                {quantityStr}
                              </TableCell>
                            </TableRow>,
                            ...(isOpen && row.storages?.length
                              ? row.storages.map((s) => {
                                  const subUnit = s.unit?.name ?? ""
                                  const subQtyStr = subUnit
                                    ? `${s.quantity} ${subUnit}`
                                    : String(s.quantity)
                                  return (
                                    <TableRow
                                      key={`${row.item_id}-${s.storage_id}`}
                                      className="border-b bg-muted/20 hover:bg-muted/30"
                                    >
                                      <TableCell className="w-12 px-3 py-2" />
                                      <TableCell
                                        colSpan={1}
                                        className="min-w-[200px] pl-12 pr-3 py-2 align-middle"
                                      >
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Warehouse className="h-3.5 w-3.5 shrink-0" />
                                          <span className="text-sm" title={s.storage ? (s.storage.address ?? s.storage.name) : undefined}>
                                            {s.storage
                                              ? (s.storage.address ? getFirstNStoragePathSegments(s.storage.address, 3) : s.storage.name) ?? "—"
                                              : "—"}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="min-w-[120px] px-3 py-2 align-middle text-muted-foreground text-sm">
                                        —
                                      </TableCell>
                                      <TableCell className="min-w-[100px] px-3 py-2 align-middle text-muted-foreground text-sm">
                                        —
                                      </TableCell>
                                      <TableCell className="w-40 px-3 py-2 text-right align-middle tabular-nums text-sm">
                                        {subQtyStr}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
                              : []),
                          ]
                        })
                      )}
                    </TableBody>
                  </Table>
                ) : (
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
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
                          const quantityStr = unitName
                            ? `${row.total_quantity} ${unitName}`
                            : String(row.total_quantity)
                          return [
                            <TableRow
                              key={row.storage_id}
                              className="border-b transition-colors hover:bg-muted/30"
                            >
                              <TableCell className="w-12 px-3 py-2.5 align-middle">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 shrink-0"
                                  onClick={() => toggleRow(row.storage_id)}
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
                                  <Warehouse className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="font-medium" title={row.storage ? (row.storage.address ?? row.storage.name) : undefined}>
                                    {row.storage
                                      ? (row.storage.address ? getFirstNStoragePathSegments(row.storage.address, 3) : row.storage.name) ?? "—"
                                      : "—"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="w-40 px-3 py-2.5 text-right align-middle font-medium tabular-nums">
                                {quantityStr}
                              </TableCell>
                            </TableRow>,
                            ...(isOpen && row.items?.length
                              ? row.items.map((it) => {
                                  const subUnit = it.unit?.name ?? ""
                                  const subQtyStr = subUnit
                                    ? `${it.quantity} ${subUnit}`
                                    : String(it.quantity)
                                  return (
                                    <TableRow
                                      key={`${row.storage_id}-${it.item_id}`}
                                      className="border-b bg-muted/20 hover:bg-muted/30"
                                    >
                                      <TableCell className="w-12 px-3 py-2" />
                                      <TableCell
                                        colSpan={1}
                                        className="min-w-[220px] pl-12 pr-3 py-2 align-middle"
                                      >
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                          <Package className="h-3.5 w-3.5 shrink-0" />
                                          <span className="text-sm">
                                            {it.item?.name ?? "—"}
                                          </span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="w-40 px-3 py-2 text-right align-middle tabular-nums text-sm">
                                        {subQtyStr}
                                      </TableCell>
                                    </TableRow>
                                  )
                                })
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

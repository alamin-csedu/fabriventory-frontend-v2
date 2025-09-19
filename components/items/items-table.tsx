"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
import { EditItemDialog } from "./edit-item-dialog"
import { DeleteItemDialog } from "./delete-item-dialog"
import { ViewItemDialog } from "./view-item-dialog"

interface Item {
  id: number
  name: string
  uom: string
  category: string
  currentStock: number
  minStock: number
  maxStock: number
  unitPrice: number
  totalValue: number
  createdAt: string
  status: "active" | "inactive" | "low-stock"
}

interface ItemsTableProps {
  searchTerm: string
  categoryFilter: string
}

export function ItemsTable({ searchTerm, categoryFilter }: ItemsTableProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockItems: Item[] = [
      {
        id: 1,
        name: "Cotton Fabric - Blue",
        uom: "Meters",
        category: "cotton",
        currentStock: 850,
        minStock: 100,
        maxStock: 1000,
        unitPrice: 25.5,
        totalValue: 21675,
        createdAt: "2024-01-15",
        status: "active",
      },
      {
        id: 2,
        name: "Silk Blend - White",
        uom: "Meters",
        category: "silk",
        currentStock: 420,
        minStock: 50,
        maxStock: 500,
        unitPrice: 45.0,
        totalValue: 18900,
        createdAt: "2024-01-20",
        status: "active",
      },
      {
        id: 3,
        name: "Denim - Dark Blue",
        uom: "Meters",
        category: "denim",
        currentStock: 300,
        minStock: 200,
        maxStock: 600,
        unitPrice: 30.0,
        totalValue: 9000,
        createdAt: "2024-02-01",
        status: "active",
      },
      {
        id: 4,
        name: "Polyester - Black",
        uom: "Meters",
        category: "synthetic",
        currentStock: 45,
        minStock: 100,
        maxStock: 400,
        unitPrice: 18.5,
        totalValue: 832.5,
        createdAt: "2024-02-05",
        status: "low-stock",
      },
      {
        id: 5,
        name: "Wool Blend - Gray",
        uom: "Meters",
        category: "wool",
        currentStock: 0,
        minStock: 50,
        maxStock: 200,
        unitPrice: 55.0,
        totalValue: 0,
        createdAt: "2024-02-10",
        status: "inactive",
      },
      {
        id: 6,
        name: "Cotton Canvas - Natural",
        uom: "Meters",
        category: "cotton",
        currentStock: 680,
        minStock: 100,
        maxStock: 800,
        unitPrice: 22.0,
        totalValue: 14960,
        createdAt: "2024-02-15",
        status: "active",
      },
    ]

    setTimeout(() => {
      setItems(mockItems)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleEdit = (item: Item) => {
    setSelectedItem(item)
    setEditDialogOpen(true)
  }

  const handleDelete = (item: Item) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleView = (item: Item) => {
    setSelectedItem(item)
    setViewDialogOpen(true)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (item: Item) => {
    if (item.status === "low-stock" || item.currentStock <= item.minStock) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Low Stock
        </Badge>
      )
    }
    if (item.status === "inactive" || item.currentStock === 0) {
      return <Badge variant="secondary">Out of Stock</Badge>
    }
    return <Badge variant="default">In Stock</Badge>
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
              <TableHead>Item Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>UOM</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="capitalize">{item.category}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{item.currentStock}</span>
                      {item.currentStock <= item.minStock && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(item.totalValue)}</TableCell>
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(item)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(item)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive">
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

      {selectedItem && (
        <>
          <EditItemDialog
            item={selectedItem}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              setEditDialogOpen(false)
            }}
          />
          <DeleteItemDialog
            item={selectedItem}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => {
              setItems(items.filter((i) => i.id !== selectedItem.id))
              setDeleteDialogOpen(false)
            }}
          />
          <ViewItemDialog item={selectedItem} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        </>
      )}
    </>
  )
}

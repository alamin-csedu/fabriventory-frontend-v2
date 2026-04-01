"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { EditSupplierDialog } from "./edit-supplier-dialog"
import { DeleteSupplierDialog } from "./delete-supplier-dialog"
import { ViewSupplierDialog } from "./view-supplier-dialog"

interface Supplier {
  id: number
  name: string
  createdAt: string
  purchaseOrdersCount: number
  totalValue: number
  status: "active" | "inactive"
  rating: number
}

interface SuppliersTableProps {
  searchTerm: string
}

export function SuppliersTable({ searchTerm }: SuppliersTableProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: 1,
        name: "XYZ Fabrics Ltd",
        createdAt: "2024-01-10",
        purchaseOrdersCount: 25,
        totalValue: 350000,
        status: "active",
        rating: 4.8,
      },
      {
        id: 2,
        name: "Premium Textiles Co",
        createdAt: "2024-01-18",
        purchaseOrdersCount: 18,
        totalValue: 280000,
        status: "active",
        rating: 4.5,
      },
      {
        id: 3,
        name: "Global Fabric Supply",
        createdAt: "2024-02-05",
        purchaseOrdersCount: 32,
        totalValue: 420000,
        status: "active",
        rating: 4.9,
      },
      {
        id: 4,
        name: "Quality Materials Inc",
        createdAt: "2024-02-12",
        purchaseOrdersCount: 12,
        totalValue: 150000,
        status: "inactive",
        rating: 4.2,
      },
      {
        id: 5,
        name: "Eco Fabrics Solutions",
        createdAt: "2024-02-20",
        purchaseOrdersCount: 8,
        totalValue: 95000,
        status: "active",
        rating: 4.6,
      },
    ]

    setTimeout(() => {
      setSuppliers(mockSuppliers)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setEditDialogOpen(true)
  }

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setDeleteDialogOpen(true)
  }

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
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

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{rating}</span>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={`text-xs ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}>
              ★
            </span>
          ))}
        </div>
      </div>
    )
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Purchase Orders</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No suppliers found
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow
                  key={supplier.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleView(supplier)}
                >
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <Badge variant={supplier.status === "active" ? "default" : "secondary"}>{supplier.status}</Badge>
                  </TableCell>
                  <TableCell>{supplier.purchaseOrdersCount}</TableCell>
                  <TableCell>{formatCurrency(supplier.totalValue)}</TableCell>
                  <TableCell>{renderRating(supplier.rating)}</TableCell>
                  <TableCell>{formatDate(supplier.createdAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(supplier)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(supplier)} className="text-destructive">
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

      {selectedSupplier && (
        <>
          <EditSupplierDialog
            supplier={selectedSupplier}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              setEditDialogOpen(false)
            }}
          />
          <DeleteSupplierDialog
            supplier={selectedSupplier}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => {
              setSuppliers(suppliers.filter((s) => s.id !== selectedSupplier.id))
              setDeleteDialogOpen(false)
            }}
          />
          <ViewSupplierDialog supplier={selectedSupplier} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        </>
      )}
    </>
  )
}

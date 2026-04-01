"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { EditPurchaseInvoiceDialog } from "./edit-purchase-invoice-dialog"
import { DeletePurchaseInvoiceDialog } from "./delete-purchase-invoice-dialog"
import { ViewPurchaseInvoiceDialog } from "./view-purchase-invoice-dialog"

interface PurchaseInvoice {
  id: number
  piNo: string
  piQty: number
  supplierId: number
  supplierName: string
  unitPrice: number
  totalValue: number
  createdAt: string
  status: "draft" | "pending" | "approved" | "paid" | "cancelled"
}

interface PurchaseInvoicesTableProps {
  searchTerm: string
  statusFilter: string
}

export function PurchaseInvoicesTable({ searchTerm, statusFilter }: PurchaseInvoicesTableProps) {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockInvoices: PurchaseInvoice[] = [
      {
        id: 1,
        piNo: "PI-2024-001",
        piQty: 1000,
        supplierId: 1,
        supplierName: "XYZ Fabrics Ltd",
        unitPrice: 25.5,
        totalValue: 25500,
        createdAt: "2024-01-15",
        status: "approved",
      },
      {
        id: 2,
        piNo: "PI-2024-002",
        piQty: 800,
        supplierId: 2,
        supplierName: "Premium Textiles Co",
        unitPrice: 35.0,
        totalValue: 28000,
        createdAt: "2024-01-20",
        status: "pending",
      },
      {
        id: 3,
        piNo: "PI-2024-003",
        piQty: 1500,
        supplierId: 3,
        supplierName: "Global Fabric Supply",
        unitPrice: 28.0,
        totalValue: 42000,
        createdAt: "2024-02-01",
        status: "paid",
      },
      {
        id: 4,
        piNo: "PI-2024-004",
        piQty: 600,
        supplierId: 1,
        supplierName: "XYZ Fabrics Ltd",
        unitPrice: 30.0,
        totalValue: 18000,
        createdAt: "2024-02-05",
        status: "draft",
      },
      {
        id: 5,
        piNo: "PI-2024-005",
        piQty: 400,
        supplierId: 4,
        supplierName: "Quality Materials Inc",
        unitPrice: 22.5,
        totalValue: 9000,
        createdAt: "2024-02-10",
        status: "cancelled",
      },
      {
        id: 6,
        piNo: "PI-2024-006",
        piQty: 1200,
        supplierId: 5,
        supplierName: "Eco Fabrics Solutions",
        unitPrice: 26.75,
        totalValue: 32100,
        createdAt: "2024-02-15",
        status: "approved",
      },
    ]

    setTimeout(() => {
      setInvoices(mockInvoices)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.piNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEdit = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice)
    setEditDialogOpen(true)
  }

  const handleDelete = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice)
    setDeleteDialogOpen(true)
  }

  const handleView = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice)
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "secondary" as const, label: "Draft" },
      pending: { variant: "default" as const, label: "Pending" },
      approved: { variant: "default" as const, label: "Approved" },
      paid: { variant: "default" as const, label: "Paid" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    }
    const config = statusConfig[status as keyof typeof statusConfig]
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
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>PI Number</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow
                  key={invoice.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleView(invoice)}
                >
                  <TableCell className="font-medium font-mono text-sm">{invoice.piNo}</TableCell>
                  <TableCell>{invoice.supplierName}</TableCell>
                  <TableCell>{invoice.piQty.toLocaleString()}</TableCell>
                  <TableCell>{formatCurrency(invoice.unitPrice)}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalValue)}</TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(invoice)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(invoice)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(invoice)} className="text-destructive">
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

      {selectedInvoice && (
        <>
          <EditPurchaseInvoiceDialog
            invoice={selectedInvoice}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              setEditDialogOpen(false)
            }}
          />
          <DeletePurchaseInvoiceDialog
            invoice={selectedInvoice}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => {
              setInvoices(invoices.filter((i) => i.id !== selectedInvoice.id))
              setDeleteDialogOpen(false)
            }}
          />
          <ViewPurchaseInvoiceDialog invoice={selectedInvoice} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        </>
      )}
    </>
  )
}

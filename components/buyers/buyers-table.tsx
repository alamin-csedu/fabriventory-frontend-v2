"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { EditBuyerDialog } from "./edit-buyer-dialog"
import { DeleteBuyerDialog } from "./delete-buyer-dialog"
import { ViewBuyerDialog } from "./view-buyer-dialog"

interface Buyer {
  id: number
  name: string
  createdAt: string
  contractsCount: number
  totalValue: number
  status: "active" | "inactive"
}

interface BuyersTableProps {
  searchTerm: string
}

export function BuyersTable({ searchTerm }: BuyersTableProps) {
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockBuyers: Buyer[] = [
      {
        id: 1,
        name: "ABC Textiles Ltd",
        createdAt: "2024-01-15",
        contractsCount: 12,
        totalValue: 245000,
        status: "active",
      },
      {
        id: 2,
        name: "Fashion Forward Inc",
        createdAt: "2024-01-20",
        contractsCount: 8,
        totalValue: 180000,
        status: "active",
      },
      {
        id: 3,
        name: "Global Garments Co",
        createdAt: "2024-02-01",
        contractsCount: 15,
        totalValue: 320000,
        status: "active",
      },
      {
        id: 4,
        name: "Style Solutions",
        createdAt: "2024-02-10",
        contractsCount: 5,
        totalValue: 95000,
        status: "inactive",
      },
      {
        id: 5,
        name: "Premium Apparel",
        createdAt: "2024-02-15",
        contractsCount: 20,
        totalValue: 450000,
        status: "active",
      },
    ]

    setTimeout(() => {
      setBuyers(mockBuyers)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredBuyers = buyers.filter((buyer) => buyer.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEdit = (buyer: Buyer) => {
    setSelectedBuyer(buyer)
    setEditDialogOpen(true)
  }

  const handleDelete = (buyer: Buyer) => {
    setSelectedBuyer(buyer)
    setDeleteDialogOpen(true)
  }

  const handleView = (buyer: Buyer) => {
    setSelectedBuyer(buyer)
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
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Contracts</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBuyers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No buyers found
                </TableCell>
              </TableRow>
            ) : (
              filteredBuyers.map((buyer) => (
                <TableRow
                  key={buyer.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleView(buyer)}
                >
                  <TableCell className="font-medium">{buyer.name}</TableCell>
                  <TableCell>
                    <Badge variant={buyer.status === "active" ? "default" : "secondary"}>{buyer.status}</Badge>
                  </TableCell>
                  <TableCell>{buyer.contractsCount}</TableCell>
                  <TableCell>{formatCurrency(buyer.totalValue)}</TableCell>
                  <TableCell>{formatDate(buyer.createdAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(buyer)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(buyer)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(buyer)} className="text-destructive">
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

      {selectedBuyer && (
        <>
          <EditBuyerDialog
            buyer={selectedBuyer}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              // Refresh buyers list
              setEditDialogOpen(false)
            }}
          />
          <DeleteBuyerDialog
            buyer={selectedBuyer}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => {
              // Remove buyer from list
              setBuyers(buyers.filter((b) => b.id !== selectedBuyer.id))
              setDeleteDialogOpen(false)
            }}
          />
          <ViewBuyerDialog buyer={selectedBuyer} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        </>
      )}
    </>
  )
}

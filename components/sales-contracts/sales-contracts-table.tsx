"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { EditSalesContractDialog } from "./edit-sales-contract-dialog"
import { DeleteSalesContractDialog } from "./delete-sales-contract-dialog"
import { ViewSalesContractDialog } from "./view-sales-contract-dialog"

interface SalesContract {
  id: number
  contractNo: string
  buyerId: number
  buyerName: string
  style: string
  jobNo: string
  btbLcNo: string
  createdAt: string
  status: "draft" | "active" | "completed" | "cancelled"
  value: number
}

interface SalesContractsTableProps {
  searchTerm: string
  statusFilter: string
}

export function SalesContractsTable({ searchTerm, statusFilter }: SalesContractsTableProps) {
  const [contracts, setContracts] = useState<SalesContract[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContract, setSelectedContract] = useState<SalesContract | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockContracts: SalesContract[] = [
      {
        id: 1,
        contractNo: "SC-2024-001",
        buyerId: 1,
        buyerName: "ABC Textiles Ltd",
        style: "Summer Collection 2024",
        jobNo: "JOB-001",
        btbLcNo: "LC-2024-001",
        createdAt: "2024-01-15",
        status: "active",
        value: 250000,
      },
      {
        id: 2,
        contractNo: "SC-2024-002",
        buyerId: 2,
        buyerName: "Fashion Forward Inc",
        style: "Spring Casual Line",
        jobNo: "JOB-002",
        btbLcNo: "LC-2024-002",
        createdAt: "2024-01-20",
        status: "active",
        value: 180000,
      },
      {
        id: 3,
        contractNo: "SC-2024-003",
        buyerId: 3,
        buyerName: "Global Garments Co",
        style: "Winter Collection",
        jobNo: "JOB-003",
        btbLcNo: "LC-2024-003",
        createdAt: "2024-02-01",
        status: "completed",
        value: 320000,
      },
      {
        id: 4,
        contractNo: "SC-2024-004",
        buyerId: 1,
        buyerName: "ABC Textiles Ltd",
        style: "Formal Wear Series",
        jobNo: "JOB-004",
        btbLcNo: "LC-2024-004",
        createdAt: "2024-02-05",
        status: "draft",
        value: 150000,
      },
      {
        id: 5,
        contractNo: "SC-2024-005",
        buyerId: 4,
        buyerName: "Style Solutions",
        style: "Athletic Wear",
        jobNo: "JOB-005",
        btbLcNo: "LC-2024-005",
        createdAt: "2024-02-10",
        status: "cancelled",
        value: 95000,
      },
    ]

    setTimeout(() => {
      setContracts(mockContracts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contractNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.jobNo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleEdit = (contract: SalesContract) => {
    setSelectedContract(contract)
    setEditDialogOpen(true)
  }

  const handleDelete = (contract: SalesContract) => {
    setSelectedContract(contract)
    setDeleteDialogOpen(true)
  }

  const handleView = (contract: SalesContract) => {
    setSelectedContract(contract)
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
      active: { variant: "default" as const, label: "Active" },
      completed: { variant: "default" as const, label: "Completed" },
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contract No.</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Style</TableHead>
              <TableHead>Job No.</TableHead>
              <TableHead>BTB LC No.</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No contracts found
                </TableCell>
              </TableRow>
            ) : (
              filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium font-mono text-sm">{contract.contractNo}</TableCell>
                  <TableCell>{contract.buyerName}</TableCell>
                  <TableCell>{contract.style}</TableCell>
                  <TableCell className="font-mono text-sm">{contract.jobNo}</TableCell>
                  <TableCell className="font-mono text-sm">{contract.btbLcNo}</TableCell>
                  <TableCell>{formatCurrency(contract.value)}</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>{formatDate(contract.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(contract)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(contract)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(contract)} className="text-destructive">
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

      {selectedContract && (
        <>
          <EditSalesContractDialog
            contract={selectedContract}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              setEditDialogOpen(false)
            }}
          />
          <DeleteSalesContractDialog
            contract={selectedContract}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => {
              setContracts(contracts.filter((c) => c.id !== selectedContract.id))
              setDeleteDialogOpen(false)
            }}
          />
          <ViewSalesContractDialog contract={selectedContract} open={viewDialogOpen} onOpenChange={setViewDialogOpen} />
        </>
      )}
    </>
  )
}

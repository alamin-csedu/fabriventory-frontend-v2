"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { EditInventoryTransactionDialog } from "./edit-inventory-transaction-dialog"
import { DeleteInventoryTransactionDialog } from "./delete-inventory-transaction-dialog"
import { ViewInventoryTransactionDialog } from "./view-inventory-transaction-dialog"

interface InventoryTransaction {
  id: number
  transactionDate: string
  buyerId?: number
  supplierId?: number
  salesContractId?: number
  purchaseInvoiceId?: number
  itemId: number
  color: string
  openingBalance: number
  receivedQty: number
  issueQty: number
  closingBalance: number
  issueLocation?: string
  rate: number
  receivedValue: number
  issueValue: number
  closingValue: number
  weightWastage: number
  remarks: string
  createdAt: string
  // Related data
  buyerName?: string
  supplierName?: string
  salesContractNo?: string
  purchaseInvoiceNo?: string
  itemName: string
  itemUom: string
}

interface InventoryTransactionsTableProps {
  searchTerm: string
  typeFilter: string
  onRefresh?: React.MutableRefObject<(() => void) | null>
}

export function InventoryTransactionsTable({ searchTerm, typeFilter, onRefresh }: InventoryTransactionsTableProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<InventoryTransaction | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  // Fetch inventory transactions from API
  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8080/api/v1/inventory-transactions?page=1&page_size=50')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        // Transform API data to match our interface
        const transformedTransactions: InventoryTransaction[] = result.data.map((item: any) => ({
          id: item.id,
          transactionDate: item.transaction_date,
          buyerId: item.buyer_id,
          supplierId: item.supplier_id,
          salesContractId: item.sales_contract_id,
          purchaseInvoiceId: item.purchase_invoice_id,
          itemId: item.item_id,
          color: item.color,
          openingBalance: item.opening_balance,
          receivedQty: item.received_qty,
          issueQty: item.issue_qty,
          closingBalance: item.closing_balance,
          issueLocation: item.issue_location,
          rate: item.rate,
          receivedValue: item.received_value,
          issueValue: item.issue_value,
          closingValue: item.closing_value,
          weightWastage: item.weight_wastage,
          remarks: item.remarks,
          createdAt: item.created_at,
          // Related data from API
          buyerName: item.buyer?.name,
          supplierName: item.supplier?.name,
          salesContractNo: item.sales_contract?.contract_no,
          purchaseInvoiceNo: item.purchase_invoice?.pi_no,
          itemName: item.item?.name,
          itemUom: item.item?.uom,
        }))
        
        setTransactions(transformedTransactions)
      } else {
        console.error('API response error:', result.message)
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching inventory transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  // Expose refresh function to parent component
  useEffect(() => {
    if (onRefresh) {
      onRefresh.current = fetchTransactions
    }
  }, [onRefresh, fetchTransactions])

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.remarks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.supplierName && transaction.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (transaction.buyerName && transaction.buyerName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const isReceipt = transaction.receivedQty > 0
    const isIssue = transaction.issueQty > 0
    
    let matchesType = true
    if (typeFilter === "receipt") {
      matchesType = isReceipt
    } else if (typeFilter === "issue") {
      matchesType = isIssue
    }
    
    return matchesSearch && matchesType
  })

  const handleEdit = (transaction: InventoryTransaction) => {
    setSelectedTransaction(transaction)
    setEditDialogOpen(true)
  }

  const handleDelete = (transaction: InventoryTransaction) => {
    setSelectedTransaction(transaction)
    setDeleteDialogOpen(true)
  }

  const handleView = (transaction: InventoryTransaction) => {
    setSelectedTransaction(transaction)
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

  const getTransactionType = (transaction: InventoryTransaction) => {
    if (transaction.receivedQty > 0) {
      return { variant: "default" as const, label: "Receipt" }
    } else if (transaction.issueQty > 0) {
      return { variant: "secondary" as const, label: "Issue" }
    }
    return { variant: "outline" as const, label: "Adjustment" }
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
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Opening</TableHead>
              <TableHead>Received</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Closing</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="w-[70px] text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => {
                const typeConfig = getTransactionType(transaction)
                return (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.transactionDate)}</TableCell>
                    <TableCell>
                      <Badge variant={typeConfig.variant}>{typeConfig.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.itemName}</div>
                        <div className="text-sm text-muted-foreground">{transaction.itemUom}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: transaction.color.toLowerCase() }}
                        />
                        {transaction.color}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.openingBalance.toLocaleString()}</TableCell>
                    <TableCell className={transaction.receivedQty > 0 ? "text-green-600 font-medium" : ""}>
                      {transaction.receivedQty > 0 ? `+${transaction.receivedQty.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className={transaction.issueQty > 0 ? "text-red-600 font-medium" : ""}>
                      {transaction.issueQty > 0 ? `-${transaction.issueQty.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell className="font-medium">{transaction.closingBalance.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(transaction.rate)}</TableCell>
                    <TableCell>{formatCurrency(transaction.closingValue)}</TableCell>
                    <TableCell className="text-center">
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          className="h-8 w-8 p-0 hover:bg-muted"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('Button clicked for transaction:', transaction.id)
                            // Toggle dropdown visibility
                            const dropdown = e.currentTarget.nextElementSibling as HTMLElement
                            if (dropdown) {
                              dropdown.classList.toggle('hidden')
                            }
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 hidden">
                          <div className="py-1">
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('View clicked for transaction:', transaction.id)
                                handleView(transaction)
                                // Hide dropdown
                                const dropdown = e.currentTarget.closest('.absolute') as HTMLElement
                                if (dropdown) {
                                  dropdown.classList.add('hidden')
                                }
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('Edit clicked for transaction:', transaction.id)
                                handleEdit(transaction)
                                // Hide dropdown
                                const dropdown = e.currentTarget.closest('.absolute') as HTMLElement
                                if (dropdown) {
                                  dropdown.classList.add('hidden')
                                }
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center text-red-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('Delete clicked for transaction:', transaction.id)
                                handleDelete(transaction)
                                // Hide dropdown
                                const dropdown = e.currentTarget.closest('.absolute') as HTMLElement
                                if (dropdown) {
                                  dropdown.classList.add('hidden')
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTransaction && (
        <>
          <EditInventoryTransactionDialog
            transaction={selectedTransaction}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={() => {
              fetchTransactions()
              setEditDialogOpen(false)
            }}
          />
          <DeleteInventoryTransactionDialog
            transaction={selectedTransaction}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={() => {
              fetchTransactions()
              setDeleteDialogOpen(false)
            }}
          />
          <ViewInventoryTransactionDialog 
            transaction={selectedTransaction} 
            open={viewDialogOpen} 
            onOpenChange={setViewDialogOpen} 
          />
        </>
      )}
    </>
  )
}

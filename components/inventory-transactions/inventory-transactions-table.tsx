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

// Dummy data fallback when API fails
const DUMMY_DATA = {
  "success": true,
  "message": "records listed successfully",
  "data": [
    {
      "id": 11,
      "transaction_date": "2025-08-18T01:20:47.495334+06:00",
      "buyer_id": 5,
      "supplier_id": null,
      "sales_contract_id": 5,
      "purchase_invoice_id": null,
      "item_id": 5,
      "color": "Green",
      "opening_balance": 150,
      "received_qty": 0,
      "issue_qty": 60,
      "closing_balance": 90,
      "issue_location": "Production Floor B",
      "rate": "24.5",
      "received_value": "0",
      "issue_value": "1470",
      "closing_value": "2205",
      "weight_wastage": "1.5",
      "remarks": "Issued for Kids Collection production",
      "created_at": "2025-09-19T01:20:47.504424+06:00",
      "buyer": {
        "id": 5,
        "name": "Department Store Ltd.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "sales_contract": {
        "id": 5,
        "buyer_id": 5,
        "contract_no": "SC-2024-005",
        "style": "Kids Collection",
        "job_no": "JOB-005",
        "btb_lc_no": "LC-2024-005",
        "created_at": "2025-09-19T01:20:47.491333+06:00"
      },
      "item": {
        "id": 5,
        "name": "Polyester Fabric - Green",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 10,
      "transaction_date": "2025-08-13T01:20:47.495334+06:00",
      "buyer_id": null,
      "supplier_id": 6,
      "sales_contract_id": null,
      "purchase_invoice_id": 6,
      "item_id": 6,
      "color": "Gold",
      "opening_balance": 0,
      "received_qty": 100,
      "issue_qty": 0,
      "closing_balance": 100,
      "issue_location": "",
      "rate": "85",
      "received_value": "8500",
      "issue_value": "0",
      "closing_value": "8500",
      "weight_wastage": "0",
      "remarks": "Premium silk fabric for luxury collection",
      "created_at": "2025-09-19T01:20:47.503882+06:00",
      "supplier": {
        "id": 6,
        "name": "Silk & Cotton Co.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "purchase_invoice": {
        "id": 6,
        "pi_no": "PI-2024-006",
        "pi_qty": 200,
        "supplier_id": 6,
        "created_at": "2025-09-19T01:20:47.494667+06:00"
      },
      "item": {
        "id": 6,
        "name": "Silk Fabric - Gold",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 13,
      "transaction_date": "2025-08-08T01:20:47.495334+06:00",
      "buyer_id": 1,
      "supplier_id": null,
      "sales_contract_id": null,
      "purchase_invoice_id": null,
      "item_id": 10,
      "color": "White",
      "opening_balance": 500,
      "received_qty": 0,
      "issue_qty": 50,
      "closing_balance": 450,
      "issue_location": "Production Floor A",
      "rate": "2.5",
      "received_value": "0",
      "issue_value": "125",
      "closing_value": "1125",
      "weight_wastage": "0",
      "remarks": "Thread issued for production",
      "created_at": "2025-09-19T01:20:47.505394+06:00",
      "buyer": {
        "id": 1,
        "name": "Fashion House Ltd.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "item": {
        "id": 10,
        "name": "Thread - White",
        "uom": "Spools",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 9,
      "transaction_date": "2025-08-06T01:20:47.495334+06:00",
      "buyer_id": 4,
      "supplier_id": null,
      "sales_contract_id": 4,
      "purchase_invoice_id": null,
      "item_id": 4,
      "color": "Black",
      "opening_balance": 200,
      "received_qty": 0,
      "issue_qty": 80,
      "closing_balance": 120,
      "issue_location": "Production Floor A",
      "rate": "22",
      "received_value": "0",
      "issue_value": "1760",
      "closing_value": "2640",
      "weight_wastage": "1.6",
      "remarks": "Issued for Formal Wear production",
      "created_at": "2025-09-19T01:20:47.503254+06:00",
      "buyer": {
        "id": 4,
        "name": "Online Fashion Hub",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "sales_contract": {
        "id": 4,
        "buyer_id": 4,
        "contract_no": "SC-2024-004",
        "style": "Formal Wear",
        "job_no": "JOB-004",
        "btb_lc_no": "LC-2024-004",
        "created_at": "2025-09-19T01:20:47.49059+06:00"
      },
      "item": {
        "id": 4,
        "name": "Polyester Fabric - Black",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 8,
      "transaction_date": "2025-08-03T01:20:47.495334+06:00",
      "buyer_id": 3,
      "supplier_id": null,
      "sales_contract_id": 3,
      "purchase_invoice_id": null,
      "item_id": 3,
      "color": "Red",
      "opening_balance": 400,
      "received_qty": 0,
      "issue_qty": 50,
      "closing_balance": 350,
      "issue_location": "Production Floor C",
      "rate": "26.25",
      "received_value": "0",
      "issue_value": "1312.5",
      "closing_value": "9187.5",
      "weight_wastage": "1.2",
      "remarks": "Issued for Casual Wear production",
      "created_at": "2025-09-19T01:20:47.502443+06:00",
      "buyer": {
        "id": 3,
        "name": "Boutique Store Co.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "sales_contract": {
        "id": 3,
        "buyer_id": 3,
        "contract_no": "SC-2024-003",
        "style": "Casual Wear",
        "job_no": "JOB-003",
        "btb_lc_no": "LC-2024-003",
        "created_at": "2025-09-19T01:20:47.490151+06:00"
      },
      "item": {
        "id": 3,
        "name": "Cotton Fabric - Red",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 7,
      "transaction_date": "2025-07-31T01:20:47.495334+06:00",
      "buyer_id": null,
      "supplier_id": 5,
      "sales_contract_id": null,
      "purchase_invoice_id": 5,
      "item_id": 5,
      "color": "Green",
      "opening_balance": 0,
      "received_qty": 150,
      "issue_qty": 0,
      "closing_balance": 150,
      "issue_location": "",
      "rate": "24.5",
      "received_value": "3675",
      "issue_value": "0",
      "closing_value": "3675",
      "weight_wastage": "0",
      "remarks": "Stock receipt for casual wear",
      "created_at": "2025-09-19T01:20:47.501842+06:00",
      "supplier": {
        "id": 5,
        "name": "Global Textile Corp.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "purchase_invoice": {
        "id": 5,
        "pi_no": "PI-2024-005",
        "pi_qty": 1200,
        "supplier_id": 5,
        "created_at": "2025-09-19T01:20:47.494217+06:00"
      },
      "item": {
        "id": 5,
        "name": "Polyester Fabric - Green",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 6,
      "transaction_date": "2025-07-29T01:20:47.495334+06:00",
      "buyer_id": null,
      "supplier_id": 4,
      "sales_contract_id": null,
      "purchase_invoice_id": 4,
      "item_id": 4,
      "color": "Black",
      "opening_balance": 0,
      "received_qty": 200,
      "issue_qty": 0,
      "closing_balance": 200,
      "issue_location": "",
      "rate": "22",
      "received_value": "4400",
      "issue_value": "0",
      "closing_value": "4400",
      "weight_wastage": "0",
      "remarks": "Stock receipt for formal wear",
      "created_at": "2025-09-19T01:20:47.501204+06:00",
      "supplier": {
        "id": 4,
        "name": "Premium Fabrics Ltd.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "purchase_invoice": {
        "id": 4,
        "pi_no": "PI-2024-004",
        "pi_qty": 300,
        "supplier_id": 4,
        "created_at": "2025-09-19T01:20:47.493775+06:00"
      },
      "item": {
        "id": 4,
        "name": "Polyester Fabric - Black",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 12,
      "transaction_date": "2025-07-27T01:20:47.495334+06:00",
      "buyer_id": null,
      "supplier_id": 7,
      "sales_contract_id": null,
      "purchase_invoice_id": null,
      "item_id": 10,
      "color": "White",
      "opening_balance": 0,
      "received_qty": 500,
      "issue_qty": 0,
      "closing_balance": 500,
      "issue_location": "",
      "rate": "2.5",
      "received_value": "1250",
      "issue_value": "0",
      "closing_value": "1250",
      "weight_wastage": "0",
      "remarks": "Thread stock receipt",
      "created_at": "2025-09-19T01:20:47.504942+06:00",
      "supplier": {
        "id": 7,
        "name": "Denim Works Ltd.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "item": {
        "id": 10,
        "name": "Thread - White",
        "uom": "Spools",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 5,
      "transaction_date": "2025-07-25T01:20:47.495334+06:00",
      "buyer_id": 2,
      "supplier_id": null,
      "sales_contract_id": 2,
      "purchase_invoice_id": null,
      "item_id": 2,
      "color": "Blue",
      "opening_balance": 300,
      "received_qty": 0,
      "issue_qty": 75,
      "closing_balance": 225,
      "issue_location": "Production Floor B",
      "rate": "28.75",
      "received_value": "0",
      "issue_value": "2156.25",
      "closing_value": "6468.75",
      "weight_wastage": "1.8",
      "remarks": "Issued for Winter Collection production",
      "created_at": "2025-09-19T01:20:47.500361+06:00",
      "buyer": {
        "id": 2,
        "name": "Retail Chain Inc.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "sales_contract": {
        "id": 2,
        "buyer_id": 2,
        "contract_no": "SC-2024-002",
        "style": "Winter Collection",
        "job_no": "JOB-002",
        "btb_lc_no": "LC-2024-002",
        "created_at": "2025-09-19T01:20:47.489659+06:00"
      },
      "item": {
        "id": 2,
        "name": "Cotton Fabric - Blue",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 4,
      "transaction_date": "2025-07-24T01:20:47.495334+06:00",
      "buyer_id": 1,
      "supplier_id": null,
      "sales_contract_id": 1,
      "purchase_invoice_id": null,
      "item_id": 1,
      "color": "White",
      "opening_balance": 500,
      "received_qty": 0,
      "issue_qty": 100,
      "closing_balance": 400,
      "issue_location": "Production Floor A",
      "rate": "25.5",
      "received_value": "0",
      "issue_value": "2550",
      "closing_value": "10200",
      "weight_wastage": "2.5",
      "remarks": "Issued for Summer Collection production",
      "created_at": "2025-09-19T01:20:47.499436+06:00",
      "buyer": {
        "id": 1,
        "name": "Fashion House Ltd.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "sales_contract": {
        "id": 1,
        "buyer_id": 1,
        "contract_no": "SC-2024-001",
        "style": "Summer Collection",
        "job_no": "JOB-001",
        "btb_lc_no": "LC-2024-001",
        "created_at": "2025-09-19T01:20:47.487879+06:00"
      },
      "item": {
        "id": 1,
        "name": "Cotton Fabric - White",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 3,
      "transaction_date": "2025-07-21T01:20:47.495334+06:00",
      "buyer_id": null,
      "supplier_id": 3,
      "sales_contract_id": null,
      "purchase_invoice_id": 3,
      "item_id": 3,
      "color": "Red",
      "opening_balance": 0,
      "received_qty": 400,
      "issue_qty": 0,
      "closing_balance": 400,
      "issue_location": "",
      "rate": "26.25",
      "received_value": "10500",
      "issue_value": "0",
      "closing_value": "10500",
      "weight_wastage": "0",
      "remarks": "Initial stock receipt",
      "created_at": "2025-09-19T01:20:47.498738+06:00",
      "supplier": {
        "id": 3,
        "name": "Cotton Suppliers Co.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "purchase_invoice": {
        "id": 3,
        "pi_no": "PI-2024-003",
        "pi_qty": 750,
        "supplier_id": 3,
        "created_at": "2025-09-19T01:20:47.493287+06:00"
      },
      "item": {
        "id": 3,
        "name": "Cotton Fabric - Red",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 2,
      "transaction_date": "2025-07-20T01:20:47.495334+06:00",
      "buyer_id": null,
      "supplier_id": 2,
      "sales_contract_id": null,
      "purchase_invoice_id": 2,
      "item_id": 2,
      "color": "Blue",
      "opening_balance": 0,
      "received_qty": 300,
      "issue_qty": 0,
      "closing_balance": 300,
      "issue_location": "",
      "rate": "28.75",
      "received_value": "8625",
      "issue_value": "0",
      "closing_value": "8625",
      "weight_wastage": "0",
      "remarks": "Initial stock receipt",
      "created_at": "2025-09-19T01:20:47.497972+06:00",
      "supplier": {
        "id": 2,
        "name": "Fabric World Inc.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "purchase_invoice": {
        "id": 2,
        "pi_no": "PI-2024-002",
        "pi_qty": 500,
        "supplier_id": 2,
        "created_at": "2025-09-19T01:20:47.492846+06:00"
      },
      "item": {
        "id": 2,
        "name": "Cotton Fabric - Blue",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    },
    {
      "id": 1,
      "transaction_date": "2025-07-19T01:20:47.495334+06:00",
      "buyer_id": null,
      "supplier_id": 1,
      "sales_contract_id": null,
      "purchase_invoice_id": 1,
      "item_id": 1,
      "color": "White",
      "opening_balance": 0,
      "received_qty": 500,
      "issue_qty": 0,
      "closing_balance": 500,
      "issue_location": "",
      "rate": "25.5",
      "received_value": "12750",
      "issue_value": "0",
      "closing_value": "12750",
      "weight_wastage": "0",
      "remarks": "Initial stock receipt",
      "created_at": "2025-09-19T01:20:47.495458+06:00",
      "supplier": {
        "id": 1,
        "name": "Textile Mills Ltd.",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      },
      "purchase_invoice": {
        "id": 1,
        "pi_no": "PI-2024-001",
        "pi_qty": 1000,
        "supplier_id": 1,
        "created_at": "2025-09-19T01:20:47.492+06:00"
      },
      "item": {
        "id": 1,
        "name": "Cotton Fabric - White",
        "uom": "Meters",
        "created_at": "0001-01-01T00:00:00Z",
        "updated_at": "0001-01-01T00:00:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 50,
    "total": 13,
    "total_pages": 1
  },
  "timestamp": "2025-09-20T09:22:21.97201+06:00"
}

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

  // Helper function to transform API data to match our interface
  const transformApiData = (data: any[]): InventoryTransaction[] => {
    return data.map((item: any) => ({
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
      rate: parseFloat(item.rate),
      receivedValue: parseFloat(item.received_value),
      issueValue: parseFloat(item.issue_value),
      closingValue: parseFloat(item.closing_value),
      weightWastage: parseFloat(item.weight_wastage),
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
  }

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
        const transformedTransactions = transformApiData(result.data)
        setTransactions(transformedTransactions)
      } else {
        console.error('API response error:', result.message)
        // Fallback to dummy data
        const transformedTransactions = transformApiData(DUMMY_DATA.data)
        setTransactions(transformedTransactions)
      }
    } catch (error) {
      console.error('Error fetching inventory transactions:', error)
      // Fallback to dummy data when API fails
      const transformedTransactions = transformApiData(DUMMY_DATA.data)
      setTransactions(transformedTransactions)
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

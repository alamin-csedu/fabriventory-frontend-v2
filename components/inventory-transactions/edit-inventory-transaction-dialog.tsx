"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Package } from "lucide-react"

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

interface EditInventoryTransactionDialogProps {
  transaction: InventoryTransaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface Buyer {
  id: number
  name: string
}

interface Supplier {
  id: number
  name: string
}

interface Item {
  id: number
  name: string
  uom: string
}

interface SalesContract {
  id: number
  contractNo: string
  buyerId: number
}

interface PurchaseInvoice {
  id: number
  piNo: string
  supplierId: number
}

export function EditInventoryTransactionDialog({ 
  transaction, 
  open, 
  onOpenChange, 
  onSuccess 
}: EditInventoryTransactionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    transactionDate: "",
    buyerId: "",
    supplierId: "",
    salesContractId: "",
    purchaseInvoiceId: "",
    itemId: "",
    color: "",
    openingBalance: 0,
    receivedQty: 0,
    issueQty: 0,
    closingBalance: 0,
    issueLocation: "",
    rate: 0,
    receivedValue: 0,
    issueValue: 0,
    closingValue: 0,
    weightWastage: 0,
    remarks: "",
  })

  // Related data
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [salesContracts, setSalesContracts] = useState<SalesContract[]>([])
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([])

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setFormData({
        transactionDate: transaction.transactionDate.split('T')[0],
        buyerId: transaction.buyerId?.toString() || "",
        supplierId: transaction.supplierId?.toString() || "",
        salesContractId: transaction.salesContractId?.toString() || "",
        purchaseInvoiceId: transaction.purchaseInvoiceId?.toString() || "",
        itemId: transaction.itemId.toString(),
        color: transaction.color,
        openingBalance: transaction.openingBalance,
        receivedQty: transaction.receivedQty,
        issueQty: transaction.issueQty,
        closingBalance: transaction.closingBalance,
        issueLocation: transaction.issueLocation || "",
        rate: transaction.rate,
        receivedValue: transaction.receivedValue,
        issueValue: transaction.issueValue,
        closingValue: transaction.closingValue,
        weightWastage: transaction.weightWastage,
        remarks: transaction.remarks,
      })
    }
  }, [transaction])

  // Load related data
  useEffect(() => {
    if (open) {
      // Mock data - replace with actual API calls
      setBuyers([
        { id: 1, name: "ABC Textiles" },
        { id: 2, name: "XYZ Fashion" },
        { id: 3, name: "Global Garments" },
      ])
      
      setSuppliers([
        { id: 1, name: "XYZ Fabrics" },
        { id: 2, name: "Premium Textiles" },
        { id: 3, name: "Global Fabric Supply" },
      ])
      
      setItems([
        { id: 1, name: "Cotton Fabric", uom: "Meters" },
        { id: 2, name: "Polyester Fabric", uom: "Meters" },
        { id: 3, name: "Silk Fabric", uom: "Meters" },
      ])
      
      setSalesContracts([
        { id: 1, contractNo: "SC-2024-001", buyerId: 1 },
        { id: 2, contractNo: "SC-2024-002", buyerId: 2 },
      ])
      
      setPurchaseInvoices([
        { id: 1, piNo: "PI-2024-001", supplierId: 1 },
        { id: 2, piNo: "PI-2024-002", supplierId: 2 },
      ])
    }
  }, [open])

  // Calculate values when quantities or rate change
  useEffect(() => {
    const receivedValue = formData.receivedQty * formData.rate
    const issueValue = formData.issueQty * formData.rate
    const closingValue = formData.closingBalance * formData.rate

    setFormData(prev => ({
      ...prev,
      receivedValue,
      issueValue,
      closingValue,
    }))
  }, [formData.receivedQty, formData.issueQty, formData.closingBalance, formData.rate])

  // Calculate closing balance when opening, received, or issue quantities change
  useEffect(() => {
    const closingBalance = formData.openingBalance + formData.receivedQty - formData.issueQty
    setFormData(prev => ({
      ...prev,
      closingBalance,
    }))
  }, [formData.openingBalance, formData.receivedQty, formData.issueQty])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the transaction data
      const transactionData = {
        transaction_date: formData.transactionDate + "T00:00:00Z",
        item_id: parseInt(formData.itemId),
        color: formData.color,
        opening_balance: formData.openingBalance,
        received_qty: formData.receivedQty,
        issue_qty: formData.issueQty,
        closing_balance: formData.closingBalance,
        rate: formData.rate,
        received_value: formData.receivedValue,
        issue_value: formData.issueValue,
        closing_value: formData.closingValue,
        weight_wastage: formData.weightWastage,
        remarks: formData.remarks,
        ...(formData.supplierId && {
          supplier_id: parseInt(formData.supplierId),
        }),
        ...(formData.purchaseInvoiceId && {
          purchase_invoice_id: parseInt(formData.purchaseInvoiceId),
        }),
        ...(formData.buyerId && {
          buyer_id: parseInt(formData.buyerId),
        }),
        ...(formData.salesContractId && {
          sales_contract_id: parseInt(formData.salesContractId),
        }),
        ...(formData.issueLocation && {
          issue_location: formData.issueLocation,
        }),
      }

      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Updating inventory transaction:", transaction.id, transactionData)

      toast({
        title: "Success",
        description: "Inventory transaction updated successfully",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inventory transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const isReceipt = transaction.receivedQty > 0
  const isIssue = transaction.issueQty > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Transaction</DialogTitle>
          <DialogDescription>
            Update the inventory transaction details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {isReceipt ? "Stock Receipt Details" : "Stock Issue Details"}
              </CardTitle>
              <CardDescription>
                {isReceipt ? "Update incoming inventory details" : "Update outgoing inventory details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Transaction Date</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={formData.transactionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, transactionDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item">Item</Label>
                  <Select
                    value={formData.itemId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, itemId: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select item" />
                    </SelectTrigger>
                    <SelectContent>
                      {items.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name} ({item.uom})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isReceipt && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      value={formData.supplierId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, supplierId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchaseInvoice">Purchase Invoice</Label>
                    <Select
                      value={formData.purchaseInvoiceId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, purchaseInvoiceId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select purchase invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchaseInvoices
                          .filter(pi => pi.supplierId === parseInt(formData.supplierId))
                          .map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id.toString()}>
                              {invoice.piNo}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {isIssue && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="buyer">Buyer</Label>
                    <Select
                      value={formData.buyerId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, buyerId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select buyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {buyers.map((buyer) => (
                          <SelectItem key={buyer.id} value={buyer.id.toString()}>
                            {buyer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salesContract">Sales Contract</Label>
                    <Select
                      value={formData.salesContractId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, salesContractId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales contract" />
                      </SelectTrigger>
                      <SelectContent>
                        {salesContracts
                          .filter(sc => sc.buyerId === parseInt(formData.buyerId))
                          .map((contract) => (
                            <SelectItem key={contract.id} value={contract.id.toString()}>
                              {contract.contractNo}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Enter color"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Unit</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={formData.rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {isIssue && (
                <div className="space-y-2">
                  <Label htmlFor="issueLocation">Issue Location</Label>
                  <Input
                    id="issueLocation"
                    value={formData.issueLocation}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueLocation: e.target.value }))}
                    placeholder="e.g., Production Floor A"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingBalance">Opening Balance</Label>
                  <Input
                    id="openingBalance"
                    type="number"
                    value={formData.openingBalance}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingBalance: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receivedQty">Received Quantity</Label>
                  <Input
                    id="receivedQty"
                    type="number"
                    value={formData.receivedQty}
                    onChange={(e) => setFormData(prev => ({ ...prev, receivedQty: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issueQty">Issue Quantity</Label>
                  <Input
                    id="issueQty"
                    type="number"
                    value={formData.issueQty}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueQty: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="closingBalance">Closing Balance</Label>
                <Input
                  id="closingBalance"
                  type="number"
                  value={formData.closingBalance}
                  readOnly
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Received Value</Label>
                  <Input
                    value={formatCurrency(formData.receivedValue)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Issue Value</Label>
                  <Input
                    value={formatCurrency(formData.issueValue)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Closing Value</Label>
                  <Input
                    value={formatCurrency(formData.closingValue)}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightWastage">Weight/Wastage</Label>
                <Input
                  id="weightWastage"
                  type="number"
                  step="0.01"
                  value={formData.weightWastage}
                  onChange={(e) => setFormData(prev => ({ ...prev, weightWastage: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Enter any additional remarks..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

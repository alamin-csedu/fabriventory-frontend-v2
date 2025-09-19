"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Package, ArrowUp, ArrowDown } from "lucide-react"

interface AddInventoryTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
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

export function AddInventoryTransactionDialog({ open, onOpenChange, onSuccess }: AddInventoryTransactionDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("receipt")
  
  // Form data
  const [formData, setFormData] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
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
      // Prepare the transaction data based on the active tab
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
        ...(activeTab === "receipt" && {
          supplier_id: parseInt(formData.supplierId),
          purchase_invoice_id: parseInt(formData.purchaseInvoiceId),
        }),
        ...(activeTab === "issue" && {
          buyer_id: parseInt(formData.buyerId),
          sales_contract_id: parseInt(formData.salesContractId),
          issue_location: formData.issueLocation,
        }),
      }

      // Make API call to create inventory transaction
      const response = await fetch('http://localhost:8080/api/v1/inventory-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create transaction')
      }
      
      console.log("Inventory transaction created successfully:", result.data)

      toast({
        title: "Success",
        description: "Inventory transaction created successfully",
      })

      onOpenChange(false)
      resetForm()
      
      // Call the success callback to refresh the table
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create inventory transaction",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      transactionDate: new Date().toISOString().split('T')[0],
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
    setActiveTab("receipt")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Inventory Transaction</DialogTitle>
          <DialogDescription>
            Create a new inventory transaction for stock receipt or issue
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="receipt" className="gap-2">
              <ArrowUp className="h-4 w-4" />
              Stock Receipt
            </TabsTrigger>
            <TabsTrigger value="issue" className="gap-2">
              <ArrowDown className="h-4 w-4" />
              Stock Issue
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="receipt" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Stock Receipt Details
                  </CardTitle>
                  <CardDescription>
                    Record incoming inventory from suppliers
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        required
                      />
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
            </TabsContent>

            <TabsContent value="issue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Stock Issue Details
                  </CardTitle>
                  <CardDescription>
                    Record outgoing inventory to buyers/production
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                      <Label htmlFor="issueLocation">Issue Location</Label>
                      <Input
                        id="issueLocation"
                        value={formData.issueLocation}
                        onChange={(e) => setFormData(prev => ({ ...prev, issueLocation: e.target.value }))}
                        placeholder="e.g., Production Floor A"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

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
                      <Label htmlFor="issueQty">Issue Quantity</Label>
                      <Input
                        id="issueQty"
                        type="number"
                        value={formData.issueQty}
                        onChange={(e) => setFormData(prev => ({ ...prev, issueQty: parseInt(e.target.value) || 0 }))}
                        placeholder="0"
                        required
                      />
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
            </TabsContent>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Transaction
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

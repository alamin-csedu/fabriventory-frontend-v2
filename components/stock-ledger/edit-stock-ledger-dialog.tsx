"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUpload } from "@/components/ui/file-upload"
import { StockLedgerCombobox } from "@/components/ui/stock-ledger-combobox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Eye, ExternalLink, X, Plus, Trash2, Save, Edit } from "lucide-react"

interface Job {
  id: number
  name: string
}

interface Vendor {
  id: number
  name: string
}

interface Item {
  id: number
  name: string
}

interface Unit {
  id: number
  name: string
}

interface StockLedgerItem {
  id?: number
  stock_ledger_id?: number
  item_id: number
  quantity: number
  unit_id: number
  item?: {
    id: number
    name: string
  }
  unit?: {
    id: number
    name: string
  }
  isEditing?: boolean
  isNew?: boolean
}

interface StockLedger {
  id: number
  job_id: number
  type: "Booking" | "Delivery"
  parent_id: number | null
  vendor_id: number
  delivery_receipt_url: string | null
  payment_reference: string | null
  job: {
    id: number
    name: string
    description: string
    customer_id: number
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  parent?: {
    id: number
    job_id: number
    type: string
    parent_id: number | null
    vendor_id: number
    delivery_receipt_url: string
    payment_reference: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  vendor: {
    id: number
    name: string
    address: string
    phone_number: string[]
    email: string
    created_at: string
    updated_at: string
    deleted_at: string | null
  }
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface EditStockLedgerDialogProps {
  stockLedger: StockLedger | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditStockLedgerDialog({ stockLedger, open, onOpenChange, onSuccess }: EditStockLedgerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stockLedgers, setStockLedgers] = useState<any[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [stockLedgerItems, setStockLedgerItems] = useState<StockLedgerItem[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  
  // Form fields for adding new items
  const [newItemForm, setNewItemForm] = useState({
    item_id: "",
    quantity: "",
    unit_id: "",
  })
  const [showAddRow, setShowAddRow] = useState(false)
  const [formData, setFormData] = useState({
    job_id: "",
    type: "Booking" as "Booking" | "Delivery",
    parent_id: undefined as number | undefined,
    vendor_id: "",
    payment_reference: "",
  })

  const fetchJobs = async () => {
    try {
      const response = await apiService.getJobs({ page: 1, size: 100 })
      setJobs(response.data.data || [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
    }
  }

  const fetchVendors = async () => {
    try {
      const response = await apiService.getVendors({ page: 1, size: 100 })
      setVendors(response.data.data || [])
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  const fetchStockLedgers = async () => {
    try {
      const response = await apiService.getStockLedgers({ page: 1, size: 100 })
      setStockLedgers(response.data.data || [])
    } catch (error) {
      console.error("Error fetching stock ledgers:", error)
    }
  }

  const fetchItems = async () => {
    try {
      const response = await apiService.getItems({ page: 1, size: 100 })
      setItems(response.data.data || [])
    } catch (error) {
      console.error("Error fetching items:", error)
    }
  }

  const fetchUnits = async () => {
    try {
      const response = await apiService.getUnits({ page: 1, size: 100 })
      setUnits(response.data.data || [])
    } catch (error) {
      console.error("Error fetching units:", error)
    }
  }

  const fetchStockLedgerItems = async () => {
    if (!stockLedger?.id) return
    try {
      const response = await apiService.getStockLedgerItems({ stock_ledger_id: stockLedger.id })
      setStockLedgerItems(response.data.data || [])
    } catch (error) {
      console.error("Error fetching stock ledger items:", error)
    }
  }

  useEffect(() => {
    if (open && stockLedger) {
      fetchJobs()
      fetchVendors()
      fetchStockLedgers()
      fetchItems()
      fetchUnits()
      fetchStockLedgerItems()
      setFormData({
        job_id: stockLedger.job_id.toString(),
        type: stockLedger.type,
        parent_id: stockLedger.parent_id || undefined,
        vendor_id: stockLedger.vendor_id.toString(),
        payment_reference: stockLedger.payment_reference || "",
      })
      setSelectedFile(null) // Reset file selection
    }
  }, [open, stockLedger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stockLedger || !formData.job_id || !formData.vendor_id) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate file upload for delivery type
    if (formData.type === "Delivery" && !selectedFile && !stockLedger.delivery_receipt_url) {
      toast.error("Please upload a delivery receipt for delivery type")
      return
    }

    try {
      setLoading(true)
      
      // Check if there are any filled form fields that haven't been added yet
      if (formData.type === "Booking" && newItemForm.item_id && newItemForm.quantity && newItemForm.unit_id) {
        // Auto-add the current form data before saving
        const selectedItem = items.find(item => item.id === parseInt(newItemForm.item_id))
        const selectedUnit = units.find(unit => unit.id === parseInt(newItemForm.unit_id))

        const newItem: StockLedgerItem = {
          item_id: parseInt(newItemForm.item_id),
          quantity: parseFloat(newItemForm.quantity),
          unit_id: parseInt(newItemForm.unit_id),
          item: selectedItem,
          unit: selectedUnit,
          isNew: true,
        }

        // Add to list and save immediately
        setStockLedgerItems(prev => [...prev, newItem])
        
        // Auto-save the item
        try {
          const response = await apiService.createStockLedgerItem({
            stock_ledger_id: stockLedger.id,
            item_id: parseInt(newItemForm.item_id),
            quantity: parseFloat(newItemForm.quantity),
            unit_id: parseInt(newItemForm.unit_id),
          })
          
          // Update the item with the response data
          setStockLedgerItems(prev => 
            prev.map((itm, i) => 
              i === prev.length - 1 ? { ...response.data, isNew: false } : itm
            )
          )
        } catch (error) {
          console.error("Error auto-saving item:", error)
          toast.error("Failed to save item")
        }
      }
      
      if (formData.type === "Delivery" && selectedFile) {
        // Use FormData for file upload
        const formDataToSubmit = new FormData()
        formDataToSubmit.append('job_id', formData.job_id)
        formDataToSubmit.append('type', formData.type)
        if (formData.parent_id) {
          formDataToSubmit.append('parent_id', formData.parent_id.toString())
        }
        formDataToSubmit.append('vendor_id', formData.vendor_id)
        formDataToSubmit.append('delivery_receipt', selectedFile)
        if (formData.payment_reference) {
          formDataToSubmit.append('payment_reference', formData.payment_reference)
        }

        await apiService.updateStockLedgerWithFile(stockLedger.id, formDataToSubmit)
      } else {
        // Use regular JSON for non-delivery types or when no new file
        const submitData = {
          job_id: parseInt(formData.job_id),
          type: formData.type,
          parent_id: formData.parent_id || null,
          vendor_id: parseInt(formData.vendor_id),
          payment_reference: formData.payment_reference || null,
        }

        await apiService.updateStockLedger(stockLedger.id, submitData)
      }
      
      toast.success("Stock ledger updated successfully")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error updating stock ledger:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleParentChange = (parentId: number | undefined) => {
    if (parentId) {
      // Find the selected parent stock ledger
      const parentLedger = stockLedgers.find(ledger => ledger.id === parentId)
      if (parentLedger) {
        setFormData(prev => ({
          ...prev,
          parent_id: parentId,
          job_id: parentLedger.job_id.toString(),
          vendor_id: parentLedger.vendor_id.toString()
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        parent_id: undefined,
        job_id: stockLedger?.job_id.toString() || "",
        vendor_id: stockLedger?.vendor_id.toString() || ""
      }))
    }
  }

  const handleAddItem = () => {
    if (!newItemForm.item_id || !newItemForm.quantity || !newItemForm.unit_id) {
      toast.error("Please fill in all fields")
      return
    }

    const selectedItem = items.find(item => item.id === parseInt(newItemForm.item_id))
    const selectedUnit = units.find(unit => unit.id === parseInt(newItemForm.unit_id))

    const newItem: StockLedgerItem = {
      item_id: parseInt(newItemForm.item_id),
      quantity: parseFloat(newItemForm.quantity),
      unit_id: parseInt(newItemForm.unit_id),
      item: selectedItem,
      unit: selectedUnit,
      isNew: true,
    }

    // Add to list and save immediately
    setStockLedgerItems(prev => [...prev, newItem])
    
    // Auto-save the item
    setTimeout(async () => {
      try {
        const response = await apiService.createStockLedgerItem({
          stock_ledger_id: stockLedger!.id,
          item_id: parseInt(newItemForm.item_id),
          quantity: parseFloat(newItemForm.quantity),
          unit_id: parseInt(newItemForm.unit_id),
        })
        
        // Update the item with the response data
        setStockLedgerItems(prev => 
          prev.map((itm, i) => 
            i === prev.length - 1 ? { ...response.data, isNew: false } : itm
          )
        )
        toast.success("Item added successfully")
      } catch (error) {
        console.error("Error auto-saving item:", error)
        toast.error("Failed to save item")
        // Remove the item from list if save failed
        setStockLedgerItems(prev => prev.slice(0, -1))
      }
    }, 100)

    // Reset form and hide add row
    setNewItemForm({
      item_id: "",
      quantity: "",
      unit_id: "",
    })
    setShowAddRow(false)
  }

  const handleAutoAddItem = (itemId: number, quantity: number, unitId: number) => {
    // Check if all fields are filled
    if (itemId && quantity && unitId) {
      const selectedItem = items.find(item => item.id === itemId)
      const selectedUnit = units.find(unit => unit.id === unitId)

      const newItem: StockLedgerItem = {
        item_id: itemId,
        quantity: quantity,
        unit_id: unitId,
        item: selectedItem,
        unit: selectedUnit,
        isNew: true,
      }

      // Add to list and save immediately
      setStockLedgerItems(prev => [...prev, newItem])
      
      // Auto-save the item
      setTimeout(async () => {
        try {
          const response = await apiService.createStockLedgerItem({
            stock_ledger_id: stockLedger!.id,
            item_id: itemId,
            quantity: quantity,
            unit_id: unitId,
          })
          
          // Update the item with the response data
          setStockLedgerItems(prev => 
            prev.map((itm, i) => 
              i === prev.length - 1 ? { ...response.data, isNew: false } : itm
            )
          )
          toast.success("Item added successfully")
        } catch (error) {
          console.error("Error auto-saving item:", error)
          toast.error("Failed to save item")
          // Remove the item from list if save failed
          setStockLedgerItems(prev => prev.slice(0, -1))
        }
      }, 100)
    }
  }

  const handleEditItem = (index: number) => {
    setStockLedgerItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, isEditing: true } : item
      )
    )
  }

  const handleSaveItem = async (index: number) => {
    const item = stockLedgerItems[index]
    if (!item.item_id || !item.quantity || !item.unit_id) {
      toast.error("Please fill in all item fields")
      return
    }

    try {
      if (item.isNew) {
        // Create new item
        const response = await apiService.createStockLedgerItem({
          stock_ledger_id: stockLedger!.id,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_id: item.unit_id,
        })
        
        setStockLedgerItems(prev => 
          prev.map((itm, i) => 
            i === index ? { ...response.data, isEditing: false, isNew: false } : itm
          )
        )
        toast.success("Item added successfully")
      } else {
        // Update existing item
        await apiService.updateStockLedgerItem(item.id!, {
          stock_ledger_id: stockLedger!.id,
          item_id: item.item_id,
          quantity: item.quantity,
          unit_id: item.unit_id,
        })
        
        setStockLedgerItems(prev => 
          prev.map((itm, i) => 
            i === index ? { ...itm, isEditing: false } : itm
          )
        )
        toast.success("Item updated successfully")
      }
    } catch (error) {
      console.error("Error saving item:", error)
      toast.error("Failed to save item")
    }
  }

  const handleCancelEdit = (index: number) => {
    const item = stockLedgerItems[index]
    if (item.isNew) {
      // Remove new item if canceling
      setStockLedgerItems(prev => prev.filter((_, i) => i !== index))
    } else {
      // Reset to original values
      setStockLedgerItems(prev => 
        prev.map((itm, i) => 
          i === index ? { ...itm, isEditing: false } : itm
        )
      )
    }
  }

  const handleDeleteItem = async (index: number) => {
    const item = stockLedgerItems[index]
    if (item.isNew) {
      // Just remove from list if it's new
      setStockLedgerItems(prev => prev.filter((_, i) => i !== index))
    } else {
      try {
        await apiService.deleteStockLedgerItem(item.id!)
        setStockLedgerItems(prev => prev.filter((_, i) => i !== index))
        toast.success("Item deleted successfully")
      } catch (error) {
        console.error("Error deleting item:", error)
        toast.error("Failed to delete item")
      }
    }
  }

  const handleItemChange = (index: number, field: keyof StockLedgerItem, value: any) => {
    setStockLedgerItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveItem(index)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancelEdit(index)
    }
  }

  const handleNewItemFormChange = (field: string, value: string) => {
    const updatedForm = {
      ...newItemForm,
      [field]: value
    }
    setNewItemForm(updatedForm)
  }

  // Auto-add item when all fields are filled
  useEffect(() => {
    if (newItemForm.item_id && newItemForm.quantity && newItemForm.unit_id) {
      const timer = setTimeout(() => {
        handleAddItem()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [newItemForm.item_id, newItemForm.quantity, newItemForm.unit_id])

  // Get the current parent stock ledger for display
  const currentParentLedger = stockLedgers.find(ledger => ledger.id === formData.parent_id)

  if (!stockLedger) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Stock Ledger</DialogTitle>
          <DialogDescription>
            Update the stock ledger entry details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_id">Job *</Label>
              <Select 
                value={formData.job_id} 
                onValueChange={(value) => handleInputChange("job_id", value)}
                disabled={!!formData.parent_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Booking">Booking</SelectItem>
                  <SelectItem value="Delivery">Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="parent_id">Parent Stock Ledger</Label>
            <StockLedgerCombobox
              value={formData.parent_id}
              onValueChange={handleParentChange}
              placeholder="Select parent stock ledger (optional)"
              stockLedgers={stockLedgers}
            />
            {stockLedger.parent && !currentParentLedger && (
              <div className="mt-2 p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-800">Current Parent:</span>
                  <span className="text-sm text-blue-700">
                    Job #{stockLedger.parent.job_id} - {stockLedger.parent.type} - {stockLedger.parent.payment_reference}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Created: {new Date(stockLedger.parent.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor_id">Vendor *</Label>
            <Select 
              value={formData.vendor_id} 
              onValueChange={(value) => handleInputChange("vendor_id", value)}
              disabled={!!formData.parent_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id.toString()}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type === "Delivery" && (
            <div className="space-y-4">
              <Label htmlFor="delivery_receipt">Delivery Receipt *</Label>
              
              {/* Current Image Preview */}
              {stockLedger.delivery_receipt_url && !selectedFile && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Current Receipt:</div>
                  <div 
                    className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-200"
                    onClick={() => setShowImageModal(true)}
                  >
                    <img
                      src={
                        stockLedger.delivery_receipt_url.startsWith('http') 
                          ? stockLedger.delivery_receipt_url 
                          : `${process.env.NEXT_PUBLIC_FILE_URL || 'http://localhost:8080'}${stockLedger.delivery_receipt_url}`
                      }
                      alt="Current delivery receipt"
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.fallback') as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="fallback hidden absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Eye className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Click to view full image</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
                        <Eye className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {stockLedger.delivery_receipt_url}
                  </p>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  {stockLedger.delivery_receipt_url && !selectedFile ? "Replace Receipt:" : "Upload Receipt:"}
                </div>
                <FileUpload
                  onFileSelect={setSelectedFile}
                  selectedFile={selectedFile}
                  placeholder="Upload delivery receipt (PNG, JPG, PDF)"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="payment_reference">Payment Reference</Label>
            <Input
              id="payment_reference"
              value={formData.payment_reference}
              onChange={(e) => handleInputChange("payment_reference", e.target.value)}
              placeholder="PAY-123456"
            />
          </div>

          {/* Items section for both Booking and Delivery types */}
          {(formData.type === "Booking" || formData.type === "Delivery") && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {formData.type === "Booking" ? "Stock Ledger Items" : "Delivery Items"}
                  </h3>
                  <div className="text-sm text-gray-500">
                    Click edit to modify items inline
                  </div>
                </div>

                {/* Items table */}
                <div className="rounded-md border shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[200px] font-semibold text-gray-700">Item</TableHead>
                        <TableHead className="w-[120px] font-semibold text-gray-700">Quantity</TableHead>
                        <TableHead className="w-[120px] font-semibold text-gray-700">Unit</TableHead>
                        <TableHead className="w-[140px] font-semibold text-gray-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Existing items */}
                      {stockLedgerItems.map((item, index) => (
                        <TableRow 
                          key={index} 
                          className={`${item.isEditing ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'} transition-colors`}
                        >
                          <TableCell className="font-medium">
                            {item.isEditing ? (
                              <Select 
                                value={item.item_id.toString()} 
                                onValueChange={(value) => handleItemChange(index, 'item_id', parseInt(value))}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                                <SelectContent>
                                  {items.map((itm) => (
                                    <SelectItem key={itm.id} value={itm.id.toString()}>
                                      {itm.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  item.isNew ? 'bg-green-500' : 'bg-blue-500'
                                }`}></div>
                                <span>{item.item?.name || `Item #${item.item_id}`}</span>
                                {item.isNew && (
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                    New
                                  </Badge>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.isEditing ? (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className="h-8 w-full"
                                placeholder="0.00"
                                autoFocus
                              />
                            ) : (
                              <div className="font-semibold text-gray-900">
                                {item.quantity.toLocaleString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {item.isEditing ? (
                              <Select 
                                value={item.unit_id.toString()} 
                                onValueChange={(value) => handleItemChange(index, 'unit_id', parseInt(value))}
                              >
                                <SelectTrigger className="h-8">
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {units.map((unit) => (
                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                      {unit.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="text-sm text-gray-600">
                                {item.unit?.name || `Unit #${item.unit_id}`}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {item.isEditing ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleSaveItem(index)}
                                    className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                    title="Save changes"
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancelEdit(index)}
                                    className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                                    title="Cancel editing"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditItem(index)}
                                    className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                                    title="Edit item"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteItem(index)}
                                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    title="Delete item"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Add new row - only show when showAddRow is true */}
                      {showAddRow && (
                        <TableRow className="bg-green-50 border-green-200">
                          <TableCell>
                            <Select 
                              value={newItemForm.item_id} 
                              onValueChange={(value) => handleNewItemFormChange("item_id", value)}
                            >
                              <SelectTrigger className="h-8 border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Select item *" />
                              </SelectTrigger>
                              <SelectContent>
                                {items.map((item) => (
                                  <SelectItem key={item.id} value={item.id.toString()}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={newItemForm.quantity}
                              onChange={(e) => handleNewItemFormChange("quantity", e.target.value)}
                              placeholder="0.00 *"
                              className="h-8 w-full border-green-300 focus:border-green-500"
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={newItemForm.unit_id} 
                              onValueChange={(value) => handleNewItemFormChange("unit_id", value)}
                            >
                              <SelectTrigger className="h-8 border-green-300 focus:border-green-500">
                                <SelectValue placeholder="Select unit *" />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit.id} value={unit.id.toString()}>
                                    {unit.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                onClick={handleAddItem}
                                className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 text-white"
                                disabled={!newItemForm.item_id || !newItemForm.quantity || !newItemForm.unit_id}
                                title="Add item"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setShowAddRow(false)}
                                className="h-8 w-8 p-0 border-gray-300 hover:bg-gray-50"
                                title="Cancel adding"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Add New Button */}
                {!showAddRow && (
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {stockLedgerItems.length} item{stockLedgerItems.length !== 1 ? 's' : ''} in this {formData.type.toLowerCase()}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddRow(true)}
                      className="gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Item
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Stock Ledger"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Image Preview Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-black/95">
          <div className="relative flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/80 text-white">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span className="font-medium">Delivery Receipt Preview</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowImageModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center p-4 bg-gray-900">
              {stockLedger.delivery_receipt_url && (
                <div className="relative max-w-full max-h-full">
                  <img
                    src={
                      stockLedger.delivery_receipt_url.startsWith('http') 
                        ? stockLedger.delivery_receipt_url 
                        : `${process.env.NEXT_PUBLIC_FILE_URL || 'http://localhost:8080'}${stockLedger.delivery_receipt_url}`
                    }
                    alt="Delivery Receipt"
                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg text-white p-6';
                      fallback.innerHTML = `
                        <div class="text-center">
                          <Eye className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p class="text-lg font-medium mb-2">Unable to load image</p>
                          <p class="text-sm text-gray-300 mb-4">This file may not be an image or the URL is invalid</p>
                          <a href="${stockLedger.delivery_receipt_url?.startsWith('http') 
                            ? stockLedger.delivery_receipt_url 
                            : `${process.env.NEXT_PUBLIC_FILE_URL || 'http://localhost:8080'}${stockLedger.delivery_receipt_url}`}" 
                            target="_blank" 
                            class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in new tab
                          </a>
                        </div>
                      `;
                      target.parentNode?.insertBefore(fallback, target.nextSibling);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-black/80 text-white border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300 truncate max-w-md">
                  {stockLedger.delivery_receipt_url}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-gray-600 hover:bg-white/10"
                    onClick={() => {
                      const fullUrl = stockLedger.delivery_receipt_url?.startsWith('http') 
                        ? stockLedger.delivery_receipt_url 
                        : `${process.env.NEXT_PUBLIC_FILE_URL || 'http://localhost:8080'}${stockLedger.delivery_receipt_url}`
                      window.open(fullUrl, '_blank')
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Original
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FileUpload } from "@/components/ui/file-upload"
import { StockLedgerCombobox } from "@/components/ui/stock-ledger-combobox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Plus, Trash2, X } from "lucide-react"

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
  item_id: number
  quantity: number
  unit_id: number
  delivery_quantity?: number
  item?: {
    id: number
    name: string
  }
  unit?: {
    id: number
    name: string
  }
  item_stats?: {
    ordered: number
    delivered: number
    remaining: number
    percentage: number
  }
}

interface AddStockLedgerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  initialData?: {
    type?: "Booking" | "Delivery"
    parent_id?: number
    job_id?: number
    vendor_id?: number
  }
}

export function AddStockLedgerDialog({ open, onOpenChange, onSuccess, initialData }: AddStockLedgerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stockLedgers, setStockLedgers] = useState<any[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [stockLedgerItems, setStockLedgerItems] = useState<StockLedgerItem[]>([])
  const [parentBookingItems, setParentBookingItems] = useState<StockLedgerItem[]>([])
  const [parentItemsLoading, setParentItemsLoading] = useState(false)
  const [formData, setFormData] = useState({
    job_id: initialData?.job_id?.toString() || "",
    type: initialData?.type || "Booking" as "Booking" | "Delivery",
    parent_id: initialData?.parent_id,
    vendor_id: initialData?.vendor_id?.toString() || "",
    payment_reference: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // Item form data
  const [itemFormData, setItemFormData] = useState({
    item_id: "",
    quantity: "",
    unit_id: "",
  })
  const [showAddRow, setShowAddRow] = useState(false)

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

  const fetchParentBookingItems = async (parentId: number) => {
    const id = Number(parentId)
    if (!id) {
      setParentBookingItems([])
      return
    }
    setParentItemsLoading(true)
    try {
      let currentId: number | null = id
      let bookingEntry: { type?: string; items?: unknown[]; stock_ledger_items?: unknown[]; parent_id?: number | null } | undefined
      let timeline: { type?: string; parent_id?: number | null }[] = []

      while (currentId) {
        const response = await apiService.getStockLedgerTimeline(currentId)
        const raw = response?.data
        timeline = Array.isArray(raw) ? raw : (raw?.data ?? raw?.timeline ?? [])
        bookingEntry = timeline.find((entry: { type?: string }) => entry.type === "Booking")
        if (bookingEntry) break
        const first = timeline[0] as { parent_id?: number | null } | undefined
        currentId = first?.parent_id != null ? Number(first.parent_id) : null
      }

      const items = bookingEntry?.items ?? bookingEntry?.stock_ledger_items
      if (bookingEntry && Array.isArray(items) && items.length > 0) {
        setParentBookingItems(items as StockLedgerItem[])
      } else {
        setParentBookingItems([])
      }
    } catch (error) {
      console.error("Error fetching parent booking items:", error)
      setParentBookingItems([])
    } finally {
      setParentItemsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchJobs()
      fetchVendors()
      fetchStockLedgers()
      fetchItems()
      fetchUnits()
    }
  }, [open])

  useEffect(() => {
    if (open && formData.type === "Delivery" && formData.parent_id) {
      fetchParentBookingItems(formData.parent_id)
    } else {
      setParentBookingItems([])
    }
  }, [open, formData.type, formData.parent_id])

  const openRef = useRef(false)
  useEffect(() => {
    if (open && !openRef.current) {
      openRef.current = true
      if (initialData) {
        setFormData({
          job_id: initialData.job_id?.toString() || "",
          type: initialData.type || "Booking",
          parent_id: initialData.parent_id,
          vendor_id: initialData.vendor_id?.toString() || "",
          payment_reference: "",
        })
      }
    }
    if (!open) openRef.current = false
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.job_id || !formData.vendor_id) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate file upload for delivery type
    if (formData.type === "Delivery" && !selectedFile) {
      toast.error("Please upload a delivery receipt for delivery type")
      return
    }

    try {
      setLoading(true)
      
      // Check if there are any filled form fields that haven't been added yet
      if (formData.type === "Booking" && itemFormData.item_id && itemFormData.quantity && itemFormData.unit_id) {
        // Auto-add the current form data before saving
        const selectedItem = items.find(item => item.id === parseInt(itemFormData.item_id))
        const selectedUnit = units.find(unit => unit.id === parseInt(itemFormData.unit_id))

        const newItem: StockLedgerItem = {
          item_id: parseInt(itemFormData.item_id),
          quantity: parseFloat(itemFormData.quantity),
          unit_id: parseInt(itemFormData.unit_id),
          item: selectedItem,
          unit: selectedUnit,
        }

        setStockLedgerItems(prev => [...prev, newItem])
      }
      
      // Always use FormData (multipart/form-data) for all types
      const formDataToSubmit = new FormData()
      formDataToSubmit.append('job_id', formData.job_id)
      formDataToSubmit.append('type', formData.type)
      if (formData.parent_id) {
        formDataToSubmit.append('parent_id', formData.parent_id.toString())
      }
      formDataToSubmit.append('vendor_id', formData.vendor_id)
      if (selectedFile) {
        formDataToSubmit.append('delivery_receipt', selectedFile)
      }
      if (formData.payment_reference) {
        formDataToSubmit.append('payment_reference', formData.payment_reference)
      }

      const response = await apiService.createStockLedgerWithFile(formDataToSubmit)
      const createdStockLedgerId = response.data.id
      
      // Create stock ledger items if it's a booking and items are added
      if (formData.type === "Booking" && stockLedgerItems.length > 0) {
        for (const item of stockLedgerItems) {
          await apiService.createStockLedgerItem({
            stock_ledger_id: createdStockLedgerId,
            item_id: item.item_id,
            quantity: item.quantity,
            unit_id: item.unit_id,
          })
        }
      }

      // Create stock ledger items if it's a delivery and items have delivery quantities
      if (formData.type === "Delivery" && parentBookingItems.length > 0) {
        for (const item of parentBookingItems) {
          if (item.delivery_quantity && item.delivery_quantity > 0) {
            await apiService.createStockLedgerItem({
              stock_ledger_id: createdStockLedgerId,
              item_id: item.item_id,
              quantity: item.delivery_quantity,
              unit_id: item.unit_id,
            })
          }
        }
      }
      
      toast.success("Stock ledger created successfully")
      onOpenChange(false)
      onSuccess?.()
      
      // Reset form
      setFormData({
        job_id: "",
        type: "Booking",
        parent_id: undefined,
        vendor_id: "",
        payment_reference: "",
      })
      setSelectedFile(null)
      setStockLedgerItems([])
      setParentBookingItems([])
      setItemFormData({
        item_id: "",
        quantity: "",
        unit_id: "",
      })
    } catch (error) {
      console.error("Error creating stock ledger:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value }
      if (field === "type" && value === "Booking") {
        next.parent_id = undefined
      }
      return next
    })
  }

  const handleParentChange = (parentId: number | undefined) => {
    if (parentId != null) {
      const id = Number(parentId)
      const parentLedger = stockLedgers.find((ledger: { id: number }) => ledger.id === id)
      setFormData(prev => ({
        ...prev,
        parent_id: id,
        ...(parentLedger
          ? {
              job_id: String(parentLedger.job_id),
              vendor_id: String(parentLedger.vendor_id),
            }
          : {}),
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        parent_id: undefined,
        job_id: "",
        vendor_id: "",
      }))
    }
  }

  const handleAddItem = () => {
    if (!itemFormData.item_id || !itemFormData.quantity || !itemFormData.unit_id) {
      toast.error("Please fill in all item fields")
      return
    }

    const selectedItem = items.find(item => item.id === parseInt(itemFormData.item_id))
    const selectedUnit = units.find(unit => unit.id === parseInt(itemFormData.unit_id))

    const newItem: StockLedgerItem = {
      item_id: parseInt(itemFormData.item_id),
      quantity: parseFloat(itemFormData.quantity),
      unit_id: parseInt(itemFormData.unit_id),
      item: selectedItem,
      unit: selectedUnit,
    }

    setStockLedgerItems(prev => [...prev, newItem])
    setItemFormData({
      item_id: "",
      quantity: "",
      unit_id: "",
    })
  }

  const handleAutoAddItem = async () => {
    if (itemFormData.item_id && itemFormData.quantity && itemFormData.unit_id) {
      const selectedItem = items.find(item => item.id === parseInt(itemFormData.item_id))
      const selectedUnit = units.find(unit => unit.id === parseInt(itemFormData.unit_id))

      const newItem: StockLedgerItem = {
        item_id: parseInt(itemFormData.item_id),
        quantity: parseFloat(itemFormData.quantity),
        unit_id: parseInt(itemFormData.unit_id),
        item: selectedItem,
        unit: selectedUnit,
      }

      // Add to local state first
      setStockLedgerItems(prev => [...prev, newItem])
      
      // Reset form and hide add row
      setItemFormData({
        item_id: "",
        quantity: "",
        unit_id: "",
      })
      setShowAddRow(false)

      // Show success message
      toast.success("Item added to list (will be saved with stock ledger)")
    }
  }

  const handleRemoveItem = (index: number) => {
    setStockLedgerItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleItemInputChange = (field: string, value: string) => {
    const updatedForm = {
      ...itemFormData,
      [field]: value
    }
    setItemFormData(updatedForm)
  }

  const handleDeliveryQuantityChange = (itemId: number, quantity: number) => {
    setParentBookingItems(prev => 
      prev.map(item => 
        item.item_id === itemId 
          ? { ...item, delivery_quantity: quantity }
          : item
      )
    )
  }

  // Auto-add item when all fields are filled
  useEffect(() => {
    if (itemFormData.item_id && itemFormData.quantity && itemFormData.unit_id) {
      const timer = setTimeout(() => {
        handleAutoAddItem()
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [itemFormData.item_id, itemFormData.quantity, itemFormData.unit_id])


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Stock Ledger</DialogTitle>
          <DialogDescription>
            Create a new stock ledger entry for inventory management.
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

          {formData.type !== "Booking" && (
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent Stock Ledger</Label>
              <StockLedgerCombobox
                value={formData.parent_id}
                onValueChange={handleParentChange}
                placeholder="Select parent stock ledger (optional)"
              />
            </div>
          )}

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
            <div className="space-y-2">
              <Label htmlFor="delivery_receipt">Delivery Receipt *</Label>
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                placeholder="Upload delivery receipt (PNG, JPG, PDF)"
              />
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

          {/* Items section for Booking type */}
          {formData.type === "Booking" && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Stock Ledger Items</h3>
                
                {/* Items table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Existing items */}
                      {stockLedgerItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.item?.name || `Item #${item.item_id}`}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unit?.name || `Unit #${item.unit_id}`}</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveItem(index)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}

                      {/* Add new row - only show when showAddRow is true */}
                      {showAddRow && (
                        <TableRow className="bg-gray-50">
                          <TableCell>
                            <Select 
                              value={itemFormData.item_id} 
                              onValueChange={(value) => handleItemInputChange("item_id", value)}
                            >
                              <SelectTrigger>
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
                              value={itemFormData.quantity}
                              onChange={(e) => handleItemInputChange("quantity", e.target.value)}
                              placeholder="0.00 *"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Select 
                              value={itemFormData.unit_id} 
                              onValueChange={(value) => handleItemInputChange("unit_id", value)}
                            >
                              <SelectTrigger>
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
                                className="h-8 w-8 p-0"
                                disabled={!itemFormData.item_id || !itemFormData.quantity || !itemFormData.unit_id}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setShowAddRow(false)}
                                className="h-8 w-8 p-0"
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
                  <div className="mt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddRow(true)}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add New Item
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Items section for Delivery type */}
          {formData.type === "Delivery" && formData.parent_id && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Delivery Items</h3>
                {parentItemsLoading ? (
                  <p className="text-sm text-muted-foreground py-4">Loading parent booking items...</p>
                ) : parentBookingItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No items found for the selected parent booking.</p>
                ) : (
                  <>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter delivery quantities for each item. Current status is shown for reference.
                </p>
                
                {/* Delivery items table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Ordered</TableHead>
                        <TableHead>Delivered</TableHead>
                        <TableHead>Remaining</TableHead>
                        <TableHead>Delivery Qty</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parentBookingItems.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.item?.name || `Item #${item.item_id}`}</div>
                              <div className="text-xs text-muted-foreground">{item.unit?.name || `Unit #${item.unit_id}`}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-blue-600">
                              {item.quantity.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-green-600">
                              {item.item_stats?.delivered?.toLocaleString() || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold text-orange-600">
                              {item.item_stats?.remaining?.toLocaleString() || item.quantity.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={item.item_stats?.remaining || item.quantity}
                              value={item.delivery_quantity || ""}
                              onChange={(e) => handleDeliveryQuantityChange(item.item_id, parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={
                                (item.item_stats?.percentage || 0) === 100
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : (item.item_stats?.percentage || 0) > 0
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {item.item_stats?.percentage || 0}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                  </>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Stock Ledger"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface StockLedgerItem {
  id: number
  stock_ledger_id: number
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
}

interface Item {
  id: number
  name: string
}

interface Unit {
  id: number
  name: string
}

interface StockLedgerItemsDialogProps {
  stockLedgerId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockLedgerItemsDialog({ stockLedgerId, open, onOpenChange }: StockLedgerItemsDialogProps) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [stockLedgerItems, setStockLedgerItems] = useState<StockLedgerItem[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockLedgerItem | null>(null)
  const [formData, setFormData] = useState({
    item_id: "",
    quantity: "",
    unit_id: "",
  })

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
    if (!stockLedgerId) return

    try {
      setLoading(true)
      const response = await apiService.getStockLedgerItems({
        stock_ledger_id: stockLedgerId,
        page: 1,
        size: 100
      })
      setStockLedgerItems(response.data.data || [])
    } catch (error) {
      console.error("Error fetching stock ledger items:", error)
      toast.error("Failed to fetch stock ledger items")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchItems()
      fetchUnits()
      fetchStockLedgerItems()
    }
  }, [open, stockLedgerId])

  const handleAddItem = () => {
    setFormData({
      item_id: "",
      quantity: "",
      unit_id: "",
    })
    setIsAddDialogOpen(true)
  }

  const handleEditItem = (item: StockLedgerItem) => {
    setSelectedItem(item)
    setFormData({
      item_id: item.item_id.toString(),
      quantity: item.quantity.toString(),
      unit_id: item.unit_id.toString(),
    })
    setIsEditDialogOpen(true)
  }

  const handleDeleteItem = async (item: StockLedgerItem) => {
    try {
      await apiService.deleteStockLedgerItem(item.id)
      setStockLedgerItems(stockLedgerItems.filter((i) => i.id !== item.id))
      toast.success("Stock ledger item deleted successfully")
    } catch (error) {
      console.error("Error deleting stock ledger item:", error)
      toast.error("Failed to delete stock ledger item")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stockLedgerId || !formData.item_id || !formData.quantity || !formData.unit_id) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const submitData = {
        stock_ledger_id: stockLedgerId,
        item_id: parseInt(formData.item_id),
        quantity: parseFloat(formData.quantity),
        unit_id: parseInt(formData.unit_id),
      }

      if (selectedItem) {
        await apiService.updateStockLedgerItem(selectedItem.id, submitData)
        toast.success("Stock ledger item updated successfully")
      } else {
        await apiService.createStockLedgerItem(submitData)
        toast.success("Stock ledger item created successfully")
      }

      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      setSelectedItem(null)
      fetchStockLedgerItems()
    } catch (error) {
      console.error("Error saving stock ledger item:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!stockLedgerId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock Ledger Items</DialogTitle>
          <DialogDescription>
            Manage items for stock ledger #{stockLedgerId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Items</h3>
            <Button onClick={handleAddItem} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockLedgerItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    stockLedgerItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">
                          {item.item?.name || `Item #${item.item_id}`}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {item.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unit?.name || `Unit #${item.unit_id}`}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditItem(item)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteItem(item)} 
                                className="text-destructive"
                              >
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
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>

        {/* Add/Edit Item Dialog */}
        <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false)
            setIsEditDialogOpen(false)
            setSelectedItem(null)
          }
        }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>{selectedItem ? "Edit Item" : "Add Item"}</DialogTitle>
              <DialogDescription>
                {selectedItem ? "Update the stock ledger item details." : "Add a new item to the stock ledger."}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="item_id">Item *</Label>
                <Select value={formData.item_id} onValueChange={(value) => handleInputChange("item_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_id">Unit *</Label>
                <Select value={formData.unit_id} onValueChange={(value) => handleInputChange("unit_id", value)}>
                  <SelectTrigger>
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
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false)
                  setIsEditDialogOpen(false)
                  setSelectedItem(null)
                }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : selectedItem ? "Update Item" : "Add Item"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

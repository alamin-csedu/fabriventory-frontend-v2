"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Supplier {
  id: number
  name: string
}

interface AddPurchaseInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPurchaseInvoiceDialog({ open, onOpenChange }: AddPurchaseInvoiceDialogProps) {
  const [piNo, setPiNo] = useState("")
  const [piQty, setPiQty] = useState("")
  const [supplierId, setSupplierId] = useState("")
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock suppliers data - replace with actual API call
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      { id: 1, name: "XYZ Fabrics Ltd" },
      { id: 2, name: "Premium Textiles Co" },
      { id: 3, name: "Global Fabric Supply" },
      { id: 4, name: "Quality Materials Inc" },
      { id: 5, name: "Eco Fabrics Solutions" },
    ]
    setSuppliers(mockSuppliers)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!piNo.trim() || !piQty.trim() || !supplierId) return

    const quantity = Number.parseInt(piQty)
    if (isNaN(quantity) || quantity <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // API call to create purchase invoice
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${baseUrl}/purchase-invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pi_no: piNo.trim(),
          pi_qty: quantity,
          supplier_id: Number.parseInt(supplierId),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Purchase invoice created successfully",
        })
        // Reset form
        setPiNo("")
        setPiQty("")
        setSupplierId("")
        onOpenChange(false)
        // Refresh the invoices list
        window.location.reload()
      } else {
        throw new Error("Failed to create purchase invoice")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create purchase invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Purchase Invoice</DialogTitle>
          <DialogDescription>Create a new purchase invoice for supplier transactions.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="piNo">PI Number</Label>
              <Input
                id="piNo"
                placeholder="e.g., PI-2024-001"
                value={piNo}
                onChange={(e) => setPiNo(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select value={supplierId} onValueChange={setSupplierId} required>
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

            <div className="grid gap-2">
              <Label htmlFor="piQty">Quantity</Label>
              <Input
                id="piQty"
                type="number"
                placeholder="e.g., 1000"
                value={piQty}
                onChange={(e) => setPiQty(e.target.value)}
                min="1"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !piNo.trim() || !piQty.trim() || !supplierId}>
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

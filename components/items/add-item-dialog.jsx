"use client"

import { useState } from "react"
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
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export function AddItemDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    color_id: ""
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.category_id.trim() || !formData.color_id.trim()) {
      toast.error("Item name, category ID, and color ID are required")
      return
    }

    setLoading(true)

    try {
      const itemData = {
        name: formData.name.trim(),
        category_id: parseInt(formData.category_id),
        color_id: parseInt(formData.color_id)
      }

      await onSubmit(itemData)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating item:', error)
      // Error handling is now done in the parent component
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      color_id: ""
    })
  }

  const handleOpenChange = (open) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Create a new item for your fabric inventory system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category_id">Category ID *</Label>
              <Input
                id="category_id"
                type="number"
                placeholder="Enter category ID"
                value={formData.category_id}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color_id">Color ID *</Label>
              <Input
                id="color_id"
                type="number"
                placeholder="Enter color ID"
                value={formData.color_id}
                onChange={(e) => setFormData(prev => ({ ...prev, color_id: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim() || !formData.category_id.trim() || !formData.color_id.trim()}>
              {loading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

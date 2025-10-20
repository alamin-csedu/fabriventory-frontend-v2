"use client"

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
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export function EditItemDialog({ item, open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    color_id: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (item && open) {
      setFormData({
        name: item.name || "",
        category_id: item.category_id ? item.category_id.toString() : "",
        color_id: item.color_id ? item.color_id.toString() : ""
      })
    }
  }, [item, open])

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

      await onSubmit(item.id, itemData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating item:', error)
      // Error handling is now done in the parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the item information.
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim() || !formData.category_id.trim() || !formData.color_id.trim()}>
              {loading ? "Updating..." : "Update Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

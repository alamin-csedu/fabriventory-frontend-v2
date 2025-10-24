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
import { Combobox } from "@/components/ui/combobox"
import { ColorCombobox } from "@/components/ui/color-combobox"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export function AddItemDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    color_id: ""
  })
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [colors, setColors] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  // Fetch categories and colors when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategoriesAndColors()
    }
  }, [open])

  const fetchCategoriesAndColors = async () => {
    setLoadingData(true)
    try {
      const [categoriesResponse, colorsResponse] = await Promise.all([
        apiService.getCategories(),
        apiService.getColors()
      ])
      
      setCategories(categoriesResponse.data?.data || [])
      setColors(colorsResponse.data?.data || [])
    } catch (error) {
      console.error('Error fetching categories and colors:', error)
      toast.error('Failed to load categories and colors')
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.category_id.trim()) {
      toast.error("Item name and category are required")
      return
    }

    setLoading(true)

    try {
      const itemData = {
        name: formData.name.trim(),
        category_id: parseInt(formData.category_id),
        ...(formData.color_id && { color_id: parseInt(formData.color_id) })
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
              <Label htmlFor="category_id">Category *</Label>
              <Combobox
                options={categories.map(category => ({
                  value: category.id.toString(),
                  label: category.name
                }))}
                value={formData.category_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                placeholder="Select category..."
                searchPlaceholder="Search categories..."
                emptyText="No categories found."
                disabled={loadingData}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color_id">Color</Label>
              <ColorCombobox
                options={colors.map(color => ({
                  value: color.id.toString(),
                  label: color.name,
                  colorCode: color.color_code
                }))}
                value={formData.color_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, color_id: value }))}
                placeholder="Select color..."
                searchPlaceholder="Search colors..."
                emptyText="No colors found."
                disabled={loadingData}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || loadingData || !formData.name.trim() || !formData.category_id.trim()}>
              {loading ? "Creating..." : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

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
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export function AddStorageDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    capacity: ""
  })
  const [loading, setLoading] = useState(false)
  const [parentStorageOptions, setParentStorageOptions] = useState([])
  const [loadingParents, setLoadingParents] = useState(false)

  // Fetch parent storage options when dialog opens
  const fetchParentStorageOptions = async () => {
    try {
      setLoadingParents(true)
      const response = await apiService.getStorages({ page: 1, size: 100 })
      
      if (response.data?.data) {
        const options = response.data.data.map(storage => ({
          value: storage.id.toString(),
          label: storage.name
        }))
        setParentStorageOptions(options)
      }
    } catch (error) {
      console.error('Error fetching parent storage options:', error)
      toast.error('Failed to load parent storage options')
    } finally {
      setLoadingParents(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchParentStorageOptions()
    }
  }, [open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error("Storage name is required")
      return
    }

    setLoading(true)

    try {
      const storageData = {
        name: formData.name.trim(),
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        capacity: formData.capacity ? parseFloat(formData.capacity) : null
      }

      await onSubmit(storageData)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating storage:', error)
      // Error handling is now done in the parent component
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      parent_id: "",
      capacity: ""
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Storage Location</DialogTitle>
          <DialogDescription>
            Create a new storage location for your fabric inventory system.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Storage Name *</Label>
              <Input
                id="name"
                placeholder="Enter storage location name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="parent_id">Parent Storage Location</Label>
              <Combobox
                options={parentStorageOptions}
                value={formData.parent_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, parent_id: value }))}
                placeholder="Select parent storage (optional)"
                searchPlaceholder="Search storage locations..."
                emptyText="No storage locations found."
                disabled={loadingParents}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for main storage locations
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                step="0.01"
                placeholder="Enter storage capacity (optional)"
                value={formData.capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Storage capacity in units (optional)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? "Creating..." : "Create Storage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

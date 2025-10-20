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
import { Textarea } from "@/components/ui/textarea"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

export function EditJobDialog({ job, open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    customer_id: ""
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (job && open) {
      setFormData({
        name: job.name || "",
        description: job.description || "",
        customer_id: job.customer_id ? job.customer_id.toString() : ""
      })
    }
  }, [job, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.customer_id.trim()) {
      toast.error("Job name and customer ID are required")
      return
    }

    setLoading(true)

    try {
      const jobData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        customer_id: parseInt(formData.customer_id)
      }

      await onSubmit(job.id, jobData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating job:', error)
      // Error handling is now done in the parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            Update the job information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Job Name *</Label>
              <Input
                id="name"
                placeholder="Enter job name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Input
                id="customer_id"
                type="number"
                placeholder="Enter customer ID"
                value={formData.customer_id}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_id: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter job description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim() || !formData.customer_id.trim()}>
              {loading ? "Updating..." : "Update Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

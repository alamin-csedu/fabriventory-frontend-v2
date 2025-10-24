"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiService } from "@/lib/api"
import { toast } from "sonner"

interface Job {
  id: number
  name: string
}

interface Vendor {
  id: number
  name: string
}

interface AddStockLedgerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddStockLedgerDialog({ open, onOpenChange, onSuccess }: AddStockLedgerDialogProps) {
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [formData, setFormData] = useState({
    job_id: "",
    type: "Booking" as "Booking" | "Delivery",
    parent_id: "",
    vendor_id: "",
    delivery_receipt_url: "",
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

  useEffect(() => {
    if (open) {
      fetchJobs()
      fetchVendors()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.job_id || !formData.vendor_id) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      const submitData = {
        job_id: parseInt(formData.job_id),
        type: formData.type,
        parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
        vendor_id: parseInt(formData.vendor_id),
        delivery_receipt_url: formData.delivery_receipt_url || null,
        payment_reference: formData.payment_reference || null,
      }

      await apiService.createStockLedger(submitData)
      toast.success("Stock ledger created successfully")
      onOpenChange(false)
      onSuccess?.()
      
      // Reset form
      setFormData({
        job_id: "",
        type: "Booking",
        parent_id: "",
        vendor_id: "",
        delivery_receipt_url: "",
        payment_reference: "",
      })
    } catch (error) {
      console.error("Error creating stock ledger:", error)
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
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
              <Select value={formData.job_id} onValueChange={(value) => handleInputChange("job_id", value)}>
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
                  <SelectItem value="IN">IN</SelectItem>
                  <SelectItem value="OUT">OUT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parent_id">Parent ID</Label>
              <Input
                id="parent_id"
                type="number"
                value={formData.parent_id}
                onChange={(e) => handleInputChange("parent_id", e.target.value)}
                placeholder="Optional parent ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor_id">Vendor *</Label>
              <Select value={formData.vendor_id} onValueChange={(value) => handleInputChange("vendor_id", value)}>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_receipt_url">Delivery Receipt URL</Label>
            <Input
              id="delivery_receipt_url"
              type="url"
              value={formData.delivery_receipt_url}
              onChange={(e) => handleInputChange("delivery_receipt_url", e.target.value)}
              placeholder="https://example.com/receipt.pdf"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_reference">Payment Reference</Label>
            <Input
              id="payment_reference"
              value={formData.payment_reference}
              onChange={(e) => handleInputChange("payment_reference", e.target.value)}
              placeholder="PAY-123456"
            />
          </div>

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

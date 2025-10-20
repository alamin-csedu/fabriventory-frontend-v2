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
import { Plus, X } from "lucide-react"

export function EditVendorDialog({ vendor, open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    email: "",
    phone_number: [""]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (vendor && open) {
      setFormData({
        name: vendor.name || "",
        address: vendor.address || "",
        email: vendor.email || "",
        phone_number: vendor.phone_number && vendor.phone_number.length > 0 
          ? vendor.phone_number 
          : [""]
      })
    }
  }, [vendor, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required")
      return
    }

    // Filter out empty phone numbers
    const phoneNumbers = formData.phone_number.filter(phone => phone.trim() !== "")

    setLoading(true)

    try {
      const vendorData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        email: formData.email.trim(),
        phone_number: phoneNumbers
      }

      await onSubmit(vendor.id, vendorData)
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false)
    }
  }

  const addPhoneNumber = () => {
    setFormData(prev => ({
      ...prev,
      phone_number: [...prev.phone_number, ""]
    }))
  }

  const removePhoneNumber = (index) => {
    if (formData.phone_number.length > 1) {
      setFormData(prev => ({
        ...prev,
        phone_number: prev.phone_number.filter((_, i) => i !== index)
      }))
    }
  }

  const updatePhoneNumber = (index, value) => {
    setFormData(prev => ({
      ...prev,
      phone_number: prev.phone_number.map((phone, i) => i === index ? value : phone)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Vendor</DialogTitle>
          <DialogDescription>
            Update the vendor information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                placeholder="Enter vendor name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter vendor email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter vendor address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Phone Numbers</Label>
              {formData.phone_number.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => updatePhoneNumber(index, e.target.value)}
                  />
                  {formData.phone_number.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removePhoneNumber(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhoneNumber}
                className="w-fit"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phone Number
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim() || !formData.email.trim()}>
              {loading ? "Updating..." : "Update Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

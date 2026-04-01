"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { apiService } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export const EditUnitConversionDialog = ({ open, onOpenChange, conversion, onSuccess }) => {
  const [formData, setFormData] = useState({
    from_id: "",
    to_id: "",
    operation: "MULTIPLY",
    factor: "",
    sequence: ""
  })
  const [units, setUnits] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingUnits, setLoadingUnits] = useState(false)

  useEffect(() => {
    if (conversion) {
      setFormData({
        from_id: conversion.from_id?.toString() || "",
        to_id: conversion.to_id?.toString() || "",
        operation: conversion.operation || "MULTIPLY",
        factor: conversion.factor?.toString() || "",
        sequence: conversion.sequence?.toString() || ""
      })
    }
  }, [conversion])

  useEffect(() => {
    if (open) {
      fetchUnits()
    }
  }, [open])

  const fetchUnits = async () => {
    try {
      setLoadingUnits(true)
      const response = await apiService.getUnits({ size: 1000 })
      setUnits(response.data.data || [])
    } catch (error) {
      console.error("Error fetching units:", error)
      toast.error("Failed to fetch units")
    } finally {
      setLoadingUnits(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSuccess(conversion.from_id, conversion.to_id, {
        ...formData,
        from_id: parseInt(formData.from_id),
        to_id: parseInt(formData.to_id),
        factor: parseFloat(formData.factor),
        sequence: parseInt(formData.sequence)
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating unit conversion:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Unit Conversion</DialogTitle>
          <DialogDescription>
            Update the unit conversion rule.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="from_id">From Unit</Label>
                <Select
                  value={formData.from_id}
                  onValueChange={(value) => handleInputChange("from_id", value)}
                  disabled={loadingUnits}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from unit" />
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
              <div className="grid gap-2">
                <Label htmlFor="to_id">To Unit</Label>
                <Select
                  value={formData.to_id}
                  onValueChange={(value) => handleInputChange("to_id", value)}
                  disabled={loadingUnits}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select to unit" />
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
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="operation">Operation</Label>
              <Select
                value={formData.operation}
                onValueChange={(value) => handleInputChange("operation", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MULTIPLY">Multiply</SelectItem>
                  <SelectItem value="DIVIDE">Divide</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="factor">Factor</Label>
                <Input
                  id="factor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.factor}
                  onChange={(e) => handleInputChange("factor", e.target.value)}
                  placeholder="Conversion factor (≥ 0)"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sequence">Sequence</Label>
                <Input
                  id="sequence"
                  type="number"
                  min="0"
                  value={formData.sequence}
                  onChange={(e) => handleInputChange("sequence", e.target.value)}
                  placeholder="Order / sequence (≥ 0)"
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || loadingUnits}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Conversion
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

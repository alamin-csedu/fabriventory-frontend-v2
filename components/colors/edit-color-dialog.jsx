"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export const EditColorDialog = ({ open, onOpenChange, color, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    color_code: "",
    rgb: "",
    pantone_code: "",
    description: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (color) {
      setFormData({
        name: color.name || "",
        color_code: color.color_code || "",
        rgb: color.rgb || "",
        pantone_code: color.pantone_code || "",
        description: color.description || ""
      })
    }
  }, [color])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSuccess(color.id, formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating color:", error)
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

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? 
      `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : 
      null
  }

  const handleColorChange = (hexValue) => {
    const rgbValue = hexToRgb(hexValue)
    setFormData(prev => ({
      ...prev,
      color_code: hexValue,
      rgb: rgbValue || prev.rgb
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Color</DialogTitle>
          <DialogDescription>
            Update the color information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Color Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter color name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="color_code">Color Code *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color_code"
                  value={formData.color_code}
                  onChange={(e) => handleInputChange("color_code", e.target.value)}
                  placeholder="Enter hex color code"
                  required
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <div 
                    className="w-8 h-8 rounded border border-input"
                    style={{ backgroundColor: formData.color_code || "#000000" }}
                    title="Color preview"
                  />
                  <input
                    type="color"
                    value={formData.color_code || "#000000"}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-12 h-10 rounded border border-input cursor-pointer"
                    title="Pick a color"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rgb">RGB Values</Label>
              <Input
                id="rgb"
                value={formData.rgb}
                onChange={(e) => handleInputChange("rgb", e.target.value)}
                placeholder="Enter RGB values"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="pantone_code">Pantone Code</Label>
              <Input
                id="pantone_code"
                value={formData.pantone_code}
                onChange={(e) => handleInputChange("pantone_code", e.target.value)}
                placeholder="Enter Pantone code"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter color description"
                rows={3}
              />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Color
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

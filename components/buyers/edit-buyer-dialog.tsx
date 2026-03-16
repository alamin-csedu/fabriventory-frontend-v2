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
import { useToast } from "@/hooks/use-toast"

interface Buyer {
  id: number
  name: string
  createdAt: string
  contractsCount: number
  totalValue: number
  status: "active" | "inactive"
}

interface EditBuyerDialogProps {
  buyer: Buyer
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditBuyerDialog({ buyer, open, onOpenChange, onSuccess }: EditBuyerDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (buyer) {
      setName(buyer.name)
    }
  }, [buyer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)

    try {
      // API call to update buyer
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${baseUrl}/buyers/${buyer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Buyer updated successfully",
        })
        onSuccess()
      } else {
        throw new Error("Failed to update buyer")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update buyer. Please try again.",
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
          <DialogTitle>Edit Buyer</DialogTitle>
          <DialogDescription>Update the buyer information in your fabric inventory system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Buyer Name</Label>
              <Input
                id="name"
                placeholder="Enter buyer name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? "Updating..." : "Update Buyer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

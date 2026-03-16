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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Buyer {
  id: number
  name: string
}

interface AddSalesContractDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSalesContractDialog({ open, onOpenChange }: AddSalesContractDialogProps) {
  const [contractNo, setContractNo] = useState("")
  const [buyerId, setBuyerId] = useState("")
  const [style, setStyle] = useState("")
  const [jobNo, setJobNo] = useState("")
  const [btbLcNo, setBtbLcNo] = useState("")
  const [buyers, setBuyers] = useState<Buyer[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Mock buyers data - replace with actual API call
  useEffect(() => {
    const mockBuyers: Buyer[] = [
      { id: 1, name: "ABC Textiles Ltd" },
      { id: 2, name: "Fashion Forward Inc" },
      { id: 3, name: "Global Garments Co" },
      { id: 4, name: "Style Solutions" },
      { id: 5, name: "Premium Apparel" },
    ]
    setBuyers(mockBuyers)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contractNo.trim() || !buyerId || !style.trim() || !jobNo.trim()) return

    setLoading(true)

    try {
      // API call to create sales contract
      const baseUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${baseUrl}/sales-contracts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer_id: Number.parseInt(buyerId),
          contract_no: contractNo.trim(),
          style: style.trim(),
          job_no: jobNo.trim(),
          btb_lc_no: btbLcNo.trim() || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Sales contract created successfully",
        })
        // Reset form
        setContractNo("")
        setBuyerId("")
        setStyle("")
        setJobNo("")
        setBtbLcNo("")
        onOpenChange(false)
        // Refresh the contracts list
        window.location.reload()
      } else {
        throw new Error("Failed to create sales contract")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create sales contract. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Sales Contract</DialogTitle>
          <DialogDescription>Create a new sales contract with buyer details and specifications.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="contractNo">Contract Number</Label>
              <Input
                id="contractNo"
                placeholder="e.g., SC-2024-001"
                value={contractNo}
                onChange={(e) => setContractNo(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="buyer">Buyer</Label>
              <Select value={buyerId} onValueChange={setBuyerId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer) => (
                    <SelectItem key={buyer.id} value={buyer.id.toString()}>
                      {buyer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="style">Style</Label>
              <Input
                id="style"
                placeholder="e.g., Summer Collection 2024"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="jobNo">Job Number</Label>
              <Input
                id="jobNo"
                placeholder="e.g., JOB-001"
                value={jobNo}
                onChange={(e) => setJobNo(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="btbLcNo">BTB LC Number (Optional)</Label>
              <Input
                id="btbLcNo"
                placeholder="e.g., LC-2024-001"
                value={btbLcNo}
                onChange={(e) => setBtbLcNo(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !contractNo.trim() || !buyerId || !style.trim() || !jobNo.trim()}
            >
              {loading ? "Creating..." : "Create Contract"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

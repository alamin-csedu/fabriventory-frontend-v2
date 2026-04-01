"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Globe } from "lucide-react"

export const ViewUnitDialog = ({ open, onOpenChange, unit }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unit Details</DialogTitle>
          <DialogDescription>
            View detailed information about the unit.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm font-medium text-muted-foreground">Name</span>
                  <span className="text-sm font-medium">{unit?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Audit Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 py-2 border-b">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Created:</span>
                <span className="text-sm">{formatDate(unit?.created_at)}</span>
              </div>
              {unit?.created_ip && (
                <div className="flex items-center gap-2 py-2 border-b">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Created IP:</span>
                  <span className="text-sm font-mono text-xs">{unit.created_ip}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

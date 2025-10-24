"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, User, Globe, ArrowRight } from "lucide-react"

export const ViewUnitConversionDialog = ({ open, onOpenChange, conversion }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOperationBadge = (operation) => {
    const variants = {
      'MULTIPLY': 'default',
      'DIVIDE': 'secondary'
    }
    return (
      <Badge variant={variants[operation] || 'outline'}>
        {operation}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unit Conversion Details</DialogTitle>
          <DialogDescription>
            View detailed information about the unit conversion.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Conversion Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Conversion Information</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">From Unit</span>
                <span className="text-sm font-medium">{conversion?.from_unit?.name || `Unit ${conversion?.from_id}`}</span>
              </div>
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">To Unit</span>
                <span className="text-sm font-medium">{conversion?.to_unit?.name || `Unit ${conversion?.to_id}`}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Operation</span>
                {getOperationBadge(conversion?.operation)}
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Factor</span>
                <span className="text-sm font-mono font-medium">{conversion?.factor}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Sequence</span>
                <Badge variant="outline">{conversion?.sequence}</Badge>
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
                <span className="text-sm">{formatDate(conversion?.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 py-2 border-b">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                <span className="text-sm">{formatDate(conversion?.updated_at)}</span>
              </div>
              {conversion?.created_by && (
                <div className="flex items-center gap-2 py-2 border-b">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Created By:</span>
                  <span className="text-sm">User ID {conversion.created_by}</span>
                </div>
              )}
              {conversion?.created_ip && (
                <div className="flex items-center gap-2 py-2 border-b">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Created IP:</span>
                  <span className="text-sm font-mono text-xs">{conversion.created_ip}</span>
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

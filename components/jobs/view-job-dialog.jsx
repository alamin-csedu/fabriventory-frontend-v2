"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Hash, User } from "lucide-react"

export function ViewJobDialog({ job, open, onOpenChange }) {
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about {job.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Job Name</p>
                  <p className="text-sm text-muted-foreground">{job.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Customer ID</p>
                  <p className="text-sm text-muted-foreground">#{job.customer_id}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground">{job.description || "No description provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">System Information</h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Job ID</p>
                  <p className="text-sm text-muted-foreground">#{job.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(job.created_at)}</p>
                </div>
              </div>
              
              {job.updated_at && job.updated_at !== job.created_at && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-sm text-muted-foreground">{formatDate(job.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Active
              </Badge>
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

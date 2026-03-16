"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Eye, ExternalLink, X } from "lucide-react"

function normalizeImageUrl(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
}

export interface ImagePreviewModalProps {
  imageUrl: string
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
}

export function ImagePreviewModal({
  imageUrl,
  open,
  onOpenChange,
  title = "Delivery Receipt Preview",
}: ImagePreviewModalProps) {
  const [imageError, setImageError] = useState(false)
  const fullUrl = normalizeImageUrl(imageUrl)

  const handleOpenChange = (next: boolean) => {
    if (!next) setImageError(false)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-6xl w-[98vw] sm:w-[95vw] h-[95vh] max-h-[95vh] p-0 bg-black/95 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">Image preview. Use the button below to open the full image in a new tab.</DialogDescription>
        <div className="flex flex-col min-h-0 flex-1">
          <div className="flex-shrink-0 flex items-center justify-between p-2 sm:p-4 bg-black/80 text-white">
            <div className="flex items-center space-x-2 min-w-0">
              <Eye className="h-5 w-5 shrink-0" />
              <span className="font-medium truncate">{title}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 min-h-0 flex items-center justify-center p-4 bg-gray-900 overflow-auto">
            <div className="relative w-full h-full flex items-center justify-center">
              {!imageError ? (
                <img
                  src={fullUrl}
                  alt={title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 bg-gray-800 rounded-lg text-white p-6 min-w-[320px] max-w-full">
                  <Eye className="h-12 w-12 mb-4 text-gray-400" />
                  <p className="text-lg font-medium mb-2">Unable to load image</p>
                  <p className="text-sm text-gray-300 mb-4 text-center">
                    This file may not be an image or the URL is invalid
                  </p>
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 p-2 sm:p-4 bg-black/80 text-white border-t border-gray-700">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="text-xs sm:text-sm text-gray-300 truncate min-w-0 hidden sm:block">
                {imageUrl}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-gray-600 hover:bg-white/10 shrink-0 w-full sm:w-auto"
                onClick={() => window.open(fullUrl, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import * as React from "react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, X, File, Image, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  accept?: Record<string, string[]>
  maxSize?: number
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function FileUpload({
  onFileSelect,
  selectedFile,
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    "application/pdf": [".pdf"]
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  className,
  disabled = false,
  placeholder = "Drop files here or click to upload"
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled
  })

  const removeFile = () => {
    onFileSelect(null)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={cn("w-full", className)}>
      {selectedFile ? (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <p className="font-medium">{placeholder}</p>
              <p className="text-xs text-gray-500">
                PNG, JPG, PDF up to {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Copy, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Campaign {
  id: string
  name: string
  role: "owner" | "player"
}

interface UploadButtonProps {
  onUploadComplete?: () => void
}

export function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([])
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)



  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
    setUploadedUrls([])
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    setSelectedFiles(files)
    setUploadedUrls([])
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const removeFile = (index: number) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()

      // Add all files to FormData
      selectedFiles.forEach((file) => {
        formData.append("files", file)
      })


      // Upload files with progress simulation
      const uploadPromise = fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await uploadPromise
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const result = await response.json()

      setUploadedUrls(result.assets.map((asset: any) => asset.url))
      setSelectedFiles([])

      toast( "Upload successful",{
        description: result.message,
      })

      onUploadComplete?.()
    } catch (error) {
      console.error("Upload error:", error)
      toast.error( "Upload failed",{
        description: error instanceof Error ? error.message : "There was an error uploading your files",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrl(url)
      toast("Link copied",{
        description: "File link copied to clipboard",
      })
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      toast.error("Copy failed",{
        description: "Failed to copy link to clipboard",
      })
    }
  }

  const resetDialog = () => {
    setSelectedFiles([])
    setUploadedUrls([])
    setUploadProgress(0)
    setIsUploading(false)
    setCopiedUrl(null)
      if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleOpenChange = (open: boolean) => {
    onUploadComplete?.()
    setIsOpen(open)
    if (!open) {
      resetDialog()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">Click to select files or drag and drop</p>
            <p className="text-xs text-muted-foreground">All file formats supported</p>
            <Input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Files:</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFile(index)} disabled={isUploading}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uploading...</Label>
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}% complete</p>
            </div>
          )}

          {/* Uploaded Files with Links */}
          {uploadedUrls.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Uploaded Files:</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uploadedUrls.map((url, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{url.split("/").pop()}</p>
                          <p className="text-xs text-muted-foreground truncate">{url}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(url)} className="ml-2">
                          {copiedUrl === url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              {uploadedUrls.length > 0 ? "Done" : "Cancel"}
            </Button>
            {selectedFiles.length > 0 && !isUploading && uploadedUrls.length === 0 && (
              <Button onClick={uploadFiles}>
                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

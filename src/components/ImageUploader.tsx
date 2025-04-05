"use client";

import type React from "react";

import { uploadAsset } from "@/app/actions/assets"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Copy, ImageIcon, Upload } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

interface ImageUploaderProps {
  onImageInsert: (imageMarkdown: string) => void;
}

export default function ImageUploader({ onImageInsert }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const uploaderId = useId();

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadAsset(file);
      setUploadedUrl(url);
      setShowUrlDialog(true);
      // Reset the file input
      e.target.value = "";
    } catch (error) {
      toast.error("Upload failed", {
        description: "There was an error uploading your image.",
      });
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }

  function copyUrlToClipboard() {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function insertUrlToMarkdown() {
    if (uploadedUrl) {
      // Create markdown image syntax
      const imageMarkdown = `![${
        uploadedUrl.split("/").pop() || "image"
      }](${uploadedUrl})`;
      onImageInsert(imageMarkdown);
      setShowUrlDialog(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => document.getElementById(uploaderId)?.click()}
        disabled={isUploading}
        title="Upload image"
      >
        {isUploading ? (
          <div className="animate-spin">
            <Upload className="h-4 w-4" />
          </div>
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
      <input
        id={uploaderId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        disabled={isUploading}
      />

      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Image Uploaded Successfully</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="border rounded-md p-2 bg-muted/50">
              <p className="text-sm font-mono break-all">{uploadedUrl}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={copyUrlToClipboard}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy URL"}
              </Button>
              <Button onClick={insertUrlToMarkdown}>Insert into Post</Button>
            </div>
          </div>
          <DialogFooter className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              You can upload another image after closing this dialog
            </p>
            <Button variant="ghost" onClick={() => setShowUrlDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

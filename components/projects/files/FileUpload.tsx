"use client";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  File,
  X,
  CheckCircle,
  AlertTriangle,
  Cloud,
  FolderOpen,
} from "lucide-react";

interface FileUploadProps {
  projectId: string;
  onUpload: (uploadedFiles: any[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export default function FileUpload({
  projectId,
  onUpload,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB
  acceptedTypes = ["*/*"],
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const newUploadingFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);
      setIsUploading(true);

      try {
        // Upload all files at once
        const formData = new FormData();
        acceptedFiles.forEach((file) => {
          formData.append("files", file);
        });

        const response = await fetch(`/api/projects/${projectId}/files`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const result = await response.json();

        // Update all files to completed
        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            progress: 100,
            status: "completed" as const,
          }))
        );

        // Call the onUpload callback with the uploaded files
        if (result.data) {
          onUpload(result.data);
        }
      } catch (error) {
        console.error("Upload error:", error);
        setUploadingFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: "error" as const,
            error: "Upload failed",
          }))
        );
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, onUpload]
  );

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      maxFiles,
      maxSize,
      accept: acceptedTypes.reduce((acc, type) => {
        acc[type] = [];
        return acc;
      }, {} as Record<string, string[]>),
    });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📈";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "mp4":
      case "avi":
      case "mov":
        return "🎥";
      case "mp3":
      case "wav":
        return "🎵";
      case "zip":
      case "rar":
        return "📦";
      default:
        return "📄";
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${
                isDragActive && !isDragReject
                  ? "border-orange-400 bg-orange-400/10"
                  : isDragReject
                  ? "border-red-400 bg-red-400/10"
                  : "border-neutral-600 hover:border-orange-400 hover:bg-orange-400/5"
              }
            `}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-4">
              {isDragActive ? (
                <>
                  <Cloud className="w-12 h-12 text-orange-400" />
                  <div className="text-white font-medium">
                    {isDragReject ? "Invalid file type" : "Drop files here"}
                  </div>
                </>
              ) : (
                <>
                  <FolderOpen className="w-12 h-12 text-neutral-400" />
                  <div>
                    <div className="text-white font-medium mb-2">
                      Drag & drop files here, or click to select
                    </div>
                    <div className="text-neutral-400 text-md">
                      Max {maxFiles} files, {formatFileSize(maxSize)} each
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardHeader>
            <CardTitle className="text-orange-400 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadingFiles.map((uploadingFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-[#18181b] rounded border border-neutral-700"
                >
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {getFileIcon(uploadingFile.file.name)}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-white font-medium truncate">
                        {uploadingFile.file.name}
                      </div>
                      <div className="text-neutral-400 text-md">
                        {formatFileSize(uploadingFile.file.size)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Progress
                        value={uploadingFile.progress}
                        className="flex-1 h-2"
                      />
                      <span className="text-md text-neutral-400 min-w-[3rem]">
                        {Math.round(uploadingFile.progress)}%
                      </span>
                    </div>

                    {uploadingFile.status === "completed" && (
                      <div className="flex items-center gap-1 text-green-400 text-md mt-1">
                        <CheckCircle className="w-4 h-4" />
                        Upload complete
                      </div>
                    )}

                    {uploadingFile.status === "error" && (
                      <div className="flex items-center gap-1 text-red-400 text-md mt-1">
                        <AlertTriangle className="w-4 h-4" />
                        {uploadingFile.error}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadingFile.file)}
                    className="flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

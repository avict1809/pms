"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

interface ProjectFile {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_at: string;
  uploaded_by: {
    display_name: string;
    email: string;
  };
}

interface FileViewerProps {
  file: ProjectFile | null;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export default function FileViewer({
  file,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: FileViewerProps) {
  const [loading, setLoading] = useState(false);

  if (!file) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (filename: string, fileType: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();

    if (fileType.startsWith("image/")) return <Image className="w-8 h-8" />;
    if (fileType.startsWith("video/")) return <Video className="w-8 h-8" />;
    if (fileType.startsWith("audio/")) return <Music className="w-8 h-8" />;
    if (fileType.includes("pdf")) return <FileText className="w-8 h-8" />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <Archive className="w-8 h-8" />;

    switch (ext) {
      case "pdf":
        return <FileText className="w-8 h-8" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="w-8 h-8" />;
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="w-8 h-8" />;
      case "mp3":
      case "wav":
        return <Music className="w-8 h-8" />;
      case "zip":
      case "rar":
        return <Archive className="w-8 h-8" />;
      default:
        return <File className="w-8 h-8" />;
    }
  };

  const canPreview = () => {
    return (
      file.file_type.startsWith("image/") ||
      file.file_type.startsWith("video/") ||
      file.file_type.startsWith("audio/") ||
      file.file_type.includes("pdf")
    );
  };

  const getPreviewUrl = () => {
    // In a real implementation, this would be the actual file URL
    // For now, we'll use a placeholder
    return `/api/projects/files/${file.id}/preview`;
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/files/${file.id}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (file.file_type.startsWith("image/")) {
      return (
        <div className="flex items-center justify-center bg-[#18181b] rounded-lg p-4">
          <img
            src={getPreviewUrl()}
            alt={file.filename}
            className="max-w-full max-h-96 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling!.style.display = "flex";
            }}
          />
          <div className="hidden flex items-center justify-center text-neutral-400">
            <Image className="w-16 h-16" />
            <span className="ml-2">Image preview not available</span>
          </div>
        </div>
      );
    }

    if (file.file_type.startsWith("video/")) {
      return (
        <div className="flex items-center justify-center bg-[#18181b] rounded-lg p-4">
          <video
            controls
            className="max-w-full max-h-96 rounded"
            src={getPreviewUrl()}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (file.file_type.startsWith("audio/")) {
      return (
        <div className="flex items-center justify-center bg-[#18181b] rounded-lg p-4">
          <audio controls className="w-full max-w-md" src={getPreviewUrl()}>
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (file.file_type.includes("pdf")) {
      return (
        <div className="flex items-center justify-center bg-[#18181b] rounded-lg p-4 h-96">
          <iframe
            src={getPreviewUrl()}
            className="w-full h-full rounded"
            title={file.filename}
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center bg-[#18181b] rounded-lg p-8">
        <div className="text-center">
          {getFileIcon(file.filename, file.file_type)}
          <p className="text-neutral-400 mt-2">
            Preview not available for this file type
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleDownload}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            {loading ? "Preparing..." : "Download to View"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#23232a] border-orange-500 shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getFileIcon(file.filename, file.file_type)}
              <div>
                <CardTitle className="text-orange-400 text-lg">
                  {file.filename}
                </CardTitle>
                <div className="text-neutral-400 text-md">
                  {formatFileSize(file.file_size)} •{" "}
                  {formatDate(file.uploaded_at)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Navigation */}
            {hasPrevious && (
              <Button variant="outline" size="sm" onClick={onPrevious}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}

            {hasNext && (
              <Button variant="outline" size="sm" onClick={onNext}>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

            {/* Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={loading}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(getPreviewUrl(), "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>

            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto">
          <div className="space-y-4">
            {/* File Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-md">
              <div>
                <span className="text-neutral-400">Uploaded by:</span>
                <span className="text-white ml-2">
                  {file.uploaded_by.display_name}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">File type:</span>
                <span className="text-white ml-2">{file.file_type}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              {canPreview() ? (
                renderPreview()
              ) : (
                <div className="flex items-center justify-center bg-[#18181b] rounded-lg p-8">
                  <div className="text-center">
                    {getFileIcon(file.filename, file.file_type)}
                    <p className="text-neutral-400 mt-2">
                      Preview not available for this file type
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={handleDownload}
                      disabled={loading}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? "Preparing..." : "Download to View"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

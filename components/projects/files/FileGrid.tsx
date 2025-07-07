"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Trash2,
  Eye,
  MoreVertical,
  Calendar,
  HardDrive,
  User,
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

interface FileGridProps {
  files: ProjectFile[];
  onFileSelect?: (file: ProjectFile) => void;
  onFileDelete?: (fileId: string) => void;
  onFileDownload?: (file: ProjectFile) => void;
  columns?: number;
}

export default function FileGrid({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  columns = 4,
}: FileGridProps) {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (filename: string, fileType: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();

    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎥";
    if (fileType.startsWith("audio/")) return "🎵";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("document") || fileType.includes("word")) return "📝";
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return "📊";
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return "📈";
    if (fileType.includes("zip") || fileType.includes("rar")) return "📦";

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

  const getFileType = (fileType: string) => {
    if (fileType.startsWith("image/")) return "Image";
    if (fileType.startsWith("video/")) return "Video";
    if (fileType.startsWith("audio/")) return "Audio";
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("document") || fileType.includes("word"))
      return "Document";
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return "Spreadsheet";
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return "Presentation";
    if (fileType.includes("zip") || fileType.includes("rar")) return "Archive";
    return "File";
  };

  const handleFileDelete = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      onFileDelete?.(fileId);
    }
  };

  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };

  return (
    <div
      className={`grid ${
        gridCols[columns as keyof typeof gridCols] || gridCols[4]
      } gap-4`}
    >
      {files.map((file) => (
        <Card
          key={file.id}
          className="bg-[#23232a] border-orange-500 shadow-lg hover:border-orange-400 transition-all duration-200 group cursor-pointer"
          onClick={() => onFileSelect?.(file)}
        >
          <CardContent className="p-4">
            <div className="text-center">
              {/* File Icon */}
              <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">
                {getFileIcon(file.filename, file.file_type)}
              </div>

              {/* File Name */}
              <h3
                className="text-white font-medium text-md mb-2 truncate"
                title={file.filename}
              >
                {file.filename}
              </h3>

              {/* File Type Badge */}
              <Badge
                variant="outline"
                className="border-neutral-500 text-neutral-400 text-sm mb-3"
              >
                {getFileType(file.file_type)}
              </Badge>

              {/* File Info */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-center gap-1 text-neutral-400 text-sm">
                  <HardDrive className="w-3 h-3" />
                  <span>{formatFileSize(file.file_size)}</span>
                </div>

                <div className="flex items-center justify-center gap-1 text-neutral-400 text-sm">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(file.uploaded_at)}</span>
                </div>

                <div className="flex items-center justify-center gap-1 text-neutral-400 text-sm">
                  <User className="w-3 h-3" />
                  <span className="truncate">
                    {file.uploaded_by.display_name}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileSelect?.(file);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileDownload?.(file);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Download className="w-3 h-3" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileDelete(file.id);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

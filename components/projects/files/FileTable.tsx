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
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  ChevronUp,
  ChevronDown,
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

interface FileTableProps {
  files: ProjectFile[];
  onFileSelect?: (file: ProjectFile) => void;
  onFileDelete?: (fileId: string) => void;
  onFileDownload?: (file: ProjectFile) => void;
  sortable?: boolean;
}

type SortField = "filename" | "file_size" | "uploaded_at" | "uploaded_by";
type SortDirection = "asc" | "desc";

export default function FileTable({
  files,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  sortable = true,
}: FileTableProps) {
  const [sortField, setSortField] = useState<SortField>("uploaded_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (filename: string, fileType: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();

    if (fileType.startsWith("image/")) return <Image className="w-4 h-4" />;
    if (fileType.startsWith("video/")) return <Video className="w-4 h-4" />;
    if (fileType.startsWith("audio/")) return <Music className="w-4 h-4" />;
    if (fileType.includes("pdf")) return <FileText className="w-4 h-4" />;
    if (fileType.includes("zip") || fileType.includes("rar"))
      return <Archive className="w-4 h-4" />;

    switch (ext) {
      case "pdf":
        return <FileText className="w-4 h-4" />;
      case "doc":
      case "docx":
        return <FileText className="w-4 h-4" />;
      case "xls":
      case "xlsx":
        return <FileText className="w-4 h-4" />;
      case "ppt":
      case "pptx":
        return <FileText className="w-4 h-4" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Image className="w-4 h-4" />;
      case "mp4":
      case "avi":
      case "mov":
        return <Video className="w-4 h-4" />;
      case "mp3":
      case "wav":
        return <Music className="w-4 h-4" />;
      case "zip":
      case "rar":
        return <Archive className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
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

  const handleSort = (field: SortField) => {
    if (!sortable) return;

    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedFiles = [...files].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "filename":
        aValue = a.filename.toLowerCase();
        bValue = b.filename.toLowerCase();
        break;
      case "file_size":
        aValue = a.file_size;
        bValue = b.file_size;
        break;
      case "uploaded_at":
        aValue = new Date(a.uploaded_at);
        bValue = new Date(b.uploaded_at);
        break;
      case "uploaded_by":
        aValue = a.uploaded_by.display_name.toLowerCase();
        bValue = b.uploaded_by.display_name.toLowerCase();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleFileDelete = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      onFileDelete?.(fileId);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (!sortable || sortField !== field) {
      return <div className="w-4 h-4" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <Card className="bg-[#23232a] border-orange-500 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700">
                <th
                  className="text-left p-4 text-neutral-400 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("filename")}
                >
                  <div className="flex items-center gap-2">
                    File Name
                    <SortIcon field="filename" />
                  </div>
                </th>
                <th className="text-left p-4 text-neutral-400 font-medium">
                  Type
                </th>
                <th
                  className="text-left p-4 text-neutral-400 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("file_size")}
                >
                  <div className="flex items-center gap-2">
                    Size
                    <SortIcon field="file_size" />
                  </div>
                </th>
                <th
                  className="text-left p-4 text-neutral-400 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("uploaded_at")}
                >
                  <div className="flex items-center gap-2">
                    Uploaded
                    <SortIcon field="uploaded_at" />
                  </div>
                </th>
                <th
                  className="text-left p-4 text-neutral-400 font-medium cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("uploaded_by")}
                >
                  <div className="flex items-center gap-2">
                    By
                    <SortIcon field="uploaded_by" />
                  </div>
                </th>
                <th className="text-right p-4 text-neutral-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedFiles.map((file) => (
                <tr
                  key={file.id}
                  className="border-b border-neutral-700 hover:bg-neutral-800/50 transition-colors cursor-pointer"
                  onClick={() => onFileSelect?.(file)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(file.filename, file.file_type)}
                      <div>
                        <div className="text-white font-medium">
                          {file.filename}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className="border-neutral-500 text-neutral-400"
                    >
                      {getFileType(file.file_type)}
                    </Badge>
                  </td>
                  <td className="p-4 text-neutral-400">
                    {formatFileSize(file.file_size)}
                  </td>
                  <td className="p-4 text-neutral-400">
                    {formatDate(file.uploaded_at)}
                  </td>
                  <td className="p-4 text-neutral-400">
                    {file.uploaded_by.display_name}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileSelect?.(file);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onFileDownload?.(file);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDelete(file.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedFiles.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Files Found
            </h3>
            <p className="text-neutral-400">
              No files match your current criteria.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

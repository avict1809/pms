"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Search,
  Filter,
  Grid3X3,
  List,
  Calendar,
  HardDrive,
  User,
  MoreVertical,
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

interface FileListProps {
  files: ProjectFile[];
  onFileDelete?: (fileId: string) => void;
  viewMode: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
}

export default function FileList({
  files,
  onFileDelete,
  viewMode,
  onViewModeChange,
}: FileListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "all" | "images" | "documents" | "videos" | "audio"
  >("all");

  const handleFileDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    onFileDelete?.(fileId);
  };

  const handleFileDownload = async (file: ProjectFile) => {
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
      setError("Failed to download file");
    }
  };

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

    // Check file type first
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

    // Fallback to extension
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

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.filename
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "images" && file.file_type.startsWith("image/")) ||
      (filter === "documents" &&
        (file.file_type.includes("pdf") ||
          file.file_type.includes("document"))) ||
      (filter === "videos" && file.file_type.startsWith("video/")) ||
      (filter === "audio" && file.file_type.startsWith("audio/"));
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Header with Controls */}
      <Card className="bg-[#23232a] border-orange-500 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-neutral-700 rounded text-white placeholder-neutral-400 focus:border-orange-400 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#18181b] border border-neutral-700 rounded text-white focus:border-orange-400 outline-none"
              >
                <option value="all">All Files</option>
                <option value="images">Images</option>
                <option value="documents">Documents</option>
                <option value="videos">Videos</option>
                <option value="audio">Audio</option>
              </select>

              <div className="flex border border-neutral-700 rounded">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange?.("list")}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange?.("grid")}
                  className="rounded-l-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Display */}
      {filteredFiles.length === 0 ? (
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Files Found
            </h3>
            <p className="text-neutral-400">
              {searchTerm || filter !== "all"
                ? "No files match your current filters."
                : "No files have been uploaded to this project yet."}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <Card
              key={file.id}
              className="bg-[#23232a] border-orange-500 shadow-lg hover:border-orange-400 transition-colors"
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {getFileIcon(file.filename, file.file_type)}
                  </div>
                  <h3
                    className="text-white font-medium text-md mb-1 truncate"
                    title={file.filename}
                  >
                    {file.filename}
                  </h3>
                  <p className="text-neutral-400 text-sm mb-3">
                    {formatFileSize(file.file_size)}
                  </p>

                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFileSelect?.(file)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFileDownload(file)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleFileDelete(file.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card className="bg-[#23232a] border-orange-500 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-700">
                    <th className="text-left p-4 text-neutral-400 font-medium">
                      File
                    </th>
                    <th className="text-left p-4 text-neutral-400 font-medium">
                      Type
                    </th>
                    <th className="text-left p-4 text-neutral-400 font-medium">
                      Size
                    </th>
                    <th className="text-left p-4 text-neutral-400 font-medium">
                      Uploaded
                    </th>
                    <th className="text-left p-4 text-neutral-400 font-medium">
                      By
                    </th>
                    <th className="text-right p-4 text-neutral-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <tr
                      key={file.id}
                      className="border-b border-neutral-700 hover:bg-neutral-800/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {getFileIcon(file.filename, file.file_type)}
                          </span>
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
                            onClick={() => onFileSelect?.(file)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFileDownload(file)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleFileDelete(file.id)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Users,
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
  X,
} from "lucide-react";

interface UserData {
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
}

interface BulkUploadUsersProps {
  onClose: () => void;
  onUpload: (users: UserData[]) => void;
}

export default function BulkUploadUsers({
  onClose,
  onUpload,
}: BulkUploadUsersProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<UserData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      processCSV(selectedFile);
    } else {
      setErrors(["Please select a valid CSV file"]);
    }
  };

  const processCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const data: UserData[] = [];
      const newErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map((v) => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });

          // Validate required fields
          if (!row.email || !row.displayname || !row.role) {
            newErrors.push(`Row ${i + 1}: Missing required fields`);
            continue;
          }

          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(row.email)) {
            newErrors.push(`Row ${i + 1}: Invalid email format`);
            continue;
          }

          // Validate role
          const validRoles = ["admin", "supervisor", "student"];
          if (!validRoles.includes(row.role.toLowerCase())) {
            newErrors.push(
              `Row ${
                i + 1
              }: Invalid role (must be admin, supervisor, or student)`
            );
            continue;
          }

          data.push({
            email: row.email,
            displayName: row.displayname,
            role: row.role.toLowerCase(),
            isActive: row.isactive === "true" || row.isactive === "1",
          });
        }
      }

      setPreviewData(data);
      setErrors(newErrors);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (previewData.length === 0) return;

    setIsProcessing(true);
    try {
      await onUpload(previewData);
      onClose();
    } catch (error) {
      setErrors([`Upload failed: ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `email,displayname,role,isactive
user@example.com,John Doe,student,false
supervisor@example.com,Jane Smith,supervisor,true
admin@example.com,Admin User,admin,true`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-[#23232a] border-orange-500 shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-orange-400 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Upload Users
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-[#18181b] p-4 rounded border border-neutral-700">
            <h3 className="text-white font-medium mb-2">Instructions:</h3>
            <ul className="text-neutral-400 text-md space-y-1">
              <li>• Download the template CSV file below</li>
              <li>
                • Fill in user information (email, display name, role,
                activation status)
              </li>
              <li>• Upload the completed CSV file</li>
              <li>• Review the preview before confirming</li>
            </ul>
          </div>

          {/* Template Download */}
          <div className="flex items-center gap-4">
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-neutral-700 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-neutral-400 mb-4">
              {file
                ? file.name
                : "Drag and drop a CSV file here, or click to select"}
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="outline" className="cursor-pointer">
                <FileText className="w-4 h-4 mr-2" />
                Select CSV File
              </Button>
            </label>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <Card className="bg-red-900/20 border-red-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <h3 className="text-red-400 font-medium">
                    Validation Errors
                  </h3>
                </div>
                <ul className="text-red-300 text-md space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {previewData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">
                  Preview ({previewData.length} users)
                </h3>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-green-400 text-md">Valid data</span>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="text-left py-2 px-3 text-neutral-400 text-md">
                        Email
                      </th>
                      <th className="text-left py-2 px-3 text-neutral-400 text-md">
                        Name
                      </th>
                      <th className="text-left py-2 px-3 text-neutral-400 text-md">
                        Role
                      </th>
                      <th className="text-left py-2 px-3 text-neutral-400 text-md">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((user, index) => (
                      <tr key={index} className="border-b border-neutral-800">
                        <td className="py-2 px-3 text-white text-md">
                          {user.email}
                        </td>
                        <td className="py-2 px-3 text-white text-md">
                          {user.displayName}
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            variant="outline"
                            className={
                              user.role === "admin"
                                ? "border-red-500 text-red-400"
                                : user.role === "supervisor"
                                ? "border-blue-500 text-blue-400"
                                : "border-green-500 text-green-400"
                            }
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-2 px-3">
                          <Badge
                            variant={user.isActive ? "default" : "outline"}
                            className={
                              user.isActive
                                ? "bg-green-500 text-white"
                                : "border-yellow-500 text-yellow-400"
                            }
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <p className="text-neutral-400 text-md mt-2 text-center">
                    Showing first 10 of {previewData.length} users
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                previewData.length === 0 || errors.length > 0 || isProcessing
              }
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {previewData.length} Users
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

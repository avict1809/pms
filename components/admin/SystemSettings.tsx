"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Shield,
  Users,
  Database,
  Bell,
  Lock,
  HardDrive,
  BarChart3,
  Globe,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  useSystemSettings,
  useCreateOrUpdateSystemSetting,
  useUpdateSystemSetting,
  useDeleteSystemSetting,
  SystemSetting,
} from "@/hooks/useSystemSettings";
import { toast } from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface SystemSettingsProps {
  onClose?: () => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SystemSettings({ onClose }: SystemSettingsProps) {
  const { data: settings, isLoading, error, refetch } = useSystemSettings();
  const createOrUpdateMutation = useCreateOrUpdateSystemSetting();
  const updateMutation = useUpdateSystemSetting();
  const deleteMutation = useDeleteSystemSetting();

  const [editingSetting, setEditingSetting] = useState<string | null>(null);
  const [newSetting, setNewSetting] = useState({
    setting_key: "",
    setting_value: "",
    setting_type: "string" as const,
    description: "",
    category: "general",
    is_public: false,
  });
  const [showNewForm, setShowNewForm] = useState(false);

  // Debounced editing state for real-time updates
  const [editingValues, setEditingValues] = useState<Record<string, string>>(
    {}
  );
  const debouncedEditingValues = useDebounce(editingValues, 1000); // 1 second delay

  // Auto-save when debounced values change
  useEffect(() => {
    Object.entries(debouncedEditingValues).forEach(([key, value]) => {
      const setting = settings?.find((s) => s.setting_key === key);
      if (setting && setting.setting_value !== value) {
        handleSave({
          ...setting,
          setting_value: value,
        });
      }
    });
  }, [debouncedEditingValues, settings]);

  const [deleteDialog, setDeleteDialog] = useState<{
    key: string;
    label: string;
  } | null>(null);

  const categories = [
    { key: "general", label: "General", icon: Globe },
    { key: "users", label: "User Management", icon: Users },
    { key: "projects", label: "Projects", icon: Database },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "security", label: "Security", icon: Lock },
    { key: "backup", label: "Backup", icon: HardDrive },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const getCategoryIcon = (category: string) => {
    const cat = categories.find((c) => c.key === category);
    return cat ? cat.icon : Settings;
  };

  const getCategoryLabel = (category: string) => {
    const cat = categories.find((c) => c.key === category);
    return cat ? cat.label : category;
  };

  const handleSave = async (setting: SystemSetting) => {
    try {
      await updateMutation.mutateAsync({
        key: setting.setting_key,
        data: {
          setting_value: setting.setting_value,
          setting_type: setting.setting_type,
          description: setting.description,
          category: setting.category,
          is_public: setting.is_public,
        },
      });
      setEditingSetting(null);
      // Clear the editing value after successful save
      setEditingValues((prev) => {
        const newValues = { ...prev };
        delete newValues[setting.setting_key];
        return newValues;
      });
    } catch (error) {
      console.error("Error saving setting:", error);
    }
  };

  const handleCreate = async () => {
    if (!newSetting.setting_key || !newSetting.setting_value) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createOrUpdateMutation.mutateAsync(newSetting);
      setNewSetting({
        setting_key: "",
        setting_value: "",
        setting_type: "string",
        description: "",
        category: "general",
        is_public: false,
      });
      setShowNewForm(false);
    } catch (error) {
      console.error("Error creating setting:", error);
    }
  };

  const handleDelete = async (key: string) => {
    setDeleteDialog({ key, label: key });
  };

  const confirmDelete = async () => {
    if (deleteDialog) {
      try {
        await deleteMutation.mutateAsync(deleteDialog.key);
        setDeleteDialog(null);
      } catch (error) {
        console.error("Error deleting setting:", error);
      }
    }
  };

  const cancelDelete = () => setDeleteDialog(null);

  const handleValueChange = (settingKey: string, value: string) => {
    setEditingValues((prev) => ({
      ...prev,
      [settingKey]: value,
    }));
  };

  const renderSettingValue = (setting: SystemSetting) => {
    const currentValue =
      editingValues[setting.setting_key] ?? setting.setting_value;
    const isEditing = editingValues.hasOwnProperty(setting.setting_key);

    switch (setting.setting_type) {
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <Select
              value={currentValue}
              onValueChange={(value) => {
                handleValueChange(setting.setting_key, value);
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
            {isEditing && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </div>
        );
      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={currentValue}
              onChange={(e) =>
                handleValueChange(setting.setting_key, e.target.value)
              }
              className="w-32"
            />
            {isEditing && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </div>
        );
      case "json":
        return (
          <div className="flex items-start gap-2">
            <Textarea
              value={currentValue}
              onChange={(e) =>
                handleValueChange(setting.setting_key, e.target.value)
              }
              className="w-64"
              rows={3}
            />
            {isEditing && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse mt-2"></div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              value={currentValue}
              onChange={(e) =>
                handleValueChange(setting.setting_key, e.target.value)
              }
              className="w-64"
            />
            {isEditing && (
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            )}
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-orange-400" />
        <span className="ml-2 text-orange-400">Loading system settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertTriangle className="w-6 h-6 text-red-400" />
        <span className="ml-2 text-red-400">Error loading system settings</span>
      </div>
    );
  }

  const groupedSettings =
    settings?.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, SystemSetting[]>) || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="text-orange-500 w-7 h-7" />
          <h2 className="text-2xl font-bold text-orange-400 tracking-wider">
            System Settings
          </h2>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Auto-save indicator */}
      {Object.keys(editingValues).length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <span className="text-orange-400 text-md">
            Auto-saving changes...
          </span>
        </div>
      )}

      {/* Settings by Category */}
      {Object.entries(groupedSettings).map(([category, categorySettings]) => {
        const CategoryIcon = getCategoryIcon(category);
        return (
          <Card
            key={category}
            className="bg-[#23232a] border-orange-500 shadow-lg"
          >
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <CategoryIcon className="w-5 h-5" />
                {getCategoryLabel(category)}
              </CardTitle>
              <CardDescription>
                {categorySettings.length} setting
                {categorySettings.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categorySettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between p-4 bg-[#18181b] rounded-lg border border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">
                        {setting.setting_key}
                      </h4>
                      <Badge
                        variant={setting.is_public ? "default" : "secondary"}
                        className={
                          setting.is_public
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }
                      >
                        {setting.is_public ? "Public" : "Private"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-orange-500 text-orange-400"
                      >
                        {setting.setting_type}
                      </Badge>
                    </div>
                    <p className="text-md text-gray-400 mb-2">
                      {setting.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Value:</span>
                        {renderSettingValue(setting)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Updated:{" "}
                        {new Date(setting.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

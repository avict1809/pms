import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: "string" | "number" | "boolean" | "json";
  description: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface CreateSystemSettingData {
  setting_key: string;
  setting_value: string;
  setting_type: "string" | "number" | "boolean" | "json";
  description: string;
  category: string;
  is_public: boolean;
}

export interface UpdateSystemSettingData {
  setting_value: string;
  setting_type?: "string" | "number" | "boolean" | "json";
  description?: string;
  category?: string;
  is_public?: boolean;
}

// Fetch all system settings
const fetchSystemSettings = async (): Promise<SystemSetting[]> => {
  const response = await fetch("/api/admin/system-settings");
  if (!response.ok) {
    throw new Error("Failed to fetch system settings");
  }
  const { data } = await response.json();
  return data;
};

// Fetch specific system setting
const fetchSystemSetting = async (key: string): Promise<SystemSetting> => {
  const response = await fetch(`/api/admin/system-settings/${key}`);
  if (!response.ok) {
    throw new Error("Failed to fetch system setting");
  }
  const { data } = await response.json();
  return data;
};

// Create or update system setting
const createOrUpdateSystemSetting = async (
  data: CreateSystemSettingData
): Promise<SystemSetting> => {
  const response = await fetch("/api/admin/system-settings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create/update system setting");
  }
  const result = await response.json();
  return result.data;
};

// Update specific system setting
const updateSystemSetting = async ({
  key,
  data,
}: {
  key: string;
  data: UpdateSystemSettingData;
}): Promise<SystemSetting> => {
  const response = await fetch(`/api/admin/system-settings/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update system setting");
  }
  const result = await response.json();
  return result.data;
};

// Delete system setting
const deleteSystemSetting = async (key: string): Promise<void> => {
  const response = await fetch(`/api/admin/system-settings/${key}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete system setting");
  }
};

export const useSystemSettings = () => {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: fetchSystemSettings,
  });
};

export const useSystemSetting = (key: string) => {
  return useQuery({
    queryKey: ["system-settings", key],
    queryFn: () => fetchSystemSetting(key),
    enabled: !!key,
  });
};

export const useCreateOrUpdateSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createOrUpdateSystemSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("System setting saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save system setting");
    },
  });
};

export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSystemSetting,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      queryClient.invalidateQueries({
        queryKey: ["system-settings", data.setting_key],
      });
      toast.success("System setting updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update system setting");
    },
  });
};

export const useDeleteSystemSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSystemSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("System setting deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete system setting");
    },
  });
};

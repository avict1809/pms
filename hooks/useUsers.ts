import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: "admin" | "supervisor" | "student";
  is_active: boolean;
  is_first_login: boolean;
  created_at: string;
  password_set_at?: string;
  created_by?: string;
}

export interface CreateUserData {
  email: string;
  display_name: string;
  role: "admin" | "supervisor" | "student";
  is_active?: boolean;
}

export interface UpdateUserData {
  display_name?: string;
  role?: "admin" | "supervisor" | "student";
  is_active?: boolean;
  is_first_login?: boolean;
}

// Fetch all users
const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch("/api/admin/users");
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  const data = await response.json();
  return data.data;
};

// Create new user
const createUser = async (userData: CreateUserData): Promise<User> => {
  const response = await fetch("/api/admin/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create user");
  }

  const data = await response.json();
  return data.data;
};

// Update user
const updateUser = async ({
  id,
  userData,
}: {
  id: string;
  userData: UpdateUserData;
}): Promise<User> => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update user");
  }

  const data = await response.json();
  return data.data;
};

// Delete user
const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete user");
  }
};

// Custom hook for users
export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

// Custom hook for creating users
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Custom hook for updating users
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

// Custom hook for deleting users
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

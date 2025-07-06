"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../supabase/context";
import { supabase } from "../supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { user, session, loading } = useSupabase();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (session && user) {
      const fetchUserData = async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Error fetching user data:", error);
          } else {
            console.log("User data:", data);
            setUserData(data);
            setUserRole(data.role);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchUserData();
    }
  }, [session, user]);

  const navigateToDashboard = () => {
    if (userRole === "admin") {
      router.push("/admin");
    } else if (userRole === "supervisor") {
      router.push("/supervisor");
    } else if (userRole === "student") {
      router.push("/student");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-orange-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-orange-400 tracking-wider mb-4">
            Project Management System
          </h1>
          <p className="text-neutral-400 text-lg">
            Welcome to the PMS Dashboard
          </p>
        </div>

        {userData && (
          <Card className="bg-[#23232a] border-orange-500 shadow-lg">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <User className="w-5 h-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 text-sm">Name</label>
                  <p className="text-white font-medium">
                    {userData.display_name}
                  </p>
                </div>
                <div>
                  <label className="text-neutral-400 text-sm">Email</label>
                  <p className="text-white font-medium">{userData.email}</p>
                </div>
                <div>
                  <label className="text-neutral-400 text-sm">Role</label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <Badge
                      variant={
                        userData.role === "admin"
                          ? "default"
                          : userData.role === "supervisor"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        userData.role === "admin"
                          ? "bg-red-500 text-white"
                          : userData.role === "supervisor"
                          ? "bg-blue-500 text-white"
                          : "border-green-500 text-green-400"
                      }
                    >
                      {userData.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-neutral-400 text-sm">Status</label>
                  <Badge
                    variant={userData.is_active ? "default" : "destructive"}
                    className={
                      userData.is_active
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {userData.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={navigateToDashboard}
                  className="w-full md:w-auto"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <p className="text-neutral-500">
            Debug: User ID: {user?.id} | Role: {userRole || "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useSupabase } from "../../supabase/context";
import { supabase } from "../../supabase/client";
import { useEffect, useState } from "react";

export default function TestPage() {
  const { user, session, loading } = useSupabase();
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && user) {
      const testUserRole = async () => {
        try {
          console.log("Testing user role fetch...");
          console.log("User ID:", user.id);
          console.log("User email:", user.email);

          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("Database error:", error);
            setError(error.message);
          } else {
            console.log("User data from database:", data);
            setUserData(data);
          }
        } catch (err) {
          console.error("Error:", err);
          setError("Unknown error occurred");
        }
      };

      testUserRole();
    }
  }, [session, user]);

  return (
    <div className="p-6 space-y-4 bg-[#18181b] min-h-screen text-white">
      <h1 className="text-2xl font-bold text-orange-400">
        Authentication Test
      </h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Session Status:</h2>
          <p>Loading: {loading ? "Yes" : "No"}</p>
          <p>Has Session: {session ? "Yes" : "No"}</p>
          <p>Has User: {user ? "Yes" : "No"}</p>
        </div>

        {user && (
          <div>
            <h2 className="text-lg font-semibold">User Info:</h2>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
          </div>
        )}

        {userData && (
          <div>
            <h2 className="text-lg font-semibold">Database User Data:</h2>
            <pre className="bg-[#23232a] p-4 rounded overflow-auto">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div>
            <h2 className="text-lg font-semibold text-red-400">Error:</h2>
            <p className="text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

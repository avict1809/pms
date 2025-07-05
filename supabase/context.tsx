"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./client";
import type { Session, User } from "@supabase/supabase-js";

interface SupabaseContextProps {
  supabase: typeof supabase;
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const SupabaseContext = createContext<SupabaseContextProps | undefined>(
  undefined
);

export const SupabaseProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SupabaseContext.Provider value={{ supabase, user, session, loading }}>
      {children}
    </SupabaseContext.Provider>
  );
};

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context)
    throw new Error("useSupabase must be used within a SupabaseProvider");
  return context;
};

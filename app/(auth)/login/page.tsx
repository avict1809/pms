"use client";
import React from "react";
import SignInForm from "../../../components/auth/SignInForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23232a] to-black">
      <SignInForm onSuccess={() => router.push("/")} />
    </div>
  );
}

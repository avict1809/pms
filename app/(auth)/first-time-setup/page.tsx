"use client";
import React from "react";
import FirstTimePasswordSetup from "../../../components/auth/FirstTimePasswordSetup";

// TODO: Get email from query or context
const email = "";

export default function FirstTimeSetupPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#18181b] via-[#23232a] to-black p-4">
      <div className="w-full max-w-md">
        <FirstTimePasswordSetup email={email} />
      </div>
    </div>
  );
}

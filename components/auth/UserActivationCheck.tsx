'use client';
import React, { useEffect, useState } from "react";
import { checkUserActivation } from "../../lib/auth";

export default function UserActivationCheck({ userId }: { userId: string }) {
  const [active, setActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    checkUserActivation(userId)
      .then(setActive)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <div className="text-orange-400 animate-pulse">
        Checking activation status...
      </div>
    );
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <div className="flex items-center justify-center mt-4">
      {active ? (
        <span className="px-4 py-2 rounded bg-green-700 text-green-200 font-bold tracking-widest shadow">
          Account Active
        </span>
      ) : (
        <span className="px-4 py-2 rounded bg-red-700 text-red-200 font-bold tracking-widest shadow">
          Account Inactive
        </span>
      )}
    </div>
  );
}

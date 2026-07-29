"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { useToast } from "@/components/ui/toast";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      className={className}
      onClick={async () => {
        setLoading(true);
        await signOut();
        toast("Signed out");
        router.push("/");
        router.refresh();
      }}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}

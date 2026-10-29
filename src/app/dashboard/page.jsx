"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    const roleLower = (currentUser.role || "").toLowerCase();
    if (roleLower.includes("admin")) {
      router.replace("/admin/disputes");
    } else if (roleLower.includes("petani") || roleLower.includes("mitra")) {
      router.replace("/dashboard/farmer");
    } else {
      router.replace("/dashboard/buyer");
    }
  }, [currentUser, router]);

  return null;
}

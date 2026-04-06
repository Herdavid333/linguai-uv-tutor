"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.push("/home");
    } else {
      router.push("/login");
    }
  }, [user, loading, router]);

  return <p style={{ padding: "24px" }}>Loading...</p>;
}
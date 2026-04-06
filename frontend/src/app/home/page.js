"use client";

import ProtectedRoute from "../../../src/components/protectedRoute";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  return (
    <ProtectedRoute>
      <HomeContent />
    </ProtectedRoute>
  );
}

function HomeContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main style={{ padding: "24px" }}>
      <h1>Home</h1>
      <p>You are logged in.</p>
      <p>
        <strong>Email:</strong> {user?.email}
      </p>

      <div style={{ marginTop: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={() => router.push("/profile")}>My Profile</button>
        <button onClick={() => router.push("/progress")}>My Progress</button>
        <button onClick={() => router.push("/chat")}>Chat</button>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </main>
  );
}
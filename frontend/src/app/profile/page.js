"use client";

import ProtectedRoute from "../../components/protectedRoute.jsx";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <main style={{ padding: "24px" }}>
      <h1>My Profile</h1>
      <p><strong>Email:</strong> {user?.email}</p>

      <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
        <button onClick={() => router.push("/home")}>Go to Home</button>
        <button onClick={() => router.push("/progress")}>Go to Progress</button>
        <button onClick={() => router.push("/chat")}>Go to Chat</button>
        <button onClick={handleLogout}>Log out</button>
      </div>
    </main>
  );
}
"use client";

import ProtectedRoute from "../../components/protectedRoute.jsx";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <main style={{ padding: "24px" }}>
        <h1>Chat</h1>
        <p>Protected page</p>
      </main>
    </ProtectedRoute>
  );
}
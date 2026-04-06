"use client";

import ProtectedRoute from "../../components/protectedRoute.jsx";

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <main style={{ padding: "24px" }}>
        <h1>My Progress</h1>
        <p>Protected page</p>
      </main>
    </ProtectedRoute>
  );
}
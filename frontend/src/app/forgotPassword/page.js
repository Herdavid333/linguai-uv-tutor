"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (value) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent successfully.");
    } catch (err) {
      console.error(err);

      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("An error occurred while sending the reset email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "24px", maxWidth: "420px", margin: "0 auto" }}>
      <h1>Recover Password</h1>
      <p>Enter your email to receive a reset link.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
        <input
          type="email"
          placeholder="Institutional email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset email"}
        </button>
      </form>

      {message && <p style={{ color: "green", marginTop: "12px" }}>{message}</p>}
      {error && <p style={{ color: "red", marginTop: "12px" }}>{error}</p>}

      <div style={{ marginTop: "16px" }}>
        <button onClick={() => router.push("/login")}>Back to login</button>
      </div>
    </main>
  );
}
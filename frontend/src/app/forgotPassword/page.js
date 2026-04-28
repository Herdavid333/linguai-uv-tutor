"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!email) {
      setErrorMessage("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);
      setMessage("If the email is associated with a valid account, a password recovery email has been sent to your inbox.");
    } catch (error) {
      console.error("Password reset error:", error);

      if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email address.");
      } else {
        setErrorMessage("An error occurred while sending the recovery email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#e6e6e6] flex items-center justify-center px-4">
      <AuthCard showArrow={true}>
        <div className="text-center mb-5 -mt-10">
          <h2 className="text-[50px] font-bold text-black leading-none">
            Recover Password
          </h2>
          <p className="text-[20px] text-black font-semibold mt-5 mb-8 leading-4">
            Enter your institutional email to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <AuthInput
            label="Institutional email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {errorMessage && (
            <p className="mt-4 mb-3 text-center text-[12px] font-semibold text-red-600">
              {errorMessage}
            </p>
          )}

          {message && (
            <p className="mt-4 mb-8 text-center text-[20px] font-semibold text-green-700">
              {message}
            </p>
          )}

          <div className="mt-5 mb-3">
            <AuthButton>
              {loading ? "Sending..." : "Send recovery email"}
            </AuthButton>
          </div>

          <div className="text-center text-[20px] text-black mt-10 -mb-15">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-red-600 font-bold hover:underline"
            >
              Sign In here
            </Link>
          </div>
        </form>
      </AuthCard>
    </main>
  );
}
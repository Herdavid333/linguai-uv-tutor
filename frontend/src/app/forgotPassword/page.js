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

    if (!isValidEmail(email)) {
      setErrorMessage(
        "Please enter a valid email address."
      );
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
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#e6e6e6]
        px-4
        py-6
      "
    >
      <AuthCard
        showArrow={true}
        showBorder={false}
      >
        <div className="text-center">
          <h2
            className="
              font-extrabold
              leading-none
              text-black

              text-[32px]
              sm:text-[38px]
              lg:text-[44px]
            "
          >
            Recover Password
          </h2>

          <p
            className="
              mt-5
              mb-8
              font-semibold
              leading-snug
              text-black

              text-[15px]
              sm:text-[17px]
              lg:text-[19px]
            "
          >
            Enter your institutional email to
            reset your password.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full"
        >
          <AuthInput
            label="Institutional email"
            type="email"
            name="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          {errorMessage && (
            <p className="mt-4 mb-3 text-center text-[13px] font-semibold text-red-600 lg:text-[15px]">
              {errorMessage}
            </p>
          )}

          {message && (
            <p className="mt-4 mb-6 text-center text-[14px] font-semibold leading-relaxed text-green-700 lg:text-[16px]">
              {message}
            </p>
          )}

          <div className="mt-6 mb-3">
            <AuthButton
              disabled={loading}
              className="
                mx-auto
                block
                w-[85%]

                sm:w-[80%]
                lg:w-[75%]
              "
            >
              {loading
                ? "Sending..."
                : "Send recovery email"}
            </AuthButton>
          </div>

          <div
            className="
              mt-8
              text-center
              text-black

              text-[14px]
              sm:text-[16px]
              lg:text-[18px]
            "
          >
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-bold text-red-600 hover:underline"
            >
              Sign In here
            </Link>
          </div>
        </form>
      </AuthCard>
    </main>
  );
}
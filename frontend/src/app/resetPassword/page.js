"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const oobCode = searchParams.get("oobCode");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [checkingCode, setCheckingCode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setErrorMessage("Invalid or missing reset code.");
        setCheckingCode(false);
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
      } catch (error) {
        console.error("Reset code verification error:", error);
        setErrorMessage("This password reset link is invalid or has expired.");
      } finally {
        setCheckingCode(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const isPasswordValid = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/.test(password)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newPassword || !confirmPassword) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!isPasswordValid(newPassword)) {
      setErrorMessage("Password does not meet the required conditions.");
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (error) {
      console.error("Password reset error:", error);
      setErrorMessage("An error occurred while changing your password.");
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push("/login");
  };

  if (checkingCode) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#e6e6e6] px-4">
        <p className="text-[14px] font-bold text-black">
          Checking reset link...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#e6e6e6] flex items-center justify-center px-4 py-8">
      <AuthCard showArrow={false}>
        {!success ? (
          <>
            <div className="mb-5 text-center">
              <h2 className="text-[22px] font-bold leading-none text-black">
                Reset Password
              </h2>
              <p className="mt-2 text-[12px] font-semibold leading-4 text-black">
                Create a new password for:
              </p>
              {email && (
                <p className="mt-1 break-all text-[12px] font-bold text-red-600">
                  {email}
                </p>
              )}
            </div>

            {errorMessage && !email ? (
              <div className="text-center">
                <p className="mb-5 text-[12px] font-semibold text-red-600">
                  {errorMessage}
                </p>
                <Link
                  href="/forgotPassword"
                  className="font-bold text-red-600 hover:underline"
                >
                  Request a new recovery email
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full">
                <AuthInput
                  label="New password"
                  type="password"
                  name="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  showToggle={true}
                />

                <AuthInput
                  label="Confirm new password"
                  type="password"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showToggle={true}
                />

                {errorMessage && (
                  <p className="mb-3 mt-4 text-center text-[12px] font-semibold text-red-600">
                    {errorMessage}
                  </p>
                )}

                <div className="mt-5 mb-3">
                  <AuthButton>
                    {loading ? "Saving..." : "Save new password"}
                  </AuthButton>
                </div>

                <div className="text-center text-[12px] text-black">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-red-600 hover:underline"
                  >
                    Sign In here
                  </Link>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="text-center">
            <h2 className="mb-3 text-[22px] font-bold text-black">
              Password changed
            </h2>
            <p className="mb-5 text-[13px] font-semibold text-black">
              You can now sign in with your new password.
            </p>

            <button
              type="button"
              onClick={goToLogin}
              className="w-full rounded-[4px] bg-red-600 py-2 text-[15px] font-bold text-white transition hover:bg-red-700"
            >
              Go to login
            </button>
          </div>
        )}
      </AuthCard>
    </main>
  );
}
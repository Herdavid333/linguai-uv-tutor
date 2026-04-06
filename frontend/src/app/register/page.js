"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";
import PasswordRequirements from "../../components/auth/PasswordRequirements.jsx";

import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAcceptRedirect = () => {
      setShowSuccessModal(false);
      router.push("/login");
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !form.fullName ||
      !form.studentId ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setErrorMessage("Please complete all fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!isPasswordValid(form.password)) {
      setErrorMessage("Password does not meet the requirements.");
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: form.fullName,
        studentId: form.studentId,
        email: form.email,
        password: form.password,
      });

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Register error:", error);

      if (error.message === "student-id-already-in-use") {
        setErrorMessage("This student ID is already in use.");
      } else if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already in use.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("Invalid email address.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("Password must be at least 6 characters.");
      } else {
        setErrorMessage("An error occurred while creating the account.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>_\-\\[\];'/`~+=]/.test(password)
    );
  };


  return (
    <>
      <main className="min-h-screen bg-[#e6e6e6] flex items-center justify-center px-4">
        <AuthCard showArrow={false}>
          <div className="text-center mb-5">
            <h2 className="text-[24px] font-bold text-black leading-none">
              Sign Up
            </h2>
            <p className="text-[12px] text-black font-semibold mt-1 leading-4">
              Create an account to
              <br />
              get started !
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <AuthInput
              label="Full name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Hernan David Cisneros"
            />

            <AuthInput
              label="Student ID"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              placeholder="123456789"
            />

            <AuthInput
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="hernan@example.com"
            />

            <AuthInput
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              showToggle={true}
            />

            <AuthInput
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              showToggle={true}
            />

            <div className="mt-1 mb-2">
              <button
                type="button"
                onClick={() => setShowPasswordHelp((prev) => !prev)}
                className="text-[12px] font-bold text-red-600 hover:underline"
              >
                {showPasswordHelp
                  ? "Hide password requirements"
                  : "Show password requirements"}
              </button>
            </div>

            <PasswordRequirements
              password={form.password}
              isOpen={showPasswordHelp}
            />

            {errorMessage && (
              <p className="mb-3 text-center text-[12px] font-semibold text-red-600">
                {errorMessage}
              </p>
            )}

            <div className="mt-5 mb-3">
              <AuthButton>
                {loading ? "Creating account..." : "Register"}
              </AuthButton>
            </div>

            <div className="text-center text-[12px] text-black">
              Already have an account?{" "}
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

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-[320px] rounded-md bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-center text-[18px] font-bold text-black">
              Account created successfully
            </h3>
            <p className="mb-5 text-center text-[14px] text-black">
              You will be redirected to the login page.
            </p>
            <button
              onClick={handleAcceptRedirect}
              className="w-full rounded-[4px] bg-red-600 py-2 text-[15px] font-bold text-white transition hover:bg-red-700"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
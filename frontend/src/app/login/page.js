"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";
import AuthCheckbox from "../../components/auth/AuthCheckbox.jsx";

const REMEMBERED_LOGIN_KEY = "linguai_remembered_login";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    studentId: "",
    password: "",
    rememberMe: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCredentials = localStorage.getItem(REMEMBERED_LOGIN_KEY);

    if (savedCredentials) {
      const parsed = JSON.parse(savedCredentials);

      setForm({
        studentId: parsed.studentId || "",
        password: parsed.password || "",
        rememberMe: true,
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await login(form.studentId, form.password);

      if (form.rememberMe) {
        localStorage.setItem(
          REMEMBERED_LOGIN_KEY,
          JSON.stringify({
            studentId: form.studentId,
            password: form.password,
          })
        );
      } else {
        localStorage.removeItem(REMEMBERED_LOGIN_KEY);
      }

      router.push("/home");
    } catch (error) {
      console.error("Login error:", error);

      if (error.message === "student-id-not-found") {
        setErrorMessage("Student ID not found.");
      } else if (error.code === "auth/invalid-credential") {
        setErrorMessage("Invalid password.");
      } else if (error.code === "auth/wrong-password") {
        setErrorMessage("Incorrect password.");
      } else {
        setErrorMessage("An error occurred while signing in.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#e6e6e6] flex items-center justify-center px-4">
      <AuthCard showArrow={true}>
        <div className="text-center mb-5">
          <h2 className="text-[24px] font-bold text-black leading-none">
            Sign In
          </h2>
          <p className="text-[12px] text-black font-semibold mt-1">
            Welcome Back !
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <AuthInput
            label="Student ID"
            type="text"
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            placeholder="123456789"
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

          <div className="mb-5">
            <AuthCheckbox
              name="rememberMe"
              checked={form.rememberMe}
              onChange={handleChange}
              label="Remember me"
            />
          </div>

          {errorMessage && (
            <p className="mb-3 text-center text-[12px] font-semibold text-red-600">
              {errorMessage}
            </p>
          )}

          <div className="mb-3">
            <AuthButton>{loading ? "Signing in..." : "Log in"}</AuthButton>
          </div>

          <div className="text-center text-[12px] text-black mb-3">
            Forgot password?{" "}
            <Link
              href="/forgotPassword"
              className="text-red-600 font-bold hover:underline"
            >
              Recover here
            </Link>
          </div>

          <div className="text-center text-[12px] text-black">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-red-600 font-bold hover:underline"
            >
              Sign Up here
            </Link>
          </div>
        </form>
      </AuthCard>
    </main>
  );
}
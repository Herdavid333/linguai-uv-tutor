"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard.jsx";
import AuthInput from "../../components/auth/AuthInput.jsx";
import AuthSelect from "../../components/auth/AuthSelect.jsx";
import PasswordRequirements from "../../components/auth/PasswordRequirements.jsx";
import AuthButton from "../../components/auth/AuthButton.jsx";
import { LEARNING_GOALS } from "../../data/learningGoals";
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
    learningGoal: "",
  });

  const [isCustomGoalMode, setIsCustomGoalMode] = useState(false);
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
      !form.confirmPassword ||
      !form.learningGoal
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
        learningGoal: form.learningGoal,
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

  const handleLearningGoalChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      learningGoal: value,
      customLearningGoal: value === "Other" ? prev.customLearningGoal : "",
    }));

    if (value === "Other") {
      setIsCustomGoalMode(true);
    }
  };

  return (
    <>
      <main className="min-h-screen bg-[#e6e6e6] flex items-center justify-center px-4 py-4">
        <AuthCard showArrow={true} width="1200px">
          <div className="text-center mb-5 -mt-2">
            <h2 className="text-[50px] font-bold text-black leading-none">
              Sign Up
            </h2>
            <p className="text-[25px] text-black font-semibold mt-3 leading-4">
              Create an account to get started !
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            <p className="mb-10 text-center text-[20px] font-bold text-red-600">
              All fields below are required
            </p>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                <AuthInput
                  label="Full name"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />

                <AuthInput
                  label="Student ID"
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                />

                <AuthInput
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
      
                <AuthSelect
                  label="Learning Goal"
                  name="learningGoal"
                  value={form.learningGoal}
                  onChange={handleChange}
                  options={LEARNING_GOALS}
                />
                  
                <AuthInput
                  label="Password"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  showToggle={true}
                />

                <AuthInput
                  label="Confirm password"
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  showToggle={true}
                />

              </div>
            </div>

            <div className="flex flex-col justify-start">
              <button
                type="button"
                onClick={() => setShowPasswordHelp((prev) => !prev)}
                className="mb-4 text-center text-[18px] font-bold text-red-600 hover:underline"
              >
                {showPasswordHelp
                  ? "Hide password requirements"
                  : "Show password requirements"}
              </button>

              <PasswordRequirements
                password={form.password}
                isOpen={showPasswordHelp}
              />

              <div className="mt-4 mb-4">
                <AuthButton>{loading ? "Creating account..." : "Register"}</AuthButton>
              </div>

              <div className="text-center text-[18px] text-black mt-2 -mb-5">
                Already have an account?{" "}
                <Link href="/login" className="text-red-600 font-bold hover:underline">
                  Sign In here
                </Link>
              </div>
            </div>
            </div>
          </form>

          {errorMessage && (
                <p className="ml-50 mt-5 -mb-5 text-left text-[18px] font-semibold text-red-600">
                  {errorMessage}
                </p>
              )}

        </AuthCard>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-10">
          <div className="w-full max-w-[380px] rounded-md bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-center text-[25px] font-bold text-black">
              Account created successfully
            </h3>
            <p className="mb-5 text-center text-[20px] text-black">
              You will be redirected to the login page.
            </p>
            <button
              onClick={handleAcceptRedirect}
              className="w-full rounded-[4px] bg-red-600 py-2 text-[25px] font-bold text-white transition hover:bg-red-700"
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
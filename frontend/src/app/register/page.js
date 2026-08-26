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
    <main
      className="
        min-h-screen
        items-center
        justify-center
        bg-[#e6e6e6]
        px-4
        py-4

        sm:px-4

        lg:px-4
        lg:py-4
      "
    >
      <section
        className="
          mx-auto
          flex
          min-h-[calc(100vh-40px)]
          w-full
          max-w-[1400px]
          flex-col
          overflow-hidden
          rounded-[12px]
          bg-white
          shadow-md

          sm:max-w-[600px]
          md:max-w-[850px]
          lg:max-w-[1180px]
          xl:max-w-[1280px]
        "
      >
        {/* HEADER */}
        <header
          className="
            relative
            bg-[#b8b8b8]
            px-5
            py-5
            text-center

            lg:py-6
          "
        >
          <h1
            className="
              font-extrabold
              leading-none
              text-black

              text-[34px]
              sm:text-[40px]
              lg:text-[48px]
              xl:text-[52px]
            "
          >
            LINGUAI
          </h1>

          <p
            className="
              font-extrabold
              leading-none
              text-red-600

              text-[24px]
              sm:text-[27px]
              lg:text-[32px]
            "
          >
            UV
          </p>

          {/* TRIÁNGULO */}
          <div
            className="
              absolute
              -bottom-[14px]
              left-1/2
              h-0
              w-0
              -translate-x-1/2
              border-l-[15px]
              border-r-[15px]
              border-t-[15px]
              border-l-transparent
              border-r-transparent
              border-t-[#b8b8b8]
            "
          />
        </header>

        {/*TITLE*/}
        <div
          className="
            px-5
            pb-3
            pt-7
            text-center

            sm:px-8

            lg:pb-4
            lg:pt-8
          "
        >
          <h2
            className="
              font-extrabold
              leading-none
              text-black

              sm:text-[38px]
              lg:text-[42px]
              xl:text-[46px]
            "
          >
            Sign Up
          </h2>

          <p
            className="
              mt-2
              font-semibold
              text-black

              text-[16px]
              sm:text-[21px]
              lg:text-[23px]
            "
          >
            Create an account to get
            started!
          </p>

          <p
            className="
              mt-2
              font-bold
              text-red-600

              text-[13px]
              sm:text-[15px]
              lg:text-[18px]
            "
          >
            All fields below are required
          </p>
        </div>

        {/*CONTENT */}
        <div
          className="
            grid
            grid-cols-1
            gap-6
            px-5
            pb-7
            pt-3

            sm:px-8

            lg:grid-cols-[1.45fr_0.75fr]
            lg:gap-8
            lg:px-10
            lg:pb-9

            xl:px-12
          "
        >
          {/*LEFT - FORM*/}
          <form
            onSubmit={handleSubmit}
            className="
              grid
              grid-cols-1
              gap-x-6
              gap-y-1

              md:grid-cols-2
            "
          >
            {/* FULL NAME */}
            <AuthInput
              label="Full name"
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
            />

            {/* STUDENT ID */}
            <AuthInput
              label="Student ID"
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
            />

            {/* EMAIL */}
            <AuthInput
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />

            {/* LEARNING GOAL */}
            <AuthSelect
              label="Learning Goal"
              name="learningGoal"
              value={form.learningGoal}
              onChange={handleChange}
              options={[
                {
                  value: "",
                  label: "Select a goal",
                },
                {
                  value: "speaking",
                  label:
                    "Improve speaking",
                },
                {
                  value: "writing",
                  label:
                    "Improve writing",
                },
                {
                  value: "grammar",
                  label:
                    "Improve grammar",
                },
                {
                  value: "vocabulary",
                  label:
                    "Improve vocabulary",
                },
                {
                  value: "general",
                  label:
                    "General English",
                },
              ]}
            />

            {/* PASSWORD */}
            <AuthInput
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              showToggle={true}
            />

            {/* CONFIRM PASSWORD */}
            <AuthInput
              label="Confirm password"
              type="password"
              name="confirmPassword"
              value={
                form.confirmPassword
              }
              onChange={handleChange}
              showToggle={true}
            />

            {/* ERROR */}
            {errorMessage && (
              <p
                className="
                  text-center
                  font-semibold
                  text-red-600

                  text-[13px]
                  sm:text-[14px]

                  md:col-span-2
                "
              >
                {errorMessage}
              </p>
            )}

            {/* MOBILE / TABLET REQUIREMENTS */}
            <div
              className="
                mt-2

                md:col-span-2

                lg:hidden
              "
            >
              <div
                className="
                  overflow-hidden
                  
                  bg-[#fafafa]
                  shadow-sm
                "
              >
                <div
                  className="
                    bg-[#b8b8b8]
                    px-3
                    py-2
                  "
                >
                  <h3
                    className="
                      text-center
                      font-extrabold
                      text-black

                      text-[16px]
                      sm:text-[18px]
                    "
                  >
                    Password Requirements
                  </h3>
                </div>

                <div className="p-3">
                  <PasswordRequirements
                    password={
                      form.password
                    }
                  />
                </div>
              </div>
            </div>

            {/* REGISTER */}
            <div
              className="
                mt-4
                md:col-span-2
              "
            >
              <AuthButton
                disabled={loading}
                className="
                  mx-auto
                  block
                  w-[85%]

                  sm:w-[75%]
                  lg:w-[70%]
                "
              >
                {loading
                  ? "Creating account..."
                  : "Register"}
              </AuthButton>
            </div>

            {/* LOGIN LINK */}
            <div
              className="
                mt-3
                text-center
                text-black
                font-bold

                text-[14px]
                sm:text-[17px]
                lg:text-[20px]

                md:col-span-2
              "
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="
                  font-bold
                  text-red-600
                  hover:underline
                "
              >
                Sign In here
              </Link>
            </div>
          </form>

          {/* =================================================
              RIGHT - PASSWORD REQUIREMENTS
              DESKTOP
          ================================================== */}
          <aside
            className="
              hidden
              self-start
              overflow-hidden
              rounded-lg

              lg:block
            "
          >
            {/* HEADER */}
            <div
              className="
                px-4
                py-3
              "
            >
              <h3
                className="
                  text-center
                  font-extrabold
                  text-red-600

                  lg:text-[20px]
                  xl:text-[21px]
                "
              >
                Password Requirements
              </h3>
            </div>

            {/* REQUIREMENTS */}
            <div className="p-4">
              <p
                className="
                  mb-4
                  text-center
                  font-semibold
                  leading-relaxed
                  text-black

                  lg:text-[15px]
                  xl:text-[18px]
                "
              >
                Your password must meet
                all of the following
                requirements.
              </p>

              <PasswordRequirements
                password={form.password}
              />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
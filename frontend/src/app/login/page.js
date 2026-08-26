"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bot } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
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
    <main
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#e6e6e6]
        px-3
        py-4

        sm:px-4
        lg:px-6
        lg:py-6
      "
    >
      <section
        className="
          grid
          w-full
          max-w-[390px]
          overflow-hidden
          rounded-[12px]
          bg-white
          shadow-md

          sm:max-w-[520px]

          lg:min-h-[650px]
          lg:max-w-[1180px]
          lg:grid-cols-[1fr_0.95fr]
          lg:rounded-[14px]

          xl:max-w-[1280px]
        "
      >
        {/* =====================================================
            LEFT SIDE - LOGIN FORM
        ====================================================== */}
        <div
          className="
            flex
            flex-col
            justify-center
            px-6
            py-8

            sm:px-10
            sm:py-10

            lg:px-14
            lg:py-12

            xl:px-16
          "
        >
          {/* MOBILE LOGO */}
          <div
            className="
              mb-7
              text-center

              lg:hidden
            "
          >
            <h1
              className="
                text-[34px]
                font-extrabold
                leading-none
                text-black

                sm:text-[42px]
              "
            >
              LINGUAI
            </h1>

            <p
              className="
                text-[24px]
                font-extrabold
                leading-none
                text-red-600

                sm:text-[28px]
              "
            >
              UV
            </p>
          </div>

          {/* TITLE */}
          <div
            className="
              mb-8
              text-center

              lg:mb-10
              lg:text-left
            "
          >
            <h2
              className="
                text-[32px]
                font-extrabold
                leading-none
                text-red-600
                text-center

                sm:text-[38px]
                lg:text-[42px]
                xl:text-[46px]
              "
            >
              Sign In
            </h2>

            <p
              className="
                mt-2
                text-[18px]
                font-semibold
                text-black
                text-center

                sm:text-[21px]
                lg:text-[23px]
              "
            >
              Welcome Back !!!
            </p>

            <p
              className="
                mt-3
                hidden
                max-w-full
                font-semibold
                leading-relaxed
                text-gray-600
                text-center

                text-[14px]
                lg:block
                lg:text-[20px]
              "
            >
              Enter your Student ID and password
              to start learning with LINGUAI.
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className="w-full"
          >
            <AuthInput
              label="Student ID"
              type="text"
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
            />

            <AuthInput
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
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
              <p
                className="
                  mb-4
                  text-center
                  font-semibold
                  text-red-600

                  text-[15px]
                  lg:text-[20px]
                "
              >
                {errorMessage}
              </p>
            )}

            <div className="mb-4">
              <AuthButton>
                {loading
                  ? "Signing in..."
                  : "Log in"}
              </AuthButton>
            </div>

            {/* FORGOT PASSWORD */}
            <div
              className="
                mt-5
                text-center
                text-black
                font-bold

                text-[14px]
                sm:text-[17px]
                lg:text-[20px]
              "
            >
              Forgot password?{" "}
              <Link
                href="/forgotPassword"
                className="
                  font-bold
                  text-red-600
                  hover:underline
                "
              >
                Recover here
              </Link>
            </div>

            {/* REGISTER */}
            <div
              className="
                mt-3
                text-center
                text-black
                font-bold

                text-[14px]
                sm:text-[17px]
                lg:text-[20px]
              "
            >
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="
                  font-bold
                  text-red-600
                  hover:underline
                "
              >
                Sign Up here
              </Link>
            </div>
          </form>
        </div>

        {/* =====================================================
            RIGHT SIDE - BRANDING
            DESKTOP ONLY
        ====================================================== */}
        <aside
          className="
            hidden
            bg-[#b8b8b8]

            lg:flex
            lg:flex-col
            lg:items-center
            lg:justify-center
            lg:px-10
            lg:py-12
            lg:text-center
          "
        >
          {/* LOGO */}
          <div>
            <h1
              className="
                font-extrabold
                leading-none
                text-black

                text-[48px]
                sm:text-[45px]
                lg:text-[50px]
                xl:text-[56px]
              "
            >
              LINGUAI
            </h1>

            <p
              className="
                font-extrabold
                leading-none
                text-red-600

                text-[34px]
                sm:text-[35px]
                lg:text-[38px]
                xl:text-[40px]
              "
            >
              UV
            </p>
          </div>

          {/* DIVIDER */}
          <div
            className="
              my-8
              h-[3px]
              w-full
              bg-white
            "
          />

          {/* BOT */}
          <div
            className="
              flex
              h-28
              w-28
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-md

              xl:h-32
              xl:w-32
            "
          >
            <Bot
              size={70}
              className="text-black"
            />
          </div>

          {/* MESSAGE */}
          <h3
            className="
              mt-8
              text-[25px]
              font-extrabold
              text-black

              xl:text-[29px]
            "
          >
            Practice English with your AI tutor
          </h3>

          <p
            className="
              mt-4
              max-w-[420px]
              text-[16px]
              font-semibold
              leading-relaxed
              text-black

              xl:text-[18px]
            "
          >
            Improve your speaking and writing
            skills through guided and personalized
            practice.
          </p>

          {/* SMALL FEATURES */}
          <div
            className="
              mt-8
              grid
              w-full
              max-w-[420px]
              grid-cols-3
              gap-3
            "
          >
            <div
              className="
                rounded-lg
                bg-white/70
                px-3
                py-3
              "
            >
              <p
                className="
                  text-[14px]
                  font-extrabold
                  text-red-600
                "
              >
                Practice
              </p>

              <p
                className="
                  mt-1
                  text-[12px]
                  font-semibold
                  text-black
                "
              >
                Interactive activities
              </p>
            </div>

            <div
              className="
                rounded-lg
                bg-white/70
                px-3
                py-3
              "
            >
              <p
                className="
                  text-[14px]
                  font-extrabold
                  text-red-600
                "
              >
                Feedback
              </p>

              <p
                className="
                  mt-1
                  text-[12px]
                  font-semibold
                  text-black
                "
              >
                Personalized support
              </p>
            </div>

            <div
              className="
                rounded-lg
                bg-white/70
                px-3
                py-3
              "
            >
              <p
                className="
                  text-[14px]
                  font-extrabold
                  text-red-600
                "
              >
                Progress
              </p>

              <p
                className="
                  mt-1
                  text-[12px]
                  font-semibold
                  text-black
                "
              >
                Track your learning
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
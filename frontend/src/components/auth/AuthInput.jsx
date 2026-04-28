"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  showToggle = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    showToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className="mb-4">
      <label
        htmlFor={name}
        className="mb-2 block text-[25px] font-bold text-red-600"
      >
        {label}
      </label>

      <div className="flex items-center border-b border-black transition-all duration-200 focus-within:border-red-600">
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent pb-4 text-[20px] text-black outline-none"
        />

        {showToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 pb-1 text-gray-500 transition hover:text-red-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={25} />}
          </button>
        )}
      </div>
    </div>
  );
}
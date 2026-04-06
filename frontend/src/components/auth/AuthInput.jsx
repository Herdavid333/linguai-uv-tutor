"use client";

import { useState } from "react";

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
        className="mb-1 block text-[12px] font-bold text-red-600"
      >
        {label}
      </label>

      <div className="flex items-center border-0 border-b border-black pb-1">
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-[13px] text-black outline-none"
        />

        {showToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="ml-2 text-[12px] text-black"
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        )}
      </div>
    </div>
  );
}
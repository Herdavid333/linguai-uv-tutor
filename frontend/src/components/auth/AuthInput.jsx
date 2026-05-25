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
  disabled = false,

  variant = "underline",

  labelClassName = "",
  inputClassName = "",
  wrapperClassName = "",
}) {
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    showToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  const isBoxed = variant === "boxed";

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      <label
        htmlFor={name}
        className={`mb-2 block font-bold ${
          isBoxed
            ? "text-[12px] text-white"
            : "text-[20px] text-red-600"
        } ${labelClassName}`}
      >
        {label}
      </label>

      <div
        className={
          isBoxed
          ? `flex items-center rounded px-2 ${
              disabled
                ? "bg-red-200/60"
                : "bg-white"
            }`
            : `flex items-center border-b border-black transition-all duration-200 focus-within:border-red-600`
        }
      >
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full outline-none
            ${
              isBoxed
                ? `py-1 text-[12px] ${
                  disabled
                    ? "font-medium text-gray-700"
                    : "font-semibold text-black"
                } bg-transparent`
                : "bg-transparent pb-2 text-[15px] sm:text-[16px] text-black"
            }
            disabled:cursor-not-allowed
            ${inputClassName}
          `}
        />

        {showToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className={`ml-2 flex items-center justify-center transition active:scale-90 ${
              isBoxed
                ? "text-black"
                : "pb-1 text-gray-500 hover:text-red-600"
            }`}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
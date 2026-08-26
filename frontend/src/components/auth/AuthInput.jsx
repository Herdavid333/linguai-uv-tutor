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
  const [showPassword, setShowPassword] =
    useState(false);

  const inputType =
    showToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  const isBoxed = variant === "boxed";
  const isField = variant === "field";

  return (
    <div className={`${wrapperClassName}`}>
      {/* LABEL */}
      <label
        htmlFor={name}
        className={`
          block
          font-bold

          ${
            isField
              ? `
                mb-2
                text-[15px]
                text-black
                md:text-[17px]
                lg:text-[20px]
              `
              : isBoxed
              ? `
                mb-2
                text-[20px]
                text-white
              `
              : `
                mb-2
                text-[24px]
                text-red-600
              `
          }

          ${labelClassName}
        `}
      >
        {label}
      </label>

      {/* INPUT CONTAINER */}
      <div
        className={`
          flex
          items-center

          ${
            isField
              ? `
                min-h-[44px]
                rounded-md
                border
                px-3
                transition-all
                duration-200

           

                lg:min-h-[50px]

                ${
                  disabled
                    ? `
                      border-gray-300
                      bg-[#e6e6e6]
                    `
                    : `
                      border-gray-400
                      bg-white
                      focus-within:border-red-600
                      focus-within:ring-1
                      focus-within:ring-red-600
                    `
                }
              `
              : isBoxed
              ? `
                rounded
                px-2

                ${
                  disabled
                    ? "bg-red-200/60"
                    : "bg-white"
                }
              `
              : `
                border-b
                border-black
                transition-all
                duration-200
                focus-within:border-red-600
              `
          }
        `}
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
            w-full
            outline-none

            ${
              isField
                ? `
                  bg-transparent
                  py-2
                  text-[15px]
                  font-semibold
                  text-black

                  md:text-[17px]
                  lg:text-[19px]

                  disabled:text-red-600
                  disabled:font-bold
                
                `
                : isBoxed
                ? `
                  bg-transparent
                  py-1
                  text-[12px]

                  ${
                    disabled
                      ? "font-medium text-gray-700"
                      : "font-semibold text-black"
                  }
                `
                : `
                  bg-transparent
                  pb-2
                  text-[15px]
                  text-black
                  sm:text-[20px]
                `
            }

            disabled:cursor-not-allowed

            ${inputClassName}
          `}
        />

        {/* PASSWORD TOGGLE */}
        {showToggle &&
          type === "password" && (
            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (prev) => !prev
                )
              }
              className={`
                ml-2
                flex
                shrink-0
                items-center
                justify-center
                transition
                active:scale-90

                ${
                  isField
                    ? "text-gray-600 hover:text-red-600"
                    : isBoxed
                    ? "text-black"
                    : "pb-1 text-gray-500 hover:text-red-600"
                }
              `}
            >
              {showPassword ? (
                <EyeOff size={24} />
              ) : (
                <Eye size={24} />
              )}
            </button>
          )}
      </div>
    </div>
  );
}
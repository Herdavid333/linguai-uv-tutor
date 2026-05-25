"use client";

export default function AuthSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,

  variant = "underline",

  labelClassName = "",
  selectClassName = "",
  wrapperClassName = "",
}) {
  const isBoxed = variant === "boxed";

  return (
    <div className={`mb-4 ${wrapperClassName}`}>
      <label
        htmlFor={name}
        className={`mb-2 block font-bold ${
          isBoxed ? "text-[12px] text-white" : "text-[20px] text-red-600"
        } ${labelClassName}`}
      >
        {label}
      </label>

      <div
        className={
          isBoxed
            ? `flex items-center rounded bg-white px-2 ${
                disabled ? "bg-[#d8bfc2]" : ""
              }`
            : "flex items-center border-b border-black transition-all duration-200 focus-within:border-red-600"
        }
      >
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full outline-none
            ${
              isBoxed
                ? "py-1 text-[12px] font-semibold text-black bg-transparent"
                : "bg-transparent pb-2 text-[15px] sm:text-[16px] text-black"
            }
            disabled:cursor-not-allowed
            ${selectClassName}
          `}
        >
          <option value=""></option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
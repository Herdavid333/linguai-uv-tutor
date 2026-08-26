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
  const isField = variant === "field";

  return (
    <div className={`${wrapperClassName}`}>
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
                text-[12px]
                text-white
              `
              : `
                mb-2
                text-[20px]
                text-red-600
              `
          }

          ${labelClassName}
        `}
      >
        {label}
      </label>

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
                border-gray-400
                bg-white
                px-3
                transition-all
                duration-200

                focus-within:border-red-600
                focus-within:ring-1
                focus-within:ring-red-600

                lg:min-h-[50px]
              `
              : isBoxed
              ? `
                rounded
                bg-white
                px-2
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
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
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
                `
                : isBoxed
                ? `
                  bg-transparent
                  py-1
                  text-[12px]
                  font-semibold
                  text-black
                `
                : `
                  bg-transparent
                  pb-2
                  text-[15px]
                  text-black
                  sm:text-[16px]
                `
            }

            disabled:cursor-not-allowed

            ${selectClassName}
          `}
        >
          <option value="">
            Select a goal
          </option>

          {options.map((option) => {
            const optionValue =
              typeof option === "object"
                ? option.value
                : option;

            const optionLabel =
              typeof option === "object"
                ? option.label
                : option;

            return (
              <option
                key={optionValue}
                value={optionValue}
              >
                {optionLabel}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
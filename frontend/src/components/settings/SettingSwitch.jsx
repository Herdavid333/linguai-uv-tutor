"use client";

export default function SettingSwitch({ label, value, onChange }) {
  return (
    <div className="
      grid grid-cols-[1fr_auto] 
      items-center 
      gap-3
    ">
      <span className="
        font-semibold 
        text-black 
        leading-tight

        text-[14px]
        md:text-[15px]
        lg:text-[18px]
        xl:text-[20px]
      ">
        {label}
      </span>

      <div className="flex shrink-0 overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`
            w-[34px]
            py-1
            font-extrabold
            transition
            duration-100
            active:scale-95

            text-[12px]
            md:text-[13px]

            lg:w-[42px]
            lg:py-1.5
            lg:text-[15px]

            xl:w-[50px]
            xl:text-[20px]

            ${
              value
                ? "bg-red-600 text-white"
                : "bg-white text-black"
            }
          `}
        >
          on
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`
            w-[34px]
            py-1
            font-extrabold
            transition
            duration-100
            active:scale-95

            text-[12px]
            md:text-[13px]

            lg:w-[42px]
            lg:py-1.5
            lg:text-[15px]

            xl:w-[50px]
            xl:text-[20px]

            ${
              !value
                ? "bg-red-600 text-white"
                : "bg-white text-black"
            }
          `}
        >
          off
        </button>
      </div>
    </div>
  );
}
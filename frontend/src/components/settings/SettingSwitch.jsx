"use client";

export default function SettingSwitch({ label, value, onChange }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <span className="text-[16px] font-semibold text-black leading-tight">
        {label}
      </span>

      <div className="flex shrink-0 overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`w-[34px] py-1 text-[16px] font-extrabold transition duration-100 active:scale-95 ${
            value ? "bg-red-600 text-white" : "bg-white text-black"
          }`}
        >
          on
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`w-[34px] py-1 text-[16px] font-extrabold transition duration-100 active:scale-95 ${
            !value ? "bg-red-600 text-white" : "bg-white text-black"
          }`}
        >
          off
        </button>
      </div>
    </div>
  );
}
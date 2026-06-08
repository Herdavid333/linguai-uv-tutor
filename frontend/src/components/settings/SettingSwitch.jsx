"use client";

export default function SettingSwitch({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[16px] font-semibold text-black">
        {label}
      </span>

      <div className="flex overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-1 text-[14px] font-extrabold transition duration-100 active:scale-95 ${
            value ? "bg-red-600 text-white" : "bg-white text-black"
          }`}
        >
          on
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-1 text-[14px] font-extrabold transition duration-100 active:scale-95 ${
            !value ? "bg-red-600 text-white" : "bg-white text-black"
          }`}
        >
          off
        </button>
      </div>
    </div>
  );
}
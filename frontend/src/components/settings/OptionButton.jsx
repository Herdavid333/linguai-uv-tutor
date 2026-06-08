"use client";

export default function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-[13px] font-extrabold transition duration-100 active:scale-95 ${
        active ? "bg-red-600 text-white" : "bg-white text-black"
      }`}
    >
      {children}
    </button>
  );
}
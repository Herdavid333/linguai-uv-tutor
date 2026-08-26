"use client";

export default function OptionButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-3
        py-1
        font-extrabold
        transition
        duration-100
        active:scale-95

        text-[12px]
        md:text-[13px]

        lg:px-4
        lg:py-1.5
        lg:text-[15px]

        xl:px-5
        xl:text-[20px]

        ${
          active
            ? "bg-red-600 text-white"
            : "bg-white text-black"
        }
      `}
    >
      {children}
    </button>
  );
}
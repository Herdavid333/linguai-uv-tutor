export default function AuthButton({
  children,
  type = "submit",
  disabled = false,
  className = "",
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        mx-auto
        block
        w-[80%]

        rounded-[6px]
        bg-red-600

        px-5
        py-3

        text-[16px]
        font-bold
        text-white

        shadow-sm

        transition-all
        duration-100

        hover:bg-red-700
        hover:scale-[1.01]

        active:scale-[0.98]
        active:translate-y-[2px]

        disabled:cursor-not-allowed
        disabled:opacity-60

        sm:text-[17px]
        lg:text-[18px]

        ${className}
      `}
    >
      {children}
    </button>
  );
}
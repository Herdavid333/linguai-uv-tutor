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
        w-full
        rounded-[4px]
        bg-red-600
        font-bold
        text-white
        shadow-sm

        transition-all
        duration-100

        hover:bg-red-700
        hover:scale-[1.01]

        active:scale-95
        active:translate-y-[2px]

        disabled:cursor-not-allowed
        disabled:opacity-60

        ${className}
      `}
    >
      {children}
    </button>
  );
}
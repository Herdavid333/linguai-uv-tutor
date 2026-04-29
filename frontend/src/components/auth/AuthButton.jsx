export default function AuthButton({ children, type = "submit" }) {
  return (
    <button
      type={type}
      className="w-full rounded-[4px] bg-red-600 py-3 text-[17px] sm:text-[25px] font-bold text-white shadow-sm transition hover:bg-red-700"
    >
      {children}
    </button>
  );
}
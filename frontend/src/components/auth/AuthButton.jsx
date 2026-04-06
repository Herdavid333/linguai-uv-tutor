export default function AuthButton({ children, type = "submit" }) {
  return (
    <button
      type={type}
      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-[16px] py-2 rounded-[4px] shadow-sm transition"
    >
      {children}
    </button>
  );
}
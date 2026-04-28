export default function AuthCard({ children, showArrow = false }) {
  return (
    <div className="w-full max-w-[600px] rounded-[10px] border-3 border-[#f3a3a3] bg-white shadow-sm overflow-hidden">
      <div className="relative bg-[#b8b8b8] h-[150px] flex flex-col items-center justify-center">
        <h1 className="text-[70px] font-extrabold tracking-wide text-black leading-none">
          LINGUAI
        </h1>
        <p className="text-[40px] font-extrabold text-red-600 leading-none -mt-1">
          UV
        </p>

        {showArrow && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px]">
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[20px] border-l-transparent border-r-transparent border-t-[#8e8e8e]" />
          </div>
        )}
      </div>

      <div className="px-10 py-20 bg-white">{children}</div>
    </div>
  );
}
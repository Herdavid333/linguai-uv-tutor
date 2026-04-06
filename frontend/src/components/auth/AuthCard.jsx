export default function AuthCard({ children, showArrow = false }) {
  return (
    <div className="w-[300px] rounded-[4px] border-2 border-[#f3a3a3] bg-white shadow-sm overflow-hidden">
      <div className="relative bg-[#b8b8b8] h-[82px] flex flex-col items-center justify-center">
        <h1 className="text-[18px] font-extrabold tracking-wide text-black leading-none">
          LINGUAI
        </h1>
        <p className="text-[18px] font-extrabold text-red-600 leading-none mt-1">
          UV
        </p>

        {showArrow && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-10px]">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#8e8e8e]" />
          </div>
        )}
      </div>

      <div className="px-5 py-5 bg-white">{children}</div>
    </div>
  );
}
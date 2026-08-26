export default function AuthCard({
  children,
  showArrow = false,
  width = "600px",
}) {
  return (
    <div
      className="w-full rounded-[10px] bg-white shadow-sm overflow-hidden"
      style={{ maxWidth: width }}
    >
      <div className="relative bg-[#b8b8b8] h-[100px] sm:h-[120px] md:h-[150px] flex flex-col items-center justify-center">
        <h1 className="text-[38px] sm:text-[52px] md:text-[70px] font-extrabold tracking-wide text-black leading-none">
          LINGUAI
        </h1>

        <p className="text-[26px] sm:text-[32px] md:text-[40px] font-extrabold text-red-600 leading-none -mt-1">
          UV
        </p>

        {showArrow && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-16px] md:bottom-[-20px]">
            <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[16px] border-t-[#b8b8b8] md:border-l-[20px] md:border-r-[20px] md:border-t-[20px] border-l-transparent border-r-transparent border-t-[#8e8e8e]" />
          </div>
        )}
      </div>

      <div className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-10 bg-white">
        {children}
      </div>
    </div>
  );
}
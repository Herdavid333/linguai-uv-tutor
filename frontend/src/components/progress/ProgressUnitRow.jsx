export default function ProgressUnitRow({ unitTitle, score }) {
  return (
    <div className="grid grid-cols-[1fr_76px_34px] items-center gap-2 text-[15px] font-bold text-black leading-[0.9]">
      <span className="min-w-0 break-words">
        {unitTitle}
      </span>

      <div className="h-3 rounded-full bg-[#9d9d9d] overflow-hidden">
        <div
          className="h-full rounded-full bg-red-600"
          style={{ width: `${score}%` }}
        />
      </div>

      <span className="text-right text-[15px] leading-[0.9]">{score}%</span>
    </div>
  );
}
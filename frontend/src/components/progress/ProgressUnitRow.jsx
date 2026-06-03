export default function ProgressUnitRow({ unitTitle, score }) {
  return (
    <div className="flex items-center gap-2 text-[15px] font-bold text-black">
      <span className="flex-1 truncate">{unitTitle}</span>

      <div className="h-4 w-[90px] rounded-full bg-[#9d9d9d] overflow-hidden">
        <div
          className="h-full rounded-full bg-red-600"
          style={{ width: `${score}%` }}
        />
      </div>

      <span className="w-[38px] text-right">{score}%</span>
    </div>
  );
}
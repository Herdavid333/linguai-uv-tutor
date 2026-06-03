export default function ProgressUnitRow({ unitTitle, score }) {
  return (
    <div className="grid grid-cols-[1fr_78px_36px] sm:grid-cols-[1fr_95px_38px] items-center gap-2 text-[13px] sm:text-[14px] font-bold text-black">
      <span className="min-w-0 leading-tight break-words pl-0 text-left ">
        {unitTitle}
      </span>

      <div className="h-4 rounded-full bg-[#9d9d9d] overflow-hidden">
        <div
          className="h-full rounded-full bg-red-600"
          style={{ width: `${score}%` }}
        />
      </div>

      <span className="text-right">{score}%</span>
    </div>
  );
}
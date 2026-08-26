export default function ProgressUnitRow({ unitTitle, score }) {
  return (
    <div className="
      min-w-0
      flex-1
      grid 
      grid-cols-[minmax(0,1fr)_120px_42px]
      items-center 
      gap-3
      font-bold 
      text-black 
      leading-tight

      text-[13px]
      md:text-[14px]

      lg:grid-cols-[minmax(0,1fr)_180px_48px]
      lg:text-[17px]

      xl:grid-cols-[minmax(0,1fr)_220px_52px]

    ">
      <span className="min-w-0 break-words">
        {unitTitle}
      </span>

      {/* PROGRESS BAR */}
      <div className="
        h-3
        w-full
        rounded-full 
        bg-gray-500 
        overflow-hidden
      ">
        <div
          className="h-full rounded-full bg-red-600 transition-[width] duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* PERCENTAGE */}
      <span className="
        text-right 
        leading-[0.9]
        font-extrabold

        text-[14px]
        md:text-[15px]
        lg:text-[17px]
      ">
        {score}%</span>
    </div>
  );
}
"use client";

export default function UnitList({ units, onSelectUnit }) {
  return (
    <div className="mt-2 space-y-2">
      {units.map((unit) => (
        <button
          key={unit.id}
          onClick={() => onSelectUnit(unit)}
          className="flex w-full items-center justify-between rounded-[4px] bg-[#ffb3b3] px-3 py-2 text-left text-[14px] font-bold text-black shadow-sm transition hover:bg-[#ff9f9f]"
        >
          <span>
            {unit.shortTitle} - {unit.title}
          </span>
          <span>▶</span>
        </button>
      ))}
    </div>
  );
}
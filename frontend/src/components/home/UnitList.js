"use client";

export default function UnitList({ units, onSelectUnit }) {
  return (
    <div className="mt-2 space-y-2">
      {units.map((unit) => (
        <button
          key={unit.id}
          type="button"
          onClick={() =>
            onSelectUnit(unit)
          }
          className="
            flex
            w-full
            items-center
            justify-between
            gap-3
            rounded-md
            bg-red-300
            px-3
            py-3
            text-left
            transition-all
            hover:bg-red-400
            active:scale-[0.99]
          "
        >
          <div className="min-w-0">
            <p
              className="
                font-extrabold
                leading-snug
                text-black

                text-[13px]
                md:text-[14px]
                lg:text-[17px]
              "
            >
              {unit.shortTitle
                ? `${unit.shortTitle} - ${unit.title}`
                : unit.title}
            </p>

            <p
              className="
                mt-1
                font-semibold
                text-gray-700

                text-[13px]
                md:text-[14px]
                lg:text-[17px]
              "
            >
              {unit.topics?.length || 0}{" "}
              {(unit.topics?.length || 0) === 1
                ? "topic"
                : "topics"}
            </p>
          </div>

          <span className="shrink-0 text-[18px] font-extrabold text-black">
            ▶
          </span>
        </button>
      ))}
    </div>
  );
}
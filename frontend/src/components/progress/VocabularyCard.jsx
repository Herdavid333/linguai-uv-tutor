export default function VocabularyCard({
  word,
  meaning,
  example,
  unit,
  occurrences = 1,
}) {
  return (
    <article
      className="
        rounded-md
        bg-[#d9d9d9]
        px-3
        py-3
        text-[14px]
        text-black
        shadow-sm
      "
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 break-words text-[16px] font-extrabold text-red-600">
          {word}
        </h3>

        {occurrences > 1 && (
          <span
            className="
              shrink-0
              rounded-full
              bg-red-100
              px-2
              py-1
              text-[11px]
              font-extrabold
              text-red-600
            "
          >
            Seen {occurrences} times
          </span>
        )}
      </div>

      <p className="mt-2 leading-snug">
        <span className="font-extrabold">
          Meaning:
        </span>{" "}
        {meaning}
      </p>

      <p className="mt-2 leading-snug text-gray-700">
        <span className="font-extrabold text-black">
          Example:
        </span>{" "}
        <span className="italic">
          {example}
        </span>
      </p>

      {unit && (
        <p className="mt-2 text-[12px] font-semibold text-gray-600">
          Practiced in: {unit}
        </p>
      )}
    </article>
  );
}
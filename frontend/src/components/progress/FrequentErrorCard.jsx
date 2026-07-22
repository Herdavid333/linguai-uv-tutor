export default function FrequentErrorCard({
  wrong,
  correct,
  explanation,
  repeated = 1,
}) {
  return (
    <article className="border-b border-gray-400 py-3 text-[14px] text-black last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 leading-snug">
          <p className="break-words">
            <span className="font-extrabold text-red-600">
              ✕
            </span>{" "}
            {wrong}
          </p>

          <p className="mt-1 break-words">
            <span className="font-extrabold text-green-600">
              ✓
            </span>{" "}
            {correct}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-red-100 px-2 py-1 text-[11px] font-extrabold text-red-600">
          ×{repeated}
        </span>
      </div>

      {explanation && (
        <p className="mt-2 leading-snug text-gray-700">
          <span className="font-extrabold text-black">
            Explanation:
          </span>{" "}
          {explanation}
        </p>
      )}
    </article>
  );
}
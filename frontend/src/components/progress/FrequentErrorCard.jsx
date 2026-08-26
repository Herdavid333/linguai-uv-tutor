export default function FrequentErrorCard({
  wrong,
  correct,
  explanation,
  repeated,
}) {
  return (
    <article
      className="
        border-b
        border-gray-400
        py-3
        text-black
        last:border-b-0

        text-[14px]
        md:text-[15px]
        lg:text-[17px]
        xl:text-[18px]
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0 flex-1 space-y-1 leading-tight">
          <p className="break-words">
            <span className="font-extrabold text-red-600">
              ✕
            </span>{" "}
            {wrong}
          </p>

          <p className="break-words">
            <span className="font-extrabold text-green-600">
              ✓
            </span>{" "}
            {correct}
          </p>
        </div>

        {repeated > 0 && (
          <span
            className="
              shrink-0
              rounded-full
              bg-red-100
              px-2 py-1
              font-extrabold
              text-red-600

              text-[14px]
              md:text-[15px]
              lg:text-[17px]
              xl:text-[18px]
            "
          >
            ×{repeated}
          </span>
        )}
      </div>

      {explanation && (
        <p className="
          mt-2 
          leading-snug 
          text-black
        ">
          <span className="
            font-extrabold 
            text-black
          ">
            Explanation:
          </span>{" "}
          {explanation}
        </p>
      )}
    </article>
  );
}
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
        overflow-hidden
        rounded-md
        bg-[#d8d8d8]
        shadow-sm

        text-[13px]
        md:text-[14px]
        lg:text-[18px]
      "
    >
      {/* ENCABEZADO */}
      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          bg-red-600
          px-3
          py-2
        "
      >
        <h3
          className="
            min-w-0
            break-words
            capitalize
            font-extrabold
            leading-tight
            text-white

            text-[13px]
            md:text-[14px]
            lg:text-[24px]
          "
        >
          {word}
        </h3>

        {occurrences > 1 && (
          <span
            className="
              shrink-0
              rounded-full
              bg-white
              px-2
              py-1
              font-extrabold
              text-red-600

              text-[13px]
              md:text-[14px]
              lg:text-[20px]
            "
          >
            Seen {occurrences} times
          </span>
        )}
      </div>

      {/* CONTENIDO */}
      <div className="px-3 py-3">
        <p className="leading-snug text-black">
          <span className="font-extrabold">
            Meaning:
          </span>{" "}
          {meaning}
        </p>

        <p className="mt-2 leading-snug text-black">
          <span className="font-extrabold text-black">
            Example:
          </span>{" "}
          <span className="italic">
            {example}
          </span>
        </p>

        {unit && (
           <p className="
              mt-2
              font-semibold 
              text-red-600
              text-right

              text-[13px]
              md:text-[14px]
              lg:text-[17px]
            ">
              Practiced in: {unit}
            </p>
        )}
      </div>
    </article>
  );
}
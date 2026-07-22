"use client";

import { X } from "lucide-react";

export default function LearningSummaryPanel({
  isOpen,
  onClose,
  corrections = [],
  newWords = [],
  grammarStructures = [],
}) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px]">
      <div className="absolute bottom-[115px] left-3 right-3 rounded-[12px] bg-[#9d9d9d] p-3 pt-8 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close learning summary"
          className="absolute right-3 top-0.5 rounded-full p-1 text-red-600 transition duration-100 hover:text-red-700 active:translate-y-[1px] active:scale-90"
        >
          <X size={22} strokeWidth={3} />
        </button>

        <SummarySection title="Corrections">
          {corrections.length > 0 ? (
            corrections.map((item, index) => (
              <div key={`${item.wrong}-${item.correct}-${index}`}>
                <div className="text-[15px] font-semibold leading-relaxed text-black">
                  <p>
                    <span className="font-extrabold text-red-600">✕</span>{" "}
                    {item.wrong}
                  </p>

                  <p>
                    <span className="font-extrabold">✓</span>{" "}
                    {item.correct}
                  </p>

                  <p className="mt-1">
                    <span className="font-extrabold">Explanation:</span>{" "}
                    {item.explanation}
                  </p>
                </div>

               {item.occurrences > 1 && (
                  <p className="mt-1 text-[13px] font-bold text-gray-700">
                    Repeated {item.occurrences} times
                  </p>
                )} 

                {index < corrections.length - 1 && (
                  <div className="my-3 border-b border-gray-500" />
                )}
              </div>
            ))
          ) : (
            <EmptyMessage text="No corrections yet." />
          )}
        </SummarySection>

        <SummarySection title="New Words">
          {newWords.length > 0 ? (
            <ul className="space-y-3">
              {newWords.map((item, index) => (
                <li
                  key={`${item.word}-${index}`}
                  className="flex items-start gap-2 text-[15px] text-black"
                >
                  <span className="mt-[2px] font-extrabold text-red-600">
                    •
                  </span>

                  <div>
                    <p>
                      <span className="font-extrabold">{item.word}:</span>{" "}
                      {item.meaning || item.definition}
                    </p>

                    {item.example && (
                      <p className="mt-1 text-[14px] italic">
                        Example: {item.example}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyMessage text="No new words yet." />
          )}
        </SummarySection>

        <SummarySection title="Grammar Structures">
          {grammarStructures.length > 0 ? (
            <ul className="space-y-3">
              {grammarStructures.map((item, index) => {
                const structureName =
                  typeof item === "string"
                    ? item
                    : item?.structure || "";

                const explanation =
                  typeof item === "object"
                    ? item?.explanation || ""
                    : "";

                const example =
                  typeof item === "object"
                    ? item?.example || ""
                    : "";

                return (
                  <li
                    key={`${structureName}-${index}`}
                    className="flex items-start gap-2 text-[15px] text-black"
                  >
                    <span className="mt-[2px] font-extrabold text-red-600">
                      •
                    </span>

                    <div>
                      <p className="font-extrabold">
                        {structureName}
                      </p>

                      {explanation && (
                        <p className="mt-1 font-semibold">
                          {explanation}
                        </p>
                      )}

                      {example && (
                        <p className="mt-1 text-[14px] italic">
                          Example: {example}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyMessage text="No grammar structures yet." />
          )}
        </SummarySection>

        <div className="absolute -bottom-3 left-12 h-0 w-0 border-l-[9px] border-r-[9px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#9d9d9d]" />
      </div>
    </div>
  );
}

function SummarySection({
  title,
  children,
  height = "h-[100px]",
}) {
  return (
    <section className="mb-3 rounded-md bg-[#d9d9d9] p-4 shadow-inner last:mb-0">
      <h3 className="mb-2 text-[18px] font-extrabold text-red-600">
        {title}
      </h3>

      <div className={`${height} overflow-y-auto pr-2`}>
        {children}
      </div>
    </section>
  );
}

function EmptyMessage({ text }) {
  return (
    <p className="text-[14px] font-semibold italic text-gray-600">
      {text}
    </p>
  );
}
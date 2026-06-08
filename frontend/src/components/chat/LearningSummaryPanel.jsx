"use client";

import { X } from "lucide-react";

export default function LearningSummaryPanel({ isOpen, onClose }) {
  if (!isOpen) return null;

  const corrections = [
    {
      wrong: "i am from Colombia",
      correct: "I am from Colombia",
      explanation: "Sentences must start with a capital letter.",
    },
    {
      wrong: "my name is hernan",
      correct: "My name is Hernan",
      explanation: "Names must start with capital letters.",
    },
  ];

  const newWords = [
    {
        word: "introduce",
        definition: "present yourself",
    },
    {
        word: "greet",
        definition: "say hello",
    },
    {
        word: "country",
        definition: "nation",
    },
    {
        word: "from",
        definition: "used to indicate origin",
    },
    ];

  const grammarStructures = [
    "I am from + country",
    "My name is + name",
    "I am + adjective",
    "This is + noun",
  ];

  return (
    <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px]">
      <div className="absolute left-3 right-3 bottom-[115px] rounded-[12px] bg-[#9d9d9d] p-3 pt-8 shadow-lg">
        <button
            onClick={onClose}
            className="
                absolute right-3 top-0.5
                rounded-full
                p-1
                text-red-600
                transition duration-100
                active:scale-90
                active:translate-y-[1px]
                hover:text-red-700
            "
        >
            <X size={22} strokeWidth={3} />
        </button>

        <SummarySection title="Corrections">
          {corrections.map((item, index) => (
            <div key={index}>
                <div className="text-[15px] font-semibold text-black leading-relaxed">
                <p>
                    <span className="font-extrabold text-red-600">✕</span>{" "}
                    {item.wrong}
                </p>

                <p>
                    <span className="font-extrabold">✓</span>{" "}
                    {item.correct}
                </p>

                <p className="mt-1">
                    <span className="font-extrabold">
                    Explanation:
                    </span>{" "}
                    {item.explanation}
                </p>
                </div>

                {index < corrections.length - 1 && (
                <div className="my-3 border-b border-gray-500" />
                )}
            </div>
            ))}
        </SummarySection>

        <SummarySection title="New Words">
          <ul className="space-y-2">
            {newWords.map((item, index) => (
                <li
                key={index}
                className="flex items-start gap-2 text-[15px] text-black"
                >
                <span className="mt-[2px] text-red-600 font-extrabold">
                    •
                </span>

                <span>
                    <span className="font-extrabold">
                    {item.word}:
                    </span>{" "}
                    {item.definition}
                </span>
                </li>
            ))}
            </ul>
        </SummarySection>

        <SummarySection title="Grammar Structures">
          <ul className="space-y-2">
            {grammarStructures.map((structure, index) => (
                <li
                key={index}
                className="flex items-start gap-2 text-[15px] font-semibold text-black"
                >
                <span className="mt-[2px] text-red-600 font-extrabold">
                    •
                </span>

                <span>{structure}</span>
                </li>
            ))}
            </ul>
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
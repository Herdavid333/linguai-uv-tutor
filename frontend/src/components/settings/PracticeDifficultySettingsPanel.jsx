"use client";

import { useState } from "react";

export default function PracticeDifficultySettingsPanel() {
  const [difficulty, setDifficulty] = useState("Normal");

  const options = [
    {
      name: "Easy",
      description: "More guidance and simpler exercises.",
    },
    {
      name: "Normal",
      description: "Balanced practice level.",
    },
    {
      name: "Challenging",
      description: "More demanding activities and feedback.",
    },
  ];

  return (
    <div className="bg-[#9d9d9d] px-4 py-4 shadow-md border border-gray-500 min-h-[170px]">
      <p className="mb-3 text-[14px] font-semibold text-white">
        Select the difficulty level for your practice sessions.
      </p>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.name}
            type="button"
            onClick={() => setDifficulty(option.name)}
            className="flex items-start gap-3 text-left transition duration-100 active:scale-95"
          >
            <span
              className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${
                difficulty === option.name
                  ? "bg-red-600"
                  : "bg-black"
              }`}
            />

            <div>
              <p className="text-[15px] font-bold text-black">
                {option.name}
              </p>

              <p className="text-[12px] text-black">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
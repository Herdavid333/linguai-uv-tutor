"use client";

import { useState } from "react";

export default function LearningLevelSettingsPanel() {
  const [selectedLevel, setSelectedLevel] = useState("Beginner (A1)");

  const levels = [
    "Beginner (A1)",
    "Elementary (A2)",
    "Intermediate (B1)",
  ];

  return (
    <div className="bg-[#9d9d9d] px-4 py-4 shadow-md border border-gray-500 min-h-[170px]">
      <p className="mb-3 text-[14px] font-semibold text-white">
        Select the level that you want
      </p>

      <div className="space-y-2">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setSelectedLevel(level)}
            className="flex items-center gap-3 text-[15px] font-semibold text-black transition duration-100 active:scale-95"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                selectedLevel === level ? "bg-red-600" : "bg-black"
              }`}
            />

            <span>{level}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
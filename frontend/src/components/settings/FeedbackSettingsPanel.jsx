"use client";

import { useState } from "react";
import SettingSwitch from "./SettingSwitch";

export default function FeedbackSettingsPanel() {
  const [showCorrections, setShowCorrections] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [highlightErrors, setHighlightErrors] = useState(true);

  return (
    <div className="bg-[#9d9d9d] px-4 py-4 shadow-md border border-gray-500 min-h-[170px] flex flex-col justify-evenly">
      <SettingSwitch
        label="Show corrections automatically"
        value={showCorrections}
        onChange={setShowCorrections}
      />

      <SettingSwitch
        label="Show explanations"
        value={showExplanations}
        onChange={setShowExplanations}
      />

      <SettingSwitch
        label="Highlight errors"
        value={highlightErrors}
        onChange={setHighlightErrors}
      />
    </div>
  );
}
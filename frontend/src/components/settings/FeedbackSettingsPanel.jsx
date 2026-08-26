"use client";

import { useState } from "react";
import SettingSwitch from "./SettingSwitch";

export default function FeedbackSettingsPanel() {
  const [showCorrections, setShowCorrections] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [highlightErrors, setHighlightErrors] = useState(true);

  return (
    <div className="
      bg-[#e5e5e5] 
      px-4 py-4 
      shadow-md
      min-h-[170px] 
      flex flex-col 
      justify-evenly

      lg:min-h-[210px]
      lg:px-6
      lg:py-5
    ">
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
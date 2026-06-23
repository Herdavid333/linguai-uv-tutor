"use client";

import { useState } from "react";
import SettingSwitch from "./SettingSwitch";
import OptionButton from "./OptionButton";

export default function VoiceSettingsPanel() {
  const [voiceInput, setVoiceInput] = useState(true);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState("normal");

  return (
    <div className="bg-[#9d9d9d] px-4 py-4 shadow-md border border-gray-500 min-h-[170px] flex flex-col justify-evenly">
      <SettingSwitch
        label="Enable voice input"
        value={voiceInput}
        onChange={setVoiceInput}
      />

      <SettingSwitch
        label="Enable voice output"
        value={voiceOutput}
        onChange={setVoiceOutput}
      />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[15px] font-semibold text-black">
          Speech speed
        </span>

        <div className="flex overflow-hidden">
          <OptionButton
            active={speechSpeed === "slow"}
            onClick={() => setSpeechSpeed("slow")}
          >
            Slow
          </OptionButton>

          <OptionButton
            active={speechSpeed === "normal"}
            onClick={() => setSpeechSpeed("normal")}
          >
            Normal
          </OptionButton>

          <OptionButton
            active={speechSpeed === "fast"}
            onClick={() => setSpeechSpeed("fast")}
          >
            Fast
          </OptionButton>
        </div>
      </div>
    </div>
  );
}
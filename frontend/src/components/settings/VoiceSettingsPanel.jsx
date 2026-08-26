"use client";

import { useState } from "react";
import SettingSwitch from "./SettingSwitch";
import OptionButton from "./OptionButton";

export default function VoiceSettingsPanel() {
  const [voiceInput, setVoiceInput] = useState(true);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [speechSpeed, setSpeechSpeed] = useState("normal");

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
        <span className="
          font-semibold 
          text-black

          text-[14px]
          md:text-[15px]
          lg:text-[18px]
          xl:text-[20px]
        ">
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
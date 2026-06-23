"use client";

import { useState } from "react";
import OptionButton from "./OptionButton";

export default function LanguageSettingsPanel() {
  const [interfaceLanguage, setInterfaceLanguage] = useState("english");
  const [helpLanguage, setHelpLanguage] = useState("english");

  return (
    <div className="bg-[#9d9d9d] px-4 py-4 shadow-md border border-gray-500 min-h-[170px] flex flex-col justify-evenly">
      <LanguageOptionRow
        label="Interface Language"
        value={interfaceLanguage}
        onChange={setInterfaceLanguage}
      />

      <LanguageOptionRow
        label="Help language"
        value={helpLanguage}
        onChange={setHelpLanguage}
      />
    </div>
  );
}

function LanguageOptionRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[15px] font-semibold text-black">
        {label}
      </span>

      <div className="flex overflow-hidden">
        <OptionButton
          active={value === "english"}
          onClick={() => onChange("english")}
        >
          English
        </OptionButton>

        <OptionButton
          active={value === "spanish"}
          onClick={() => onChange("spanish")}
        >
          Spanish
        </OptionButton>
      </div>
    </div>
  );
}
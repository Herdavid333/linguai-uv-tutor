"use client";

import { useState } from "react";
import OptionButton from "./OptionButton";

export default function LanguageSettingsPanel() {
  const [interfaceLanguage, setInterfaceLanguage] = useState("english");
  const [helpLanguage, setHelpLanguage] = useState("english");

  return (
    <div className="
      bg-[#e5e5e5] 
      px-4 py-4 
      shadow-md 
      min-h-[170px] 
      flex 
      flex-col 
      justify-evenly

      lg:min-h-[210px]
      lg:px-6
      lg:py-5
    ">
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
    <div className="
      flex 
      items-center 
      justify-between 
      gap-3
    ">
      <span className="
        font-semibold 
        text-black

        text-[14px]
        md:text-[15px]
        lg:text-[18px]
        xl:text-[20px]
      ">
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
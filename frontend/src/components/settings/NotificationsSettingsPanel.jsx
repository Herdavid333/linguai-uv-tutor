"use client";

import { useState } from "react";
import SettingSwitch from "./SettingSwitch";

export default function NotificationsSettingsPanel() {
  const [practiceReminders, setPracticeReminders] = useState(true);
  const [dailyGoalAlerts, setDailyGoalAlerts] = useState(true);

  return (
    <div className="bg-[#9d9d9d] px-4 py-4 shadow-md border border-gray-500 min-h-[170px] flex flex-col justify-evenly">
      <SettingSwitch
        label="Practice reminders"
        value={practiceReminders}
        onChange={setPracticeReminders}
      />

      <SettingSwitch
        label="Daily goal alerts"
        value={dailyGoalAlerts}
        onChange={setDailyGoalAlerts}
      />
    </div>
  );
}
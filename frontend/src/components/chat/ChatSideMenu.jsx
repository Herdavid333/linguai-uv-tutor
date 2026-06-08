"use client";

import Link from "next/link";
import { useState } from "react";
import { X, BarChart3, User } from "lucide-react";

import { activityTypes } from "../../data/learningContent";

export default function ChatSideMenu({
  isOpen,
  onClose,
  units = [],
  currentContext,
  onChangeContext,
}) {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  if (!isOpen) return null;

  const handleSelectTopic = (unit, topic) => {
    setSelectedUnit(unit);
    setSelectedTopic(topic);
    setShowActivityModal(true);
  };

  const handleSelectActivity = (group, activity) => {
    if (!selectedUnit || !selectedTopic || !activity) return;

    const newContext = {
      unitId: selectedUnit.id,
      unitTitle: selectedUnit.title,
      topicId: selectedTopic.id,
      topicTitle: selectedTopic.title,
      activityType: group.id,
      activityName: activity.name,
      activityDescription: activity.description || "",
    };

    onChangeContext?.(newContext);

    setShowActivityModal(false);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[2px]">
      <aside className="relative h-full w-[78%] max-w-[295px] bg-[#d9d9d9] shadow-lg border-r border-gray-400 flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-black">
          <div>
            <h2 className="text-[18px] font-extrabold text-red-600 leading-none">
              Units
            </h2>

            <p className="text-[13px] font-bold text-black leading-tight">
              Select a topic to practice
            </p>
          </div>

          <button
            onClick={onClose}
            className="
              rounded-full
              p-1
              text-red-600
              transition duration-100
              hover:text-red-700
              active:scale-90
              active:translate-y-[1px]
            "
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* UNIT LIST */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
          {units.map((unit) => {
            const isCurrentUnit = unit.id === currentContext?.unitId;

            return (
              <details
                key={unit.id}
                open={isCurrentUnit}
                className="mb-2 group"
              >
                <summary
                  className={`cursor-pointer text-[14px] font-extrabold leading-tight ${
                    isCurrentUnit ? "text-red-600" : "text-black"
                  }`}
                >
                  {unit.title}
                </summary>

                <div className="ml-4 mt-1 space-y-1">
                  {unit.topics?.map((topic) => {
                    const isCurrentTopic =
                      isCurrentUnit && topic.id === currentContext?.topicId;

                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => handleSelectTopic(unit, topic)}
                        className={`block w-full text-left text-[13px] font-semibold leading-tight transition duration-100 active:scale-[0.98] ${
                          isCurrentTopic
                            ? "text-red-600 underline"
                            : "text-black hover:text-red-600"
                        }`}
                      >
                        • {topic.title}
                        {isCurrentTopic && (
                          <span className="ml-1 text-[11px] font-extrabold">
                            current
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </details>
            );
          })}
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="grid grid-cols-2 gap-2 px-3 py-3">
          <Link
            href="/progress"
            className="
              flex items-center justify-center gap-1
              rounded-md bg-[#9d9d9d] px-2 py-2
              text-[13px] font-bold text-black
              shadow
              transition duration-100
              hover:bg-[#8c8c8c]
              active:scale-95
              active:translate-y-[1px]
            "
          >
            <BarChart3 size={20} />
            My progress
          </Link>

          <Link
            href="/profile"
            className="
              flex items-center justify-center gap-1
              rounded-md bg-[#9d9d9d] px-2 py-2
              text-[13px] font-bold text-black
              shadow
              transition duration-100
              hover:bg-[#8c8c8c]
              active:scale-95
              active:translate-y-[1px]
            "
          >
            <User size={20} />
            My profile
          </Link>
        </div>

        {/* ACTIVITY SELECTION MODAL */}
        {showActivityModal && selectedTopic && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 px-3">
            <div className="w-full max-h-[88%] overflow-y-auto rounded-md bg-white border-2 border-[#f3a3a3] p-3 shadow-lg">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-[16px] font-extrabold text-black">
                    Select activity
                  </h3>

                  <p className="text-[12px] font-bold text-red-600 leading-tight">
                    {selectedTopic.title}
                  </p>
                </div>

                <button
                  onClick={() => setShowActivityModal(false)}
                  className="
                    rounded-full
                    p-1
                    text-red-600
                    transition duration-100
                    hover:text-red-700
                    active:scale-90
                    active:translate-y-[1px]
                  "
                >
                  <X size={24} strokeWidth={3} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activityTypes.map((group) => (
                  <section
                    key={group.id}
                    className="rounded-md border border-gray-300 bg-white p-2"
                  >
                    <h4 className="mb-2 text-center text-[15px] font-extrabold text-red-600">
                      {group.name}
                    </h4>

                    <div className="space-y-2">
                      {group.activities.map((activity) => {
                        const isCurrentActivity =
                          selectedTopic.id === currentContext?.topicId &&
                          group.id === currentContext?.activityType &&
                          activity.name === currentContext?.activityName;

                        return (
                          <button
                            key={`${group.id}-${activity.name}`}
                            type="button"
                            onClick={() => handleSelectActivity(group, activity)}
                            className={`w-full rounded-md px-2 py-2 text-left shadow transition duration-100 active:scale-95 active:translate-y-[1px] ${
                              isCurrentActivity
                                ? "bg-red-600 text-white"
                                : "bg-[#ffb3b3] text-black hover:bg-red-200"
                            }`}
                          >
                            <p className="text-[13px] font-extrabold">
                              {activity.name}
                              {isCurrentActivity && " ✓"}
                            </p>

                            <p className="text-[11px] font-semibold leading-tight">
                              {activity.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
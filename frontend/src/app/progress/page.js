"use client";

import Link from "next/link";
import { useState } from "react";
import { Home, User, X } from "lucide-react";

import { mockCompletedActivities } from "../../data/mockCompletedActivities";
import { mockFrequentErrors } from "../../data/mockFrequentErrors";
import { mockVocabularyLearned } from "../../data/mockVocabularyLearned";

import ProgressUnitRow from "../../components/progress/ProgressUnitRow";
import FrequentErrorCard from "../../components/progress/FrequentErrorCard";
import VocabularyCard from "../../components/progress/VocabularyCard";

export default function ProgressPage() {
  const [activePanel, setActivePanel] = useState("progress");

  const activitiesCompleted = mockCompletedActivities.length;
  const averageProgress = 40;
  const wordsLearned = mockVocabularyLearned.length;
  const topicsPracticed = 5;

  return (
    <main className="min-h-screen bg-[#e6e6e6] flex justify-center px-4 py-6 overflow-hidden">
      <section className="w-full max-w-[390px] bg-white border-2 border-[#f3a3a3] rounded-[10px] shadow-md overflow-hidden flex flex-col">
        {/* HEADER */}
        <header className="shrink-0 bg-[#b8b8b8] border-b-4 border-white">
          <div className="grid grid-cols-[1fr_1px_1fr] items-center px-4 py-3">
            <div className="text-center">
              <h1 className="text-[30px] font-extrabold leading-none text-black">
                LINGUAI
              </h1>
              <p className="text-[20px] font-extrabold leading-none text-red-600">
                UV
              </p>
            </div>

            <div className="h-10 bg-white" />

            <p className="text-center text-[16px] font-bold leading-tight text-white">
              Univalle&apos;s AI tutor for learning English
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-hidden">
          {activePanel === "progress" && (
            <div>
              <section className="bg-[#b8b8b8] px-3 py-1">
                <h2 className="text-[20px] font-extrabold text-black">
                  Overall Progress
                </h2>
              </section>

              <section className="px-3 py-3">
                <div className="grid grid-cols-[1fr_1.4fr] gap-4">
                  <div>
                    <p className="text-[16px] font-semibold text-black">
                      {averageProgress}% completed
                    </p>

                    <div className="mt-1 h-4 rounded-full bg-[#9d9d9d] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-600"
                        style={{ width: `${averageProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[15px] font-semibold text-black leading-tight">
                    <p>Activities completed: {activitiesCompleted}</p>
                    <p>Words learned: {wordsLearned}</p>
                    <p>Topics practiced: {topicsPracticed}</p>
                  </div>
                </div>
              </section>

              <section className="bg-[#b8b8b8] px-3 py-1">
                <h2 className="text-[20px] font-extrabold text-black">
                  Progress by Units
                </h2>
              </section>

              <section className="px-3 py-3 space-y-2">
                {mockCompletedActivities.length > 0 ? (
                  mockCompletedActivities.map((activity) => (
                    <ProgressUnitRow
                      key={activity.id}
                      unitTitle={activity.unitTitle}
                      score={activity.score}
                    />
                  ))
                ) : (
                  <p className="text-center text-[14px] font-bold text-black">
                    No completed activities yet.
                  </p>
                )}
              </section>

              <section className="px-3 py-3 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setActivePanel("errors")}
                  className="rounded-md bg-red-600 px-3 py-2 text-[17px] font-extrabold text-white shadow transition-all duration-100 hover:bg-red-700 active:scale-95 active:translate-y-[2px]"
                >
                  Frequent Errors
                </button>

                <button
                  onClick={() => setActivePanel("vocabulary")}
                  className="rounded-md bg-red-600 px-3 py-2 text-[17px] font-extrabold text-white shadow transition-all duration-100 hover:bg-red-700 active:scale-95 active:translate-y-[2px]"
                >
                  Vocabulary Learned
                </button>
              </section>

              <section className="bg-[#b8b8b8] px-3 py-1">
                <h2 className="text-[20px] font-extrabold text-black">
                  Recent Practice Session
                </h2>
              </section>

              <section className="px-3 py-3">
                <div className="grid grid-cols-[1fr_auto] gap-3 items-center">
                  <div>
                    <ProgressUnitRow
                      unitTitle="Unit 1 - Presentations"
                      score={80}
                    />

                    <p className="mt-2 text-[15px] font-bold text-black">
                      - Introducing yourself
                    </p>

                    <p className="text-center text-[14px] font-bold text-black">
                      [ Conversation ]
                    </p>
                  </div>

                  <button className="rounded-md bg-red-600 px-3 py-2 text-[14px] font-bold text-white shadow transition-all duration-100 hover:bg-red-700 active:scale-95 active:translate-y-[2px]">
                    Practice again
                  </button>
                </div>
              </section>
            </div>
          )}

          {activePanel === "errors" && (
            <div>
              <PanelHeader
                title="Frequent Errors"
                onClose={() => setActivePanel("progress")}
              />

              <div className="px-3 py-2 text-center border-b border-black">
                <p className="text-[13px] font-extrabold text-black underline">
                  Understand your most common errors
                </p>
              </div>

              <div className="max-h-[430px] overflow-y-auto px-3">
                {mockFrequentErrors.map((error) => (
                  <div key={error.id}>
                    <h3 className="text-center text-[16px] font-extrabold text-black">
                      {error.category}
                    </h3>

                    <FrequentErrorCard {...error} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === "vocabulary" && (
            <div>
              <PanelHeader
                title="Vocabulary Learned"
                onClose={() => setActivePanel("progress")}
              />

              <div className="px-3 py-2 text-center border-b border-black">
                <p className="text-[15px] font-extrabold text-black">
                  Review your learned words
                </p>
              </div>

              <div className="max-h-[430px] overflow-y-auto px-4">
                {mockVocabularyLearned.map((word) => (
                  <VocabularyCard key={word.id} {...word} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAV */}
        <nav className="border-t border-black bg-[#b8b8b8] px-4 py-2 shrink-0">
          <div className="grid grid-cols-[1fr_2px_1fr] items-center text-center">
            <Link
              href="/home"
              className="flex flex-col items-center gap-1 text-black hover:scale-[1.1] active:scale-95 active:translate-y-[2px] rounded-md py-1"
            >
              <Home size={34} className="fill-black" />
              <span className="text-[15px] font-bold">Home</span>
            </Link>

            <div className="h-full bg-white" />

            <Link
              href="/profile"
              className="flex flex-col items-center gap-1 text-black hover:scale-[1.1] active:scale-95 active:translate-y-[2px] rounded-md py-1"
            >
              <User size={34} className="fill-black" />
              <span className="text-[15px] font-bold">My Profile</span>
            </Link>
          </div>
        </nav>
      </section>
    </main>
  );
}

function PanelHeader({ title, onClose }) {
  return (
    <section className="relative bg-[#b8b8b8] px-3 py-1 border-b border-black">
      <h2 className="text-center text-[20px] font-extrabold text-black">
        {title}
      </h2>

      <button
        onClick={onClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-black p-[2px] transition active:scale-90"
      >
        <X size={16} />
      </button>
    </section>
  );
}
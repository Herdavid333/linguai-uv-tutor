"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, User, X } from "lucide-react";

import { mockCompletedActivities } from "../../data/mockCompletedActivities";
import { mockFrequentErrors } from "../../data/mockFrequentErrors";
import { mockVocabularyLearned } from "../../data/mockVocabularyLearned";

import ProgressUnitRow from "../../components/progress/ProgressUnitRow";
import FrequentErrorCard from "../../components/progress/FrequentErrorCard";
import VocabularyCard from "../../components/progress/VocabularyCard";

import { useAuth } from "../../context/AuthContext";
import { getUserPracticeHistory } from "../../services/practiceHistoryService";
import ActivityHistoryCard from "../../components/progress/ActivityHistoryCard";
import {
  calculateProgressStats,
  calculateUnitProgress,
} from "../../utils/progressCalculations";

import { learningUnits } from "../../data/learningContent";

export default function ProgressPage() {
  const [activePanel, setActivePanel] = useState("progress");

  const { user } = useAuth();
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    activitiesCompleted,
    practiceSessions,
    topicsLearned,
    learningStreak,
  } = calculateProgressStats(practiceHistory);

  const unitProgress = calculateUnitProgress(practiceHistory, learningUnits);

  const averageProgress =
    unitProgress.length > 0
      ? Math.round(
          unitProgress.reduce((sum, unit) => sum + unit.score, 0) /
            unitProgress.length
        )
      : 0;

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.uid) return;

      try {
        setLoadingHistory(true);
        const history = await getUserPracticeHistory(user.uid);
        setPracticeHistory(history);
      } catch (error) {
        console.error("Error loading practice history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user?.uid]);

  return (
    <main className="min-h-screen bg-[#e6e6e6] flex justify-center px-4 py-6 overflow-hidden">
      <section className="w-full max-w-[390px] h-[calc(100vh-48px)] bg-white border-2 border-[#f3a3a3] rounded-[10px] shadow-md overflow-hidden flex flex-col">
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
        <div className="flex-1 min-h-0 overflow-hidden">
          {activePanel === "progress" && (
            <div className="h-full min-h-0 flex flex-col">

              {/* OVERALL PROGRESS */}
              <section className="shrink-0 bg-[#b8b8b8] px-3 py-1 border-t border-white">
                <h2 className="text-[18px] font-extrabold text-black">
                  Overall Progress
                </h2>
              </section>

              <section className="shrink-0 px-3 py-2">
                <div className="grid grid-cols-[1fr_1.45fr] gap-3 items-start">
                  <div>
                    <p className="text-[16px] font-bold text-black">
                      {averageProgress}% completed
                    </p>

                    <div className="mt-1 h-3.5 rounded-full bg-[#9d9d9d] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-600"
                        style={{ width: `${averageProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-[15px] font-bold text-black leading-[1.15]">
                    <p>
                      <span className="font-extrabold text-red-600">
                        Activities completed:
                      </span>{" "}
                      {activitiesCompleted}
                    </p>

                    <p>
                      <span className="font-extrabold text-red-600">
                        Topics learned:
                      </span>{" "}
                      {topicsLearned}
                    </p>

                    <p>
                      <span className="font-extrabold text-red-600">
                        Practice sessions:
                      </span>{" "}
                      {practiceSessions}
                    </p>
                  </div>
                </div>

                {/* Learning Streak */}
                <div className="mt-2 text-center">
                  <p className="text-[16px] font-extrabold text-black">
                   Learning streak 🔥 {learningStreak} days  🔥 
                  </p>
                </div>
              </section>

              {/* PROGRESS BY UNITS */}
              <section className="shrink-0 bg-[#b8b8b8] px-3 py-1">
                <h2 className="text-[18px] font-extrabold text-black">
                  Progress by Units
                </h2>
              </section>

              <section className="shrink-0 px-3 py-2">
                <div className="max-h-[110px] overflow-y-auto pr-1 space-y-3">
                  {unitProgress.map((unit) => (
                    <ProgressUnitRow
                      key={unit.id}
                      unitTitle={unit.unitTitle}
                      score={unit.score}
                    />
                  ))}
                </div>
              </section>

              <div className="mx-3 border-t-2 border-black" />

              {/* ACTION BUTTONS */}
              <section className="shrink-0 px-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActivePanel("errors")}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-[15px] font-extrabold text-white shadow transition-all duration-100 hover:bg-red-700 active:scale-95 active:translate-y-[2px]"
                  >
                    Frequent
                    <br />
                    Errors
                  </button>

                  <button
                    onClick={() => setActivePanel("vocabulary")}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-[15px] font-extrabold text-white shadow transition-all duration-100 hover:bg-red-700 active:scale-95 active:translate-y-[2px]"
                  >
                    Vocabulary
                    <br />
                    Learned
                  </button>
                </div>

                <button
                  onClick={() => setActivePanel("history")}
                  className="mt-2 w-full rounded-md bg-red-600 px-3 py-1.5 text-[15px] font-extrabold text-white shadow transition-all duration-100 hover:bg-red-700 active:scale-95 active:translate-y-[2px]"
                >
                  Activity History
                </button>
              </section>


              {/* RECENT SESSION */}
              <section className="shrink-0 bg-[#b8b8b8] px-3 py-1">
                <h2 className="text-[17px] font-extrabold text-black">
                  Recent Practice Session
                </h2>
              </section>

              <section className="flex-1 min-h-0 px-3 py-3">
                <div className="space-y-2 text-[15px] font-bold text-black leading-[1.15]">
                  <div className="space-y-1">
                    <div className="grid grid-cols-[1fr_auto] items-start gap-2">
                      <div>
                        <p className="font-extrabold text-red-600">
                          Unit 1 :
                        </p>

                        <p className=" font-extrabold text-red-600">
                          Greetings and Introductions
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-3 w-[80px] rounded-full bg-[#9d9d9d] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-600"
                            style={{ width: "80%" }}
                          />
                        </div>

                        <span className="text-[15px] font-bold">
                          80%
                        </span>
                      </div>
                    </div>

                    <p className="pl-12">
                      <span className="font-extrabold text-red-600">
                        Topic:
                      </span>{" "}
                      <span className="font-semibold text-black">
                        Introducing yourself
                      </span>
                    </p>

                    <p className="pl-24">
                      <span className="font-extrabold text-red-600">
                        Activity:
                      </span>{" "}
                      <span className="font-semibold text-black">
                        Conversation
                      </span>
                    </p>
                  </div>

                  <button className="mx-auto mt-1 block rounded-md bg-red-600 px-4 py-1.5 text-[15px] font-bold text-white shadow transition-all duration-100 hover:bg-red-700 active:scale-95 active:translate-y-[2px]">
                    Practice again
                  </button>
                </div>
              </section>
            </div>
          )}

          {activePanel === "errors" && (
            <div className="h-full min-h-0 flex flex-col">
              <PanelHeader
                title="Frequent Errors"
                onClose={() => setActivePanel("progress")}
              />

              <div className="shrink-0 px-3 py-2 text-center border-b border-black">
                <p className="text-[16px] font-extrabold text-black underline">
                  Understand your most common errors
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
                {mockFrequentErrors.map((error) => (
                  <div key={error.id}>
                    <h3 className="sticky top-0 bg-white py-1 text-center text-[18px] font-extrabold text-black">
                      {error.category}
                    </h3>

                    <FrequentErrorCard {...error} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePanel === "vocabulary" && (
            <div className="h-full min-h-0 flex flex-col">
              <PanelHeader
                title="Vocabulary Learned"
                onClose={() => setActivePanel("progress")}
              />

              <div className="shrink-0 px-3 py-2 text-center border-b border-black">
                <p className="text-[18px] font-extrabold text-black">
                  Review your learned words
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3">
                {mockVocabularyLearned.map((word) => (
                  <VocabularyCard key={word.id} {...word} />
                ))}
              </div>
            </div>
          )}

          {activePanel === "history" && (
            <div className="h-full min-h-0 flex flex-col">
              <PanelHeader
                title="Activity History"
                onClose={() => setActivePanel("progress")}
              />

              <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3">
                {loadingHistory ? (
                  <p className="text-center text-[14px] font-bold text-black">
                    Loading activity history...
                  </p>
                ) : practiceHistory.length === 0 ? (
                  <p className="text-center text-[14px] font-bold text-black">
                    No practice sessions registered yet.
                  </p>
                ) : (
                  practiceHistory.map((activity) => (
                    <ActivityHistoryCard
                      key={activity.id}
                      activity={activity}
                    />
                  ))
                )}
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
        className="
          absolute right-2 top-1 
          rounded-full
          p-1
          text-red-600
          transition duration-100
          active:scale-90
          active:translate-y-[1px]
          hover:text-red-700
        "
      >
        <X size={24} strokeWidth={3} />
      </button>
    </section>
  );
}
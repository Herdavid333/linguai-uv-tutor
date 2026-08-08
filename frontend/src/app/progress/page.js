"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Home, User, X } from "lucide-react";


import ProgressUnitRow from "../../components/progress/ProgressUnitRow";
import FrequentErrorCard from "../../components/progress/FrequentErrorCard";
import ActivityHistoryCard from "../../components/progress/ActivityHistoryCard";
import VocabularyCard from "../../components/progress/VocabularyCard";

import { useAuth } from "../../context/AuthContext";

import {
  getUserPracticeHistory,
} from "../../services/practiceHistoryService";

import {
  calculateProgressStats,
  calculateUnitProgress,
  calculateOverallProgress,
  calculateVocabularyStats,
  calculatePerformanceStats,
  calculateFrequentErrors,
} from "../../utils/progressCalculations";

import { learningUnits } from "../../data/learningContent";

/**
 * Convierte las fechas de Firestore, strings o Date
 * en un timestamp numérico que permita ordenar las prácticas.
 */
const getPracticeTimestamp = (practice) => {
  const dateValue =
    practice?.completedAt ??
    practice?.updatedAt ??
    practice?.startedAt;

  if (!dateValue) {
    return 0;
  }

  if (typeof dateValue?.toDate === "function") {
    return dateValue.toDate().getTime();
  }

  if (dateValue instanceof Date) {
    return dateValue.getTime();
  }

  const convertedDate = new Date(dateValue);

  return Number.isNaN(convertedDate.getTime())
    ? 0
    : convertedDate.getTime();
};


export default function ProgressPage() {
  const [activePanel, setActivePanel] =
    useState("progress");

  const [practiceHistory, setPracticeHistory] =
    useState([]);

  const [loadingHistory, setLoadingHistory] =
    useState(false);

  const { user } = useAuth();

  /*
   * Estadísticas generales calculadas desde practiceHistory.
   */
  const progressStats = useMemo(() => {
    return calculateProgressStats(
      practiceHistory
    );
  }, [practiceHistory]);

  /*
   * Progreso individual de cada unidad.
   */
  const unitProgress = useMemo(() => {
    return calculateUnitProgress(
      practiceHistory,
      learningUnits
    );
  }, [practiceHistory]);

  /*
   * Progreso general del curso.
   */
  const overallProgress = useMemo(() => {
    return calculateOverallProgress(
      practiceHistory,
      learningUnits
    );
  }, [practiceHistory]);

  /*
   * Vocabulario aprendido sin duplicados.
   */
  const vocabularyStats = useMemo(() => {
    return calculateVocabularyStats(
      practiceHistory
    );
  }, [practiceHistory]);

  const vocabularyColumns =
    useMemo(() => {
      const leftColumn = [];
      const rightColumn = [];

      vocabularyStats.words.forEach(
        (item, index) => {
          if (index % 2 === 0) {
            leftColumn.push(item);
          } else {
            rightColumn.push(item);
          }
        }
      );

      return {
        leftColumn,
        rightColumn,
      };
    }, [vocabularyStats.words]);

  const performanceStats = useMemo(() => {
    return calculatePerformanceStats(
      practiceHistory
    );
  }, [practiceHistory]);

  const frequentErrors = useMemo(() => {
    return calculateFrequentErrors(
      practiceHistory
    );
  }, [practiceHistory]);

  const frequentErrorColumns =
    useMemo(() => {
      const leftColumn = [];
      const rightColumn = [];

      frequentErrors.forEach(
        (group, index) => {
          if (index % 2 === 0) {
            leftColumn.push(group);
          } else {
            rightColumn.push(group);
          }
        }
      );

      return {
        leftColumn,
        rightColumn,
      };
    }, [frequentErrors]);

  /*
   * Historial ordenado desde la práctica más reciente.
   */
  const sortedPracticeHistory = useMemo(() => {
    return [...practiceHistory].sort(
      (firstPractice, secondPractice) =>
        getPracticeTimestamp(secondPractice) -
        getPracticeTimestamp(firstPractice)
    );
  }, [practiceHistory]);


  const activityHistoryColumns =
    useMemo(() => {
      const leftColumn = [];
      const rightColumn = [];

      sortedPracticeHistory.forEach(
        (activity, index) => {
          if (index % 2 === 0) {
            leftColumn.push(activity);
          } else {
            rightColumn.push(activity);
          }
        }
      );

      return {
        leftColumn,
        rightColumn,
      };
    }, [sortedPracticeHistory]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user?.uid) {
        setPracticeHistory([]);
        return;
      }

      try {
        setLoadingHistory(true);

        const history =
          await getUserPracticeHistory(
            user.uid
          );

        setPracticeHistory(
          Array.isArray(history)
            ? history
            : []
        );
      } catch (error) {
        console.error(
          "Error loading practice history:",
          error
        );

        setPracticeHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [user?.uid]);

  return (
    <main className="flex min-h-screen justify-center overflow-hidden bg-[#e6e6e6] px-2 py-2 sm:px-4 sm:py-4">
      <section className="flex h-[calc(100vh-16px)] sm:h-[calc(100vh-32px)] w-full max-w-[390px] flex-col overflow-hidden rounded-[10px] border-2 border-[#f3a3a3] bg-white shadow-md sm:max-w-[600px] md:max-w-[820px] lg:max-w-[980px]">
        {/* HEADER */}
        <header className="shrink-0 border-b-4 border-white bg-[#b8b8b8]">
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
              Univalle&apos;s AI tutor for
              learning English
            </p>
          </div>
        </header>

        {/* CONTENT */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {activePanel === "progress" && (
            <div className="h-full min-h-0 overflow-y-auto overscroll-contain">
              {/* OVERALL PROGRESS */}
              <section className="shrink-0 border-t border-white bg-[#b8b8b8] px-3 py-1">
                <h2 className="text-[18px] font-extrabold text-black">
                  Overall Progress
                </h2>
              </section>

              <section className="px-3 py-3 sm:px-4">
                {loadingHistory ? (
                  <p className="py-3 text-center text-[14px] font-bold text-black">
                    Loading progress...
                  </p>
                ) : (
                  <div
                    className="
                      grid
                      grid-cols-1
                      gap-3
                      sm:grid-cols-2
                      lg:grid-cols-3
                    "
                  >
                    {/* OVERALL COMPLETION */}
                    <article
                      className="
                        rounded-lg
                        border border-gray-200
                        bg-[#fafafa]
                        p-3
                        shadow-sm
                      "
                    >
                      <p className="text-[16px] font-extrabold text-black">
                        {overallProgress}% completed
                      </p>

                      <div className="mt-2 h-3.5 overflow-hidden rounded-full bg-[#9d9d9d]">
                        <div
                          className="h-full rounded-full bg-red-600 transition-[width] duration-500"
                          style={{
                            width: `${overallProgress}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-[12px] font-semibold text-gray-600">
                        Average score:{" "}
                        {progressStats.averageScore ??
                          "N/A"}
                      </p>
                    </article>

                    {/* STATISTICS */}
                    <article
                      className="
                        rounded-lg
                        border border-gray-200
                        bg-[#fafafa]
                        p-3
                        text-[14px]
                        font-bold
                        leading-relaxed
                        text-black
                        shadow-sm
                      "
                    >
                      <p>
                        <span className="font-extrabold text-red-600">
                          Activities completed:
                        </span>{" "}
                        {
                          progressStats.activitiesCompleted
                        }
                      </p>

                      <p>
                        <span className="font-extrabold text-red-600">
                          Topics learned:
                        </span>{" "}
                        {
                          progressStats.topicsLearned
                        }
                      </p>

                      <p>
                        <span className="font-extrabold text-red-600">
                          Practice sessions:
                        </span>{" "}
                        {
                          progressStats.practiceSessions
                        }
                      </p>
                    </article>

                    {/* LEARNING STREAK */}
                    <article
                      className="
                        flex
                        min-h-[80px]
                        items-center
                        justify-center
                        rounded-lg
                        border border-gray-200
                        bg-[#fafafa]
                        p-3
                        text-center
                        shadow-sm

                        sm:col-span-2
                        lg:col-span-1
                      "
                    >
                      <p className="text-[16px] font-extrabold text-black">
                        Learning streak 🔥{" "}
                        {
                          progressStats.learningStreak
                        }{" "}
                        {progressStats.learningStreak ===
                        1
                          ? "day"
                          : "days"}
                      </p>
                    </article>
                  </div>
                )}
              </section>
              {/* =========================================================
                  PROGRESS DETAILS
              ========================================================= */}
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  px-3
                  py-3
                  sm:px-4
                  lg:grid-cols-[1.15fr_0.85fr]
                  lg:items-start
                "
              >
                {/* =====================================================
                    PROGRESS BY UNITS
                ====================================================== */}
                <section
                  className="
                    flex
                    max-h-[420px]
                    min-h-[420px]
                    flex-col
                    overflow-hidden
                    rounded-lg
                    border border-gray-200
                    bg-white
                    shadow-sm
                  "
                >
                  <div className="shrink-0 bg-[#b8b8b8] px-3 py-1.5">
                    <h2 className="text-[18px] font-extrabold text-black">
                      Progress by Units
                    </h2>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pr-2">
                    {unitProgress.length === 0 ? (
                      <p className="py-4 text-center text-[13px] font-bold text-gray-600">
                        No units available.
                      </p>
                    ) : (
                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-3
                          md:grid-cols-2
                          lg:grid-cols-1
                        "
                      >
                        {unitProgress.map(
                          (unit) => (
                            <article
                              key={unit.id}
                              className="
                                rounded-lg
                                border border-gray-200
                                bg-[#fafafa]
                                p-3
                              "
                            >
                              <ProgressUnitRow
                                unitTitle={
                                  unit.unitTitle
                                }
                                score={
                                  unit.progress
                                }
                              />

                              <div className="mt-2 flex justify-between gap-3 text-[11px] font-semibold text-gray-600">
                                <span>
                                  {
                                    unit.practicedTopics
                                  }{" "}
                                  of{" "}
                                  {
                                    unit.totalTopics
                                  }{" "}
                                  topics
                                </span>

                                <span className="whitespace-nowrap">
                                  Average:{" "}
                                  {unit.averageScore ??
                                    "N/A"}
                                </span>
                              </div>
                            </article>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </section>

                <div className="flex flex-col gap-3">
                  {/* =====================================================
                      PERFORMANCE
                  ====================================================== */}
                  <section
                    className="
                      overflow-hidden
                      rounded-lg
                      border border-gray-200
                      bg-white
                      shadow-sm
                    "
                  >
                    <div className="flex items-center justify-between bg-[#b8b8b8] px-3 py-1.5">
                      <h2 className="text-[18px] font-extrabold text-black">
                        Performance
                      </h2>

                      {performanceStats.overallPerformance !==
                        null && (
                        <span className="text-[13px] font-extrabold text-red-600">
                          Overall:{" "}
                          {
                            performanceStats.overallPerformance
                          }
                          %
                        </span>
                      )}
                    </div>

                    <div className="p-3">
                      {loadingHistory ? (
                        <p className="py-4 text-center text-[14px] font-bold text-black">
                          Loading performance...
                        </p>
                      ) : !performanceStats.hasPerformanceData ? (
                        <div className="flex min-h-[150px] flex-col items-center justify-center px-4 text-center">
                          <p className="text-[15px] font-extrabold text-black">
                            No performance results yet
                          </p>

                          <p className="mt-2 text-[13px] font-semibold leading-snug text-gray-600">
                            Complete a practice with
                            enough interactions to unlock
                            your performance results.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <PerformanceRow
                            label="Accuracy"
                            value={performanceStats.accuracy}
                          />

                          <PerformanceRow
                            label="Grammar"
                            value={performanceStats.grammar}
                          />

                          <PerformanceRow
                            label="Vocabulary"
                            value={performanceStats.vocabulary}
                          />

                          <PerformanceRow
                            label="Interaction"
                            value={performanceStats.interaction}
                          />

                          <p className="pt-2 text-center text-[11px] font-semibold text-gray-500">
                            Based on{" "}
                            {performanceStats.evaluatedPractices}{" "}
                            {performanceStats.evaluatedPractices === 1
                              ? "evaluated practice"
                              : "evaluated practices"}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* ACTION BUTTONS - DESKTOP */}
                  <section className="hidden lg:block">
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setActivePanel("errors")
                        }
                        className="
                          min-h-[48px]
                          rounded-md
                          bg-red-600
                          px-3 py-2
                          text-[15px]
                          font-extrabold
                          text-white
                          shadow
                          transition-all
                          duration-100
                          hover:bg-red-700
                          active:translate-y-[2px]
                          active:scale-95
                        "
                      >
                        Frequent Errors
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActivePanel("vocabulary")
                        }
                        className="
                          min-h-[48px]
                          rounded-md
                          bg-red-600
                          px-3 py-2
                          text-[15px]
                          font-extrabold
                          text-white
                          shadow
                          transition-all
                          duration-100
                          hover:bg-red-700
                          active:translate-y-[2px]
                          active:scale-95
                        "
                      >
                        Vocabulary Learned
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setActivePanel("history")
                        }
                        className="
                          min-h-[48px]
                          rounded-md
                          bg-red-600
                          px-3 py-2
                          text-[15px]
                          font-extrabold
                          text-white
                          shadow
                          transition-all
                          duration-100
                          hover:bg-red-700
                          active:translate-y-[2px]
                          active:scale-95
                        "
                      >
                        Activity History
                      </button>
                    </div>
                  </section>
                </div>
              </div>    

              <section className="px-3 pb-3 sm:px-4 lg:hidden">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel("errors")
                    }
                    className="
                      min-h-[50px]
                      rounded-md
                      bg-red-600
                      px-3 py-2
                      text-[15px]
                      font-extrabold
                      text-white
                      shadow
                      transition-all
                      hover:bg-red-700
                      active:scale-95
                    "
                  >
                    Frequent Errors
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel("vocabulary")
                    }
                    className="
                      min-h-[50px]
                      rounded-md
                      bg-red-600
                      px-3 py-2
                      text-[15px]
                      font-extrabold
                      text-white
                      shadow
                      transition-all
                      hover:bg-red-700
                      active:scale-95
                    "
                  >
                    Vocabulary Learned
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActivePanel("history")
                    }
                    className="
                      col-span-2
                      min-h-[50px]
                      rounded-md
                      bg-red-600
                      px-3 py-2
                      text-[15px]
                      font-extrabold
                      text-white
                      shadow
                      transition-all
                      hover:bg-red-700
                      active:scale-95
                    "
                  >
                    Activity History
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* FREQUENT ERRORS */}
          {activePanel === "errors" && (
            <div className="flex h-full min-h-0 flex-col">
              <PanelHeader
                title="Frequent Errors"
                onClose={() =>
                  setActivePanel("progress")
                }
              />

              <div className="shrink-0 border-b border-black px-3 py-2 text-center">
                <p className="text-[16px] font-extrabold text-black underline">
                  Understand your most common errors
                </p>
              </div>

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                  px-4
                  py-3
                "
              >
                {loadingHistory ? (
                  <p className="py-5 text-center text-[14px] font-bold text-black">
                    Loading frequent errors...
                  </p>
                ) : frequentErrors.length === 0 ? (
                  <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
                    <p className="text-[15px] font-extrabold text-black">
                      No frequent errors yet
                    </p>

                    <p className="mt-2 text-[13px] font-semibold leading-snug text-gray-600">
                      Your corrections will appear here as you continue practicing.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* MOBILE */}
                    <div className="space-y-3 sm:hidden">
                      {frequentErrors.map(
                        (group) => (
                          <FrequentErrorGroupCard
                            key={group.category}
                            group={group}
                          />
                        )
                      )}
                    </div>

                    {/* TABLET / DESKTOP */}
                    <div
                      className="
                        hidden
                        grid-cols-2
                        gap-3
                        sm:grid
                        sm:items-start
                      "
                    >
                      <div className="space-y-3">
                        {frequentErrorColumns.leftColumn.map(
                          (group) => (
                            <FrequentErrorGroupCard
                              key={group.category}
                              group={group}
                            />
                          )
                        )}
                      </div>

                      <div className="space-y-3">
                        {frequentErrorColumns.rightColumn.map(
                          (group) => (
                            <FrequentErrorGroupCard
                              key={group.category}
                              group={group}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* VOCABULARY */}
          {activePanel === "vocabulary" && (
            <div className="flex h-full min-h-0 flex-col">
              <PanelHeader
                title="Vocabulary Learned"
                onClose={() =>
                  setActivePanel("progress")
                }
              />

              <div className="shrink-0 border-b border-black px-3 py-2 text-center">
                <p className="text-[18px] font-extrabold text-black">
                  Review your learned words
                </p>

                <p className="mt-1 text-[12px] font-semibold text-gray-600">
                  {vocabularyStats.totalWords}{" "}
                  {vocabularyStats.totalWords === 1
                    ? "word learned"
                    : "words learned"}
                </p>
              </div>

              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overscroll-contain
                  px-4
                  py-3
                "
              >
                {vocabularyStats.words.length === 0 ? (
                  <p className="py-5 text-center text-[14px] font-bold text-gray-600">
                    No vocabulary has been registered yet.
                  </p>
                ) : (
                  <>
                    {/* MOBILE */}
                    <div className="space-y-3 sm:hidden">
                      {vocabularyStats.words.map(
                        (item, index) => {
                          const word =
                            item?.word ??
                            item?.term ??
                            "Word";

                          const meaning =
                            item?.meaning ??
                            item?.definition ??
                            item?.translation ??
                            "";

                          const example =
                            item?.example ??
                            item?.exampleSentence ??
                            "";

                          return (
                            <VocabularyCard
                              key={`${word}-${index}`}
                              word={word}
                              meaning={
                                meaning ||
                                "Meaning unavailable"
                              }
                              example={
                                example ||
                                "No example registered."
                              }
                              unit={
                                item?.unitTitle ||
                                item?.topicTitle ||
                                ""
                              }
                              occurrences={
                                item?.occurrences || 1
                              }
                            />
                          );
                        }
                      )}
                    </div>

                    {/* TABLET / DESKTOP */}
                    <div
                      className="
                        hidden
                        grid-cols-2
                        gap-3
                        sm:grid
                        sm:items-start
                      "
                    >
                      {/* LEFT COLUMN */}
                      <div className="space-y-3">
                        {vocabularyColumns.leftColumn.map(
                          (item, index) => {
                            const word =
                              item?.word ??
                              item?.term ??
                              "Word";

                            const meaning =
                              item?.meaning ??
                              item?.definition ??
                              item?.translation ??
                              "";

                            const example =
                              item?.example ??
                              item?.exampleSentence ??
                              "";

                            return (
                              <VocabularyCard
                                key={`left-${word}-${index}`}
                                word={word}
                                meaning={
                                  meaning ||
                                  "Meaning unavailable"
                                }
                                example={
                                  example ||
                                  "No example registered."
                                }
                                unit={
                                  item?.unitTitle ||
                                  item?.topicTitle ||
                                  ""
                                }
                                occurrences={
                                  item?.occurrences || 1
                                }
                              />
                            );
                          }
                        )}
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="space-y-3">
                        {vocabularyColumns.rightColumn.map(
                          (item, index) => {
                            const word =
                              item?.word ??
                              item?.term ??
                              "Word";

                            const meaning =
                              item?.meaning ??
                              item?.definition ??
                              item?.translation ??
                              "";

                            const example =
                              item?.example ??
                              item?.exampleSentence ??
                              "";

                            return (
                              <VocabularyCard
                                key={`right-${word}-${index}`}
                                word={word}
                                meaning={
                                  meaning ||
                                  "Meaning unavailable"
                                }
                                example={
                                  example ||
                                  "No example registered."
                                }
                                unit={
                                  item?.unitTitle ||
                                  item?.topicTitle ||
                                  ""
                                }
                                occurrences={
                                  item?.occurrences || 1
                                }
                              />
                            );
                          }
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ACTIVITY HISTORY */}
          {activePanel === "history" && (
            <div className="min-h-0 flex h-full flex-col overflow-y-auto px-4 py-3">
              <PanelHeader
                title="Activity History"
                onClose={() =>
                  setActivePanel("progress")
                }
              />

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                {loadingHistory ? (
                  <p className="text-center text-[14px] font-bold text-black">
                    Loading activity history...
                  </p>
                ) : sortedPracticeHistory.length ===
                  0 ? (
                  <p className="text-center text-[14px] font-bold text-black">
                    No practice sessions registered
                    yet.
                  </p>
                ) : (
                  <>
                    {/* MOBILE */}
                    <div className="space-y-3 sm:hidden">
                      {sortedPracticeHistory.map(
                        (activity) => (
                          <ActivityHistoryCard
                            key={activity.id}
                            activity={activity}
                          />
                        )
                      )}
                    </div>

                    {/* TABLET / DESKTOP */}
                    <div
                      className="
                        hidden
                        grid-cols-2
                        gap-3
                        sm:grid
                        sm:items-start
                      "
                    >
                      {/* LEFT COLUMN */}
                      <div className="space-y-3">
                        {activityHistoryColumns.leftColumn.map(
                          (activity) => (
                            <ActivityHistoryCard
                              key={activity.id}
                              activity={activity}
                            />
                          )
                        )}
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="space-y-3">
                        {activityHistoryColumns.rightColumn.map(
                          (activity) => (
                            <ActivityHistoryCard
                              key={activity.id}
                              activity={activity}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAV */}
        <nav className="shrink-0 border-t border-black bg-[#b8b8b8] px-4 py-2">
          <div className="grid grid-cols-[1fr_2px_1fr] items-center text-center">
            <Link
              href="/home"
              className="flex flex-col items-center gap-1 rounded-md py-1 text-black hover:scale-[1.1] active:translate-y-[2px] active:scale-95"
            >
              <Home
                size={34}
                className="fill-black"
              />

              <span className="text-[15px] font-bold">
                Home
              </span>
            </Link>

            <div className="h-full bg-white" />

            <Link
              href="/profile"
              className="flex flex-col items-center gap-1 rounded-md py-1 text-black hover:scale-[1.1] active:translate-y-[2px] active:scale-95"
            >
              <User
                size={34}
                className="fill-black"
              />

              <span className="text-[15px] font-bold">
                My Profile
              </span>
            </Link>
          </div>
        </nav>
      </section>
    </main>
  );
}


function PerformanceRow({
  label,
  value,
}) {
  const hasValue =
    Number.isFinite(
      Number(value)
    );

  const normalizedValue =
    hasValue
      ? Math.min(
          100,
          Math.max(
            0,
            Number(value)
          )
        )
      : 0;

  return (
    <div
      className="
        grid
        grid-cols-[88px_minmax(0,1fr)_42px]
        items-center
        gap-3
      "
    >
      <span className="text-[13px] font-extrabold text-black sm:text-[14px]">
        {label}
      </span>

      <div
        className="
          h-3
          w-full
          max-w-[230px]
          overflow-hidden
          rounded-full
          bg-[#9d9d9d]
        "
      >
        <div
          className="
            h-full
            rounded-full
            bg-red-600
            transition-[width]
            duration-500
            ease-out
          "
          style={{
            width: `${normalizedValue}%`,
          }}
        />
      </div>

      <span
        className={`
          text-right
          text-[13px]
          font-extrabold
          sm:text-[14px]
          ${
            hasValue
              ? "text-red-600"
              : "text-gray-500"
          }
        `}
      >
        {hasValue
          ? `${Math.round(
              normalizedValue
            )}%`
          : "N/A"}
      </span>
    </div>
  );
}

function PanelHeader({
  title,
  onClose,
}) {
  return (
    <section className="relative border-b border-black bg-[#b8b8b8] px-3 py-1">
      <h2 className="text-center text-[20px] font-extrabold text-black">
        {title}
      </h2>

      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${title}`}
        className="absolute right-2 top-1 rounded-full p-1 text-red-600 transition duration-100 hover:text-red-700 active:translate-y-[1px] active:scale-90"
      >
        <X
          size={24}
          strokeWidth={3}
        />
      </button>
    </section>
  );
}

function FrequentErrorGroupCard({
  group,
}) {
  return (
    <section
      className="
        overflow-hidden
        rounded-md
        bg-[#d9d9d9]
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          bg-red-600
          px-3
          py-2
        "
      >
        <h3 className="text-[17px] font-extrabold text-white">
          {group.category}
        </h3>

        <span
          className="
            rounded-full
            bg-white
            px-2
            py-1
            text-[11px]
            font-extrabold
            text-red-600
          "
        >
          {group.totalOccurrences}{" "}
          {group.totalOccurrences === 1
            ? "occurrence"
            : "occurrences"}
        </span>
      </div>

      <div className="px-3">
        {group.errors.map(
          (error) => (
            <FrequentErrorCard
              key={error.id}
              {...error}
            />
          )
        )}
      </div>
    </section>
  );
}
"use client";

import {
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Sparkles,
  Target,
} from "lucide-react";

export default function PracticeReviewPanel({
  isOpen,
  onClose,

  context = {},

  corrections = [],
  newWords = [],
  grammarStructures = [],

  feedback = null,
  nextSuggestion = "",
  latestScore = null,

  messages = [],
}) {
  if (!isOpen) {
    return null;
  }

  const normalizedCorrections =
    Array.isArray(corrections)
      ? corrections
      : [];

  const normalizedWords =
    Array.isArray(newWords)
      ? newWords
      : [];

  const normalizedGrammar =
    Array.isArray(
      grammarStructures
    )
      ? grammarStructures
      : [];

  const normalizedMessages =
    Array.isArray(messages)
      ? messages
      : [];

  const studentMessagesCount =
    normalizedMessages.filter(
      (message) =>
        message?.role === "user"
    ).length;

  const assistantMessagesCount =
    normalizedMessages.filter(
      (message) =>
        message?.role ===
        "assistant"
    ).length;

  const numericScore =
    Number(latestScore);

  const hasScore =
    Number.isFinite(
      numericScore
    );

  const normalizedScore =
    hasScore
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              numericScore
            )
          )
        )
      : null;

  const normalizedFeedback =
    feedback &&
    typeof feedback === "object"
      ? feedback
      : {};

  const strengths =
    Array.isArray(
      normalizedFeedback.strengths
    )
      ? normalizedFeedback.strengths
      : [];

  const improvements =
    Array.isArray(
      normalizedFeedback.improvements
    )
      ? normalizedFeedback.improvements
      : [];

  const overallFeedback =
    typeof normalizedFeedback.overall ===
    "string"
      ? normalizedFeedback.overall.trim()
      : "";

  const hasFeedback =
    Boolean(
      overallFeedback ||
      strengths.length > 0 ||
      improvements.length > 0 ||
      nextSuggestion
    );

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50
        px-3 py-4
        backdrop-blur-[2px]
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="practice-review-title"
    >
      <section
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-[860px]
          flex-col
          overflow-hidden
          rounded-2xl
          border border-gray-300
          bg-[#f4f4f4]
          shadow-2xl
        "
      >
        {/* =====================================================
            ENCABEZADO FIJO
        ====================================================== */}
        <header
          className="
            shrink-0
            border-b border-gray-300
            bg-[#b8b8b8]
            px-5 py-4
          "
        >
          <h2
            id="practice-review-title"
            className="
              text-center
              text-[28px]
              font-extrabold
              leading-tight
              text-black
              sm:text-[32px]
            "
          >
            Practice Review
          </h2>
        </header>

        {/* =====================================================
            ÚNICO CONTENEDOR CON SCROLL
        ====================================================== */}
        <div
          className="
            min-h-0 flex-1
            overflow-y-auto
            overscroll-contain
            px-3 py-4
            sm:px-5
            md:px-6
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
            "
          >
            {/* =================================================
                PRACTICE OVERVIEW
            ================================================== */}
            <SummaryCard
              title=" Overview"
              icon={
                <BookOpen
                  size={24}
                />
              }
              className="md:col-span-2"
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-3
                "
              >
                <OverviewItem
                  label="Topic"
                  value={
                    context?.topicTitle ||
                    "Not available"
                  }
                />

                <OverviewItem
                  label="Activity"
                  value={
                    context?.activityName ||
                    context?.activityType ||
                    "Not available"
                  }
                />

                <OverviewItem
                  label="Current score"
                  value={
                    normalizedScore !== null
                      ? `${normalizedScore}%`
                      : "Not available"
                  }
                  highlighted={
                    normalizedScore !== null
                  }
                />
              </div>

              <div
                className="
                  mt-3
                  ml-2
                  grid
                  grid-cols-3
                  gap-1
                  border-t border-gray-200
                  pt-3
                  text-[14px]
                  font-semibold
                  text-gray-600
                  sm:grid-cols-4.5
                "
              >
                <p>
                  <span className="font-extrabold text-black">
                    Student responses:
                  </span>{" "}
                  {studentMessagesCount}
                </p>

                <p>
                  <span className="font-extrabold text-black">
                    Tutor responses:
                  </span>{" "}
                  {assistantMessagesCount}
                </p>

                <p>
                  <span className="font-extrabold text-black">
                    Total messages:
                  </span>{" "}
                  {normalizedMessages.length}
                </p>
              </div>
            </SummaryCard>

            {/* =================================================
                CORRECTIONS
            ================================================== */}
            <SummaryCard
              title="Corrections"
              icon={
                <CheckCircle2
                  size={21}
                />
              }
            >
              {normalizedCorrections.length >
              0 ? (
                <div className="space-y-4">
                  {normalizedCorrections.map(
                    (item, index) => {
                      const correctionType =
                        formatCorrectionType(
                          item?.type
                        );

                      return (
                        <article
                          key={`${item?.wrong}-${item?.correct}-${index}`}
                          className="
                            rounded-xl
                            border border-gray-200
                            bg-[#fafafa]
                            p-3
                          "
                        >
                          <div
                            className="
                              mb-2 flex
                              flex-wrap
                              items-center
                              justify-between
                              gap-2
                            "
                          >
                            <span
                              className="
                                rounded-full
                                bg-red-100
                                px-2 py-1
                                text-[11px]
                                font-extrabold
                                text-red-700
                              "
                            >
                              {
                                correctionType
                              }
                            </span>

                            {Number(
                              item
                                ?.occurrences
                            ) > 1 && (
                              <span
                                className="
                                  rounded-full
                                  bg-gray-200
                                  px-2 py-1
                                  text-[11px]
                                  font-bold
                                  text-gray-700
                                "
                              >
                                Seen{" "}
                                {
                                  item.occurrences
                                }{" "}
                                times
                              </span>
                            )}
                          </div>

                          <div
                            className="
                              space-y-1
                              text-[14px]
                              leading-snug
                              text-black
                            "
                          >
                            <p>
                              <span
                                className="
                                  mr-1
                                  font-extrabold
                                  text-red-600
                                "
                              >
                                ✕
                              </span>

                              {item?.wrong ||
                                "Not available"}
                            </p>

                            <p>
                              <span
                                className="
                                  mr-1
                                  font-extrabold
                                  text-green-600
                                "
                              >
                                ✓
                              </span>

                              {item?.correct ||
                                "Not available"}
                            </p>
                          </div>

                          {item?.explanation && (
                            <p
                              className="
                                mt-3
                                border-t
                                border-gray-200
                                pt-3
                                text-[13px]
                                font-medium
                                leading-relaxed
                                text-gray-700
                              "
                            >
                              <span className="font-extrabold text-black">
                                Why?{" "}
                              </span>

                              {
                                item.explanation
                              }
                            </p>
                          )}
                        </article>
                      );
                    }
                  )}
                </div>
              ) : (
                <EmptyState
                  text="No corrections have been registered in this practice yet."
                />
              )}
            </SummaryCard>

            {/* =================================================
                VOCABULARY
            ================================================== */}
            <SummaryCard
              title="Vocabulary"
              icon={
                <MessageCircle
                  size={21}
                />
              }
            >
              {normalizedWords.length >
              0 ? (
                <div className="space-y-3">
                  {normalizedWords.map(
                    (item, index) => {
                      const word =
                        item?.word ||
                        item?.term ||
                        "Word";

                      const meaning =
                        item?.meaning ||
                        item
                          ?.definition ||
                        "";

                      const example =
                        item?.example ||
                        item
                          ?.exampleSentence ||
                        "";

                      return (
                        <article
                          key={`${word}-${index}`}
                          className="
                            rounded-xl
                            border border-gray-200
                            bg-[#fafafa]
                            p-3
                          "
                        >
                          <h4
                            className="
                              text-[16px]
                              font-extrabold
                              text-red-600
                            "
                          >
                            {word}
                          </h4>

                          {meaning && (
                            <div className="mt-2">
                              <p
                                className="
                                  text-[11px]
                                  font-extrabold
                                  uppercase
                                  tracking-wide
                                  text-gray-500
                                "
                              >
                                Meaning
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-[13px]
                                  font-medium
                                  leading-relaxed
                                  text-black
                                "
                              >
                                {meaning}
                              </p>
                            </div>
                          )}

                          {example && (
                            <div className="mt-3">
                              <p
                                className="
                                  text-[11px]
                                  font-extrabold
                                  uppercase
                                  tracking-wide
                                  text-gray-500
                                "
                              >
                                Example
                              </p>

                              <p
                                className="
                                  mt-0.5
                                  text-[13px]
                                  italic
                                  leading-relaxed
                                  text-gray-700
                                "
                              >
                                {example}
                              </p>
                            </div>
                          )}
                        </article>
                      );
                    }
                  )}
                </div>
              ) : (
                <EmptyState
                  text="No vocabulary has been registered in this practice yet."
                />
              )}
            </SummaryCard>

            {/* =================================================
                GRAMMAR
            ================================================== */}
            <SummaryCard
              title="Grammar"
              icon={
                <Target
                  size={21}
                />
              }
            >
              {normalizedGrammar.length >
              0 ? (
                <div className="space-y-3">
                  {normalizedGrammar.map(
                    (
                      structure,
                      index
                    ) => {
                      const normalizedStructure =
                        typeof structure ===
                        "string"
                          ? {
                              structure,
                              explanation:
                                "",
                              example:
                                "",
                            }
                          : structure ||
                            {};

                      return (
                        <article
                          key={`${normalizedStructure?.structure}-${index}`}
                          className="
                            rounded-xl
                            border border-gray-200
                            bg-[#fafafa]
                            p-3
                          "
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className="
                                mt-[8px]
                                h-2 w-2
                                shrink-0
                                rounded-full
                                bg-red-600
                              "
                            />

                            <div>
                              <h4
                                className="
                                  text-[15px]
                                  font-extrabold
                                  text-black
                                "
                              >
                                {normalizedStructure?.structure ||
                                  normalizedStructure?.name ||
                                  "Grammar structure"}
                              </h4>

                              {normalizedStructure?.explanation && (
                                <p
                                  className="
                                    mt-2
                                    text-[13px]
                                    font-medium
                                    leading-relaxed
                                    text-gray-700
                                  "
                                >
                                  {
                                    normalizedStructure.explanation
                                  }
                                </p>
                              )}

                              {normalizedStructure?.example && (
                                <p
                                  className="
                                    mt-2
                                    text-[13px]
                                    italic
                                    leading-relaxed
                                    text-gray-600
                                  "
                                >
                                  <span className="font-bold not-italic text-gray-700">
                                    Example:{" "}
                                  </span>

                                  {
                                    normalizedStructure.example
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              ) : (
                <EmptyState
                  text="No grammar structures have been registered in this practice yet."
                />
              )}
            </SummaryCard>

            {/* =================================================
                PERSONALIZED FEEDBACK
            ================================================== */}
            <SummaryCard
              title="Personalized Feedback"
              icon={
                <Sparkles
                  size={21}
                />
              }
            >
              {hasFeedback ? (
                <div className="space-y-4">
                  {overallFeedback && (
                    <FeedbackBlock
                      title="Tutor feedback"
                      text={
                        overallFeedback
                      }
                    />
                  )}

                  {strengths.length >
                    0 && (
                    <FeedbackList
                      title="What you did well"
                      items={
                        strengths
                      }
                      symbol="✓"
                    />
                  )}

                  {improvements.length >
                    0 && (
                    <FeedbackList
                      title="What to improve"
                      items={
                        improvements
                      }
                      symbol="•"
                    />
                  )}

                  {nextSuggestion && (
                    <div
                      className="
                        rounded-xl
                        border border-red-200
                        bg-red-50
                        p-3
                      "
                    >
                      <p
                        className="
                          text-[12px]
                          font-extrabold
                          uppercase
                          tracking-wide
                          text-red-700
                        "
                      >
                        Recommended next step
                      </p>

                      <p
                        className="
                          mt-1
                          text-[13px]
                          font-semibold
                          leading-relaxed
                          text-gray-800
                        "
                      >
                        {
                          nextSuggestion
                        }
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  text="Personalized feedback will appear after the tutor evaluates your responses."
                />
              )}
            </SummaryCard>
          </div>
        </div>

        {/* =====================================================
            PIE FIJO
        ====================================================== */}
        <footer
          className="
            shrink-0
            border-t border-gray-300
            bg-white
            px-4 py-3
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              rounded-lg
              bg-red-600
              px-4 py-2.5
              text-[20px]
              font-extrabold
              text-white
              shadow
              transition-all
              hover:bg-red-700
              active:scale-[0.98]
              sm:text-[20px]
            "
          >
            Back to Practice
          </button>
        </footer>
      </section>
    </div>
  );
}

function SummaryCard({
  title,
  icon,
  children,
  className = "",
}) {
  return (
    <section
      className={`
        rounded-2xl
        border border-gray-200
        bg-white
        p-4
        shadow-sm
        ${className}
      `}
    >
      <div
        className="
          mb-4 flex
          items-center gap-2
          border-b border-gray-200
          pb-3
          text-red-600
        "
      >
        {icon}

        <h3
          className="
            text-[18px]
            font-extrabold
            text-black
          "
        >
          {title}
        </h3>
      </div>

      {children}
    </section>
  );
}

function OverviewItem({
  label,
  value,
  highlighted = false,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-gray-200
        bg-[#fafafa]
        p-3
      "
    >
      <p
        className="
          text-[11px]
          font-extrabold
          uppercase
          tracking-wide
          text-gray-500
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-[14px]
          font-extrabold
          leading-snug
          ${
            highlighted
              ? "text-red-600"
              : "text-black"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

function FeedbackBlock({
  title,
  text,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-gray-200
        bg-[#fafafa]
        p-3
      "
    >
      <p
        className="
          text-[12px]
          font-extrabold
          text-black
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-[13px]
          font-medium
          leading-relaxed
          text-gray-700
        "
      >
        {text}
      </p>
    </div>
  );
}

function FeedbackList({
  title,
  items = [],
  symbol,
}) {
  return (
    <div>
      <p
        className="
          mb-2
          text-[13px]
          font-extrabold
          text-black
        "
      >
        {title}
      </p>

      <ul className="space-y-2">
        {items.map(
          (item, index) => (
            <li
              key={`${item}-${index}`}
              className="
                flex items-start
                gap-2
                text-[13px]
                font-medium
                leading-relaxed
                text-gray-700
              "
            >
              <span
                className="
                  mt-[1px]
                  font-extrabold
                  text-red-600
                "
              >
                {symbol}
              </span>

              <span>{item}</span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function EmptyState({
  text,
}) {
  return (
    <div
      className="
        flex min-h-[90px]
        items-center justify-center
        rounded-xl
        border border-dashed
        border-gray-300
        bg-[#fafafa]
        px-4 py-5
        text-center
      "
    >
      <p
        className="
          text-[13px]
          font-semibold
          leading-relaxed
          text-gray-500
        "
      >
        {text}
      </p>
    </div>
  );
}

function formatCorrectionType(
  type
) {
  if (
    typeof type !== "string"
  ) {
    return "Correction";
  }

  const normalizedType =
    type
      .trim()
      .toLowerCase();

  const labels = {
    grammar: "Grammar",
    vocabulary: "Vocabulary",
    spelling: "Spelling",
    capitalization:
      "Capitalization",
    coherence: "Coherence",
    word_order: "Word Order",
    other: "Correction",
  };

  return (
    labels[normalizedType] ||
    "Correction"
  );
}
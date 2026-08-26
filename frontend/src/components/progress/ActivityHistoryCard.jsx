const parseDate = (value) => {
  if (!value) {
    return null;
  }

  if (
    typeof value?.toDate ===
    "function"
  ) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  const convertedDate =
    new Date(value);

  return Number.isNaN(
    convertedDate.getTime()
  )
    ? null
    : convertedDate;
};

const formatPracticeDate = (
  activity
) => {
  const dateValue =
    activity?.completedAt ??
    activity?.updatedAt ??
    activity?.startedAt;

  const date =
    parseDate(dateValue);

  if (!date) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
};

const getActivityStatus = (
  activity
) => {
  if (
    activity?.status ===
      "completed" &&
    activity?.evaluationStatus ===
      "evaluated"
  ) {
    return "Completed";
  }

  if (
    activity?.status ===
      "completed" &&
    activity?.evaluationStatus ===
      "insufficient"
  ) {
    return "Completed — Not enough evidence";
  }

  return "In progress";
};

const getActivityResult = (
  activity
) => {
  const finalScore = Number(
    activity?.finalScore
  );

  if (
    activity?.status ===
      "completed" &&
    activity?.evaluationStatus ===
      "evaluated" &&
    Number.isFinite(finalScore)
  ) {
    return {
      label: "Final result",
      value: `${Math.round(
        finalScore
      )}%`,
    };
  }

  if (
    activity?.evaluationStatus ===
    "insufficient"
  ) {
    return {
      label: "Result",
      value:
        "Not enough evidence",
    };
  }

  const latestScore = Number(
    activity?.latestScore
  );

  if (
    activity?.status ===
      "in_progress" &&
    Number.isFinite(latestScore)
  ) {
    return {
      label: "Partial score",
      value: `${Math.round(
        latestScore
      )}%`,
    };

  
  }

  return {
    label: "Result",
    value: "In progress",
  };
};

export default function ActivityHistoryCard({
  activity,
}) {
  const activityDate =
    formatPracticeDate(activity);

  const status =
    getActivityStatus(activity);

  const result =
    getActivityResult(activity);

  const meaningfulInteractions =
    Number(
      activity?.meaningfulInteractionsCount
    );

  const studentMessages =
    Number(
      activity?.studentMessagesCount
    );

  const interactionCount =
    Number.isFinite(
      meaningfulInteractions
    )
      ? meaningfulInteractions
      : Number.isFinite(studentMessages)
        ? studentMessages
        : 0;

  const isEvaluated =
    activity?.status ===
      "completed" &&
    activity?.evaluationStatus ===
      "evaluated";

  const performance =
    activity?.performance &&
    typeof activity.performance ===
      "object"
      ? activity.performance
      : null;

  return (
    <article className="
      rounded-md 
      bg-[#d9d9d9] 
      px-3 py-3 
      shadow-sm
    ">
      <p className="
        font-extrabold 
        text-red-600
        text-right

        text-[13px]
        md:text-[14px]
        lg:text-[17px]
      ">
        {activityDate}
      </p>

      <h3 className="
        mt-2
        font-extrabold 
        leading-tight 
        text-black

        text-[13px]
        md:text-[14px]
        lg:text-[20px]
      ">
        {activity?.unitTitle ||
          "Unit unavailable"}
      </h3>

      <p className="
        mt-1 
        font-bold 
        leading-tight 
        text-black

        text-[13px]
        md:text-[14px]
        lg:text-[18px]
      ">
        <span className="
        font-extrabold text-red-600">
          Topic:
        </span>{" "}
        {activity?.topicTitle ||
          "Not available"}
      </p>

      <p className="
        mt-1 
        font-bold 
        leading-tight 
        text-black

        text-[13px]
        md:text-[14px]
        lg:text-[18px]
      ">
        <span className="
        font-extrabold text-red-600">
          Activity:
        </span>{" "}
        {activity?.activityName ||
          activity?.activityType ||
          "Not available"}
      </p>

      <p className="mt-1 
          font-bold 
          leading-tight 
          text-black

          text-[13px]
          md:text-[14px]
          lg:text-[18px]
        ">
        <span className="font-extrabold text-red-600">
          Status:
        </span>{" "}
        {status}
      </p>

      <p className="
          mt-1 
          font-bold 
          leading-tight 
          text-black

          text-[13px]
          md:text-[14px]
          lg:text-[18px]
        ">
        <span className="font-extrabold text-red-600">
          {result.label}:
        </span>{" "}
        {result.value}
      </p>

      <p className="
          mt-1 
          font-bold 
          leading-tight 
          text-black

          text-[13px]
          md:text-[14px]
          lg:text-[18px]
        ">
        <span className="font-extrabold text-red-600">
          Meaningful interactions:
        </span>{" "}
        {interactionCount}
      </p>

      {isEvaluated &&
        performance && (
          <div className="
          mt-3 border-t border-gray-500 pt-2">
            <p className="
              mb-1 
              font-extrabold 
              text-black

              text-[13px]
              md:text-[14px]
              lg:text-[18px]
            ">
              Performance
            </p>

            <div className="
              grid 
              grid-cols-2 
              gap-x-3 gap-y-1 
              font-semibold 
              text-black
              
              text-[13px]
              md:text-[14px]
              lg:text-[18px]
            ">
              <MetricValue
                label="Accuracy"
                value={
                  performance.accuracy
                }
              />

              <MetricValue
                label="Grammar"
                value={
                  performance.grammar
                }
              />

              <MetricValue
                label="Vocabulary"
                value={
                  performance.vocabulary
                }
              />

              <MetricValue
                label="Interaction"
                value={
                  performance.interaction
                }
              />
            </div>
          </div>
        )}
    </article>
  );
}

function MetricValue({
  label,
  value,
}) {
  const numericValue =
    Number(value);

  const hasValue =
    Number.isFinite(
      numericValue
    );

  return (
    <p>
      <span className="font-extrabold text-red-600">
        {label}:
      </span>{" "}
      {hasValue
        ? `${Math.round(
            numericValue
          )}%`
        : "N/A"}
    </p>
  );
}
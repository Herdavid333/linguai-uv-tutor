export default function ActivityHistoryCard({ activity }) {
  const formattedDate = activity.startedAt?.toDate
    ? activity.startedAt.toDate().toLocaleString()
    : "Date not available";

  return (
    <div className="rounded-md bg-[#d9d9d9] p-3 text-[13px] font-bold text-black shadow">
      <p className="font-extrabold text-red-600">{formattedDate}</p>

      <p className="mt-1 font-extrabold text-black">
        {activity.unitTitle}
      </p>

      <p>
        <span className="font-extrabold text-red-600">Topic:</span>{" "}
        <span className="font-semibold text-black">
          {activity.topicTitle}
        </span>
      </p>

      <p>
        <span className="font-extrabold text-red-600">Activity:</span>{" "}
        <span className="font-semibold text-black">
          {activity.activityName}
        </span>
      </p>

      <p>
        <span className="font-extrabold text-red-600">Result:</span>{" "}
        <span className="font-semibold text-black">
          {activity.score ?? 0}%
        </span>
      </p>
    </div>
  );
}
"use client";

export default function TopicModal({ unit, onClose, onSelectTopic }) {
  if (!unit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-[520px] rounded-lg border-2 border-[#f3a3a3] bg-white shadow-lg">
        <div className="bg-[#b8b8b8] px-5 py-4 text-center">
          <h2 className="text-[25px] font-extrabold text-black">
            {unit.shortTitle}
          </h2>
          <p className="text-[25px] font-bold text-red-600">{unit.title}</p>
        </div>

        <div className="px-5 py-5">
          <p className="mb-4 text-center text-[20px] font-semibold text-black">
            Select a topic to continue
          </p>

          <div className="space-y-3">
            {unit.topics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="w-full rounded-md bg-[#ffb3b3] px-4 py-3 text-left transition hover:bg-[#ff9f9f]"
              >
                <p className="text-[20px] font-bold text-red-600">{topic.title}</p>
                <p className="text-[16px]  text-black">
                  {topic.description}
                </p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-md bg-red-600 py-2 text-[20px] font-bold text-white hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
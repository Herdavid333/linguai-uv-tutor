"use client";

import { activityTypes } from "../../data/learningContent";

export default function ActivityModal({
  unit,
  topic,
  onClose,
  onBack,
  onSelectActivity,
}) {
  if (!unit || !topic) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[95vh] w-800 max-w-[850px] overflow-y-auto rounded-lg border-2 border-[#f3a3a3] bg-white shadow-lg">
        
        <div className="bg-[#b8b8b8] px-5 py-4 text-center">
            
          <h2 className="text-[28px] font-extrabold text-black">
            Select Activity
          </h2>
          <p className="text-[25px] font-bold text-red-600">
            {unit.shortTitle} - {topic.title}
          </p>  

        </div>

        <div className="flex justify-between items-center mb-4">
            <button
                onClick={onBack}
                className="mt-5 ml-5 text-[20px] font-bold text-red-600 hover:underline"
            >
                ⬅ Back to topics
            </button>
        </div>
    
        <div className="px-5 py-5">
          <p className="mb-4 -mt-5 text-center text-[20px] font-semibold text-black">
            Choose the activity type and exercise you want to practice
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activityTypes.map((type) => (
              <div
                key={type.id}
                className="rounded-md border border-gray-300 bg-gray-50 p-3"
              >
                <h3 className="mb-3 text-center text-[22px] font-extrabold text-red-600">
                  {type.name}
                </h3>

                <div className="space-y-2">
                  {type.activities.map((activity) => (
                    <button
                      key={activity.name}
                      onClick={() =>
                        onSelectActivity({
                          type: type.name,
                          name: activity.name,
                          description: activity.description,
                        })
                      }
                      className="w-full rounded-md bg-[#ffb3b3] px-3 py-2 text-left hover:bg-[#ff9f9f]"
                    >
                      <p className="text-[20px] font-bold text-red-600">
                        {activity.name}
                      </p>
                      <p className="text-[16px] font-semibold text-black">
                        {activity.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
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
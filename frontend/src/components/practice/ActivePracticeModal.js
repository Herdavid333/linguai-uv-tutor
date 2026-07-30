"use client";

export default function ActivePracticeModal({
  isOpen,
  activePractice,
  isProcessing = false,
  onContinue,
  onAbandon,
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-black/50 px-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="active-practice-title"
      onClick={isProcessing ? undefined : onClose}
    >
      <div
        className="
          w-full max-w-md
          rounded-xl bg-white
          p-6 shadow-xl
        "
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h2
          id="active-practice-title"
          className="
            mb-3 text-xl font-bold
            text-gray-900
          "
        >
          Practice in progress
        </h2>

        <p className="mb-2 text-gray-700">
          You already have a practice in progress.
        </p>

        {activePractice && (
          <div
            className="
              mb-5 rounded-lg
              bg-gray-100 p-3
            "
          >
            <p className="font-bold text-gray-900">
              {activePractice.topicTitle ||
                activePractice.unitTitle ||
                "Current practice"}
            </p>

            <p className="text-sm text-gray-600">
              {activePractice.activityName ||
                activePractice.activityType ||
                ""}
            </p>
          </div>
        )}

        <p className="mb-5 text-sm text-gray-600">
          Would you like to continue your current practice or
          abandon it and start a new one?
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onContinue}
            disabled={
              isProcessing ||
              !activePractice?.id
            }
            className="
              rounded-lg bg-gray-900
              px-4 py-2 font-bold
              text-white transition
              hover:bg-gray-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Continue current practice
          </button>

          <button
            type="button"
            onClick={onAbandon}
            disabled={
              isProcessing ||
              !activePractice?.id
            }
            className="
              rounded-lg bg-red-600
              px-4 py-2 font-bold
              text-white transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isProcessing
              ? "Processing..."
              : "Abandon and start new"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="
              rounded-lg border
              border-gray-300
              px-4 py-2 font-semibold
              text-gray-700 transition
              hover:bg-gray-100
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
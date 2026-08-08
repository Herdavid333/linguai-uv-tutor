import {
  Mic,
  Send,
} from "lucide-react";

export default function ChatFooter({
  inputRef,
  inputMessage,
  onInputChange,
  onSubmit,
  showPracticeReview,
  onTogglePracticeReview,
  onFinishPractice,
  isAssistantTyping,
  isFinishingPractice,
  hasPracticeHistory,
}) {
  const isInteractionDisabled =
    isAssistantTyping ||
    isFinishingPractice;

  return (
    <div className="shrink-0 bg-[#eeeeee] px-3 py-2">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={
            onTogglePracticeReview
          }
          disabled={
            isFinishingPractice
          }
          className={`
            flex-1 rounded-md
            px-3 py-2
            text-[13px] sm:text-[14px]
            font-extrabold text-white
            shadow transition-all
            duration-100
            hover:scale-[1.01]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
            ${
              showPracticeReview
                ? "bg-[#e53935] hover:bg-red-700"
                : "bg-[#8f8f8f] hover:bg-red-700"
            }
          `}
        >
          Practice Review
        </button>

        <button
          type="button"
          onClick={
            onFinishPractice
          }
          disabled={
            isInteractionDisabled ||
            !hasPracticeHistory
          }
          className="
            flex-1 rounded-md
            bg-red-600
            px-3 py-2
            text-[13px] sm:text-[14px]
            font-extrabold text-white
            shadow transition-all
            duration-100
            hover:bg-red-700
            hover:scale-[1.01]
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isFinishingPractice
            ? "Finishing..."
            : "Finish practice"}
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="
          flex items-center gap-2
          rounded-full
          bg-[#d9d9d9]
          px-3 py-2
        "
      >
        <button
          type="button"
          disabled={
            isInteractionDisabled
          }
          className="
            flex h-8 w-8
            items-center justify-center
            rounded-full bg-black
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Mic
            size={18}
            className="text-white"
          />
        </button>

        <input
          ref={inputRef}
          value={inputMessage}
          onChange={onInputChange}
          disabled={
            isInteractionDisabled
          }
          placeholder="Type a message here"
          className="
            flex-1 bg-transparent
            text-[14px] font-semibold
            text-black outline-none
            placeholder:text-gray-600
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

        <button
          type="submit"
          disabled={
            isInteractionDisabled ||
            !inputMessage.trim()
          }
          className="
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <Send
            size={22}
            className="text-black"
          />
        </button>
      </form>
    </div>
  );
}
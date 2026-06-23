export default function FrequentErrorCard({
  wrong,
  correct,
  explanation,
  repeated,
}) {
  return (
    <div className="border-b border-black py-3 text-[15px] text-black">
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="leading-tight">
          <p>
            <span className="font-extrabold text-red-600">✕</span> {wrong}
          </p>
          <p>
            <span className="font-extrabold text-green-600">✓</span> {correct}
          </p>
        </div>

        <p className="text-[14px] font-bold whitespace-nowrap text-red-600">
          Repeated: {repeated} times
        </p>
      </div>

      <p className="mt-1 leading-tight">
        <span className="font-extrabold">Explanation:</span> {explanation}
      </p>
    </div>
  );
}
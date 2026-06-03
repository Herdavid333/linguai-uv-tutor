export default function FrequentErrorCard({
  wrong,
  correct,
  explanation,
  repeated,
}) {
  return (
    <div className="border-b border-black py-2 text-[11px] text-black">
      <div className="flex justify-between gap-2">
        <div>
          <p>
            <span className="font-extrabold text-red-600">✕</span> {wrong}
          </p>
          <p>
            <span className="font-extrabold">✓</span> {correct}
          </p>
        </div>

        <p className="font-bold whitespace-nowrap">Repeated: {repeated} times</p>
      </div>

      <p>
        <span className="font-extrabold">Explanation:</span> {explanation}
      </p>
    </div>
  );
}
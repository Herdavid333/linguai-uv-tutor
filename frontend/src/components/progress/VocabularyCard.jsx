export default function VocabularyCard({ word, meaning, example, unit }) {
  return (
    <div className="border-b border-black py-4 text-[13px] text-black">
      <div className="flex justify-between gap-3">
        <p className="font-extrabold underline">{word}</p>

        <button className="text-[11px] font-extrabold text-red-600 hover:underline active:scale-95">
          Let&apos;s Practice it
        </button>
      </div>

      <p className="mt-1 leading-tight">
        <span className="font-extrabold">Meaning:</span> {meaning}
      </p>

      <p className="leading-tight">
        <span className="font-extrabold">Example:</span> {example}
      </p>

      <p className="font-bold leading-tight">{unit}</p>
    </div>
  );
}
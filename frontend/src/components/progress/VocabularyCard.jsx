export default function VocabularyCard({ word, meaning, example, unit }) {
  return (
    <div className="border-b border-black py-3 text-[12px] text-black">
      <div className="flex justify-between gap-2">
        <p className="font-extrabold underline">{word}</p>

        <button className="text-[10px] font-extrabold text-red-600 hover:underline active:scale-95">
          Let&apos;s Practice it
        </button>
      </div>

      <p>
        <span className="font-extrabold">Meaning:</span> {meaning}
      </p>

      <p>
        <span className="font-extrabold">Example:</span> {example}
      </p>

      <p className="font-bold">{unit}</p>
    </div>
  );
}
export default function VocabularyCard({ word, meaning, example, unit }) {
  return (
    <div className="border-b border-black py-4 text-[16px] text-black">
      <div className="flex justify-between gap-3">
        <p className="font-extrabold underline text-red-600">{word}</p>

        <button className="text-[14px] font-extrabold text-red-600 hover:underline active:scale-95">
          Let&apos;s Practice it
        </button>
      </div>

      <p className="mt-1 leading-tight text-[15px]">
        <span className="font-extrabold">Meaning:</span> {meaning}
      </p>

      <p className="leading-tight text-[15px]">
        <span className="font-extrabold">Example:</span> {example}
      </p>

      <p className="font-bold leading-tight">{unit}</p>
    </div>
  );
}
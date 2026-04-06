export default function AuthCheckbox({ name, checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-red-600 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 accent-red-600"
      />
      <span className="font-semibold">{label}</span>
    </label>
  );
}
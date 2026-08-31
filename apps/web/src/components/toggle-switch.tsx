export function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-notion-blue" : "bg-ink-black/20"
      }`}
      aria-pressed={checked}
      aria-label={checked ? "オン" : "オフ"}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-pure-white transition-transform duration-200 ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

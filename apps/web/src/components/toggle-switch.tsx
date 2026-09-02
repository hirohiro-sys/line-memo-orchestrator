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
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ${
        checked ? "bg-foreground" : "bg-border"
      }`}
      aria-pressed={checked}
      aria-label={checked ? "オン" : "オフ"}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-background transition-transform duration-150 ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

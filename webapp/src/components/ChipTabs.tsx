type ChipTabsProps<T extends string> = {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
};

export function ChipTabs<T extends string>({ value, options, onChange }: ChipTabsProps<T>) {
  return (
    <div className="chip-tabs" role="tablist">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={option.value === value ? 'chip-tabs__button is-active' : 'chip-tabs__button'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

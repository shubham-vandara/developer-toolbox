import { SegmentedControl } from "../common/SegmentedControl.jsx";

export function PageScope({ scope, id, label = "Apply to", onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <SegmentedControl
        label={label}
        value={scope.mode}
        onChange={(value) => {
          onChange?.();
          scope.setMode(value);
        }}
        options={[
          { value: "all", label: `All ${scope.pageCount} pages` },
          { value: "custom", label: "Selected pages" },
        ]}
        size="sm"
      />
      {scope.mode === "custom" && (
        <>
          <label htmlFor={id} className="sr-only">Pages</label>
          <input
            id={id}
            value={scope.text}
            onChange={(event) => {
              onChange?.();
              scope.setText(event.target.value);
            }}
            placeholder="e.g. 1, 3-5, 8-"
            spellCheck={false}
            aria-invalid={Boolean(scope.error) || undefined}
            className="h-9 rounded-md border border-input bg-surface px-3 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className={scope.error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
            {scope.error ?? `${scope.pages.length} page${scope.pages.length === 1 ? "" : "s"} selected`}
          </p>
        </>
      )}
    </div>
  );
}

import { MARKS, MARK_FOR } from "@/lib/stack-atlas-marks";

/** Brand mark with a styled lettermark fallback — never a broken image. */
export function Mark({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
  const key = MARK_FOR[name] ?? null;
  const mark = key ? MARKS[key] : undefined;
  const box = size === "md" ? "h-7 w-7" : "h-5 w-5";

  if (!mark) {
    const clean = name.replace(/[^A-Za-z0-9#+.]/g, " ").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    const initials = (parts.length > 1 ? parts[0][0] + parts[1][0] : clean.slice(0, 2)).toUpperCase();
    return (
      <span
        title={name}
        aria-hidden
        className={`${box} inline-flex shrink-0 items-center justify-center rounded border border-border bg-gold/10 font-display text-[0.55rem] font-semibold leading-none text-gold`}
      >
        {initials}
      </span>
    );
  }

  return (
    <span title={mark.title} aria-hidden className={`${box} inline-flex shrink-0 items-center justify-center`}>
      <svg viewBox="0 0 24 24" className="h-full w-full" fill={`#${mark.hex}`} role="img">
        <path d={mark.path} />
      </svg>
    </span>
  );
}

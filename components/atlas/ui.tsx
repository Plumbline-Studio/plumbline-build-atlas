"use client";

/** Minimal primitives matching the Console's shadcn look without the Radix
 * dependency tree. When these components are copied into the Console, swap
 * these imports for the real @/components/ui/* equivalents. */

export function Badge({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${className}`}
    >
      {children}
    </span>
  );
}

export function Button({
  onClick,
  children,
  variant = "solid",
  className = "",
  disabled,
  type = "button",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const styles =
    variant === "solid"
      ? "bg-gold text-navy font-semibold hover:bg-gold-bright"
      : variant === "outline"
        ? "border border-border text-foreground hover:border-gold"
        : "text-muted-foreground hover:text-foreground";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
        active
          ? "border-gold bg-gold/15 text-gold-bright font-medium"
          : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      {label ? <span className="kpi-label">{label}</span> : null}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-md border border-border bg-card px-2 text-sm text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-2 border-l-2 border-gold pl-2.5">{children}</p>;
}

export function toneClass(v: string): string {
  if (["Safe", "Low", "Current", "Mainstream", "Growing"].includes(v))
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (["Use with care", "Medium", "Niche", "Specialist", "Experimental"].includes(v))
    return "border-gold-bright/40 bg-gold-bright/10 text-gold-bright";
  if (["Avoid", "High", "Legacy", "Declining"].includes(v))
    return "border-rose-500/30 bg-rose-500/10 text-rose-400";
  return "border-border text-muted-foreground";
}

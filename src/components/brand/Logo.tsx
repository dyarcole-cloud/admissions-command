import { Mark } from "./Mark";

type LogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  href?: string;
};

const sizeMap = {
  sm: { mark: 28, type: "text-sm", spacing: "gap-2.5" },
  md: { mark: 36, type: "text-base", spacing: "gap-3" },
  lg: { mark: 56, type: "text-xl", spacing: "gap-4" },
} as const;

export function Logo({ size = "md", showWordmark = true }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className={`flex items-center ${s.spacing}`}>
      <Mark size={s.mark} />
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-display italic ${s.type} text-white`}
            style={{ fontVariationSettings: "'opsz' 36" }}
          >
            Admissions
          </span>
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--periwinkle)]"
            style={{ marginTop: -2 }}
          >
            Command
          </span>
        </div>
      )}
    </div>
  );
}

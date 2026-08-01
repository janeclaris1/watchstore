import { cn } from "@/lib/utils";

type BrandLogoProps = {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { height: 28, mark: 26, text: "text-[26px]" },
  md: { height: 34, mark: 32, text: "text-[32px]" },
  lg: { height: 44, mark: 42, text: "text-[42px]" },
};

function WatchMark({
  size,
  dark,
}: {
  size: number;
  dark?: boolean;
}) {
  const face = dark ? "#1A1A1A" : "#fff";
  const hands = dark ? "#fff" : "#1A1A1A";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="shrink-0 fill-current"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="22" y="2" width="20" height="10" rx="2.5" />
      <rect x="22" y="52" width="20" height="10" rx="2.5" />
      <path d="M20 12h8l-3 7h-5z" />
      <path d="M36 12h8v7h-5l-3-7z" />
      <path d="M20 45h5l3 7h-8z" />
      <path d="M39 45h5v7h-8l3-7z" />
      <circle cx="32" cy="32" r="18" />
      <rect x="49" y="27" width="5" height="10" rx="1.5" />
      <circle cx="32" cy="32" r="12" fill={face} />
      <path
        d="M32 32l-6-8"
        stroke={hands}
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M32 32l7-3"
        stroke={hands}
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="32" r="2" fill={hands} />
    </svg>
  );
}

/** Unified logo: CA + watch icon + Store - icon immediately after A. */
export function BrandLogo({
  variant = "light",
  size = "md",
  className,
}: BrandLogoProps) {
  const s = SIZES[size];
  const letter = variant === "dark" ? "text-white" : "text-wf-black";

  return (
    <span
      className={cn(
        "inline-flex items-center select-none font-playfair font-medium leading-none",
        letter,
        className
      )}
      style={{ height: s.height }}
    >
      <span
        className={cn("relative inline-block leading-none", s.text)}
        style={{ width: "1.38em", height: "1em" }}
        aria-hidden="true"
      >
        <span className="absolute left-0 top-0 leading-none">C</span>
        <span className="absolute top-0 leading-none" style={{ left: "0.66em" }}>
          A
        </span>
      </span>

      <WatchMark size={s.mark} dark={variant === "dark"} />

      <span
        className={cn("uppercase leading-none tracking-[-0.04em]", s.text)}
        aria-hidden="true"
      >
        Store
      </span>

      <span className="sr-only">COSY AURA WATCH STORE</span>
    </span>
  );
}

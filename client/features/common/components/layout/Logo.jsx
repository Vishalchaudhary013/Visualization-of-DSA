import { useId } from "react";

/**
 * The brand mark: a "play" button whose corners are graph nodes, on the
 * violet-to-blue brand gradient. The same drawing is client/public/favicon.svg.
 */
export function LogoMark({ className }) {
  // Gradient ids must be unique when the mark appears more than once
  const id = useId();
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id={`${id}-bg`}
          x1="2"
          y1="0"
          x2="30"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#8b5cf6" />
          <stop offset="0.55" stopColor="#5b33f8" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
        <linearGradient
          id={`${id}-shine`}
          x1="16"
          y1="0"
          x2="16"
          y2="16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${id}-bg)`} />
      <rect width="32" height="16" rx="8" fill={`url(#${id}-shine)`} />
      <path
        d="M11.5 8.5 24.5 16 11.5 23.5Z"
        fill="#fff"
        fillOpacity="0.16"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="11.5" cy="8.5" r="3" fill="#fff" />
      <circle cx="11.5" cy="23.5" r="3" fill="#fff" />
      <circle cx="24.5" cy="16" r="3" fill="#fff" />
      <circle cx="11.5" cy="8.5" r="1.2" fill="#5b33f8" />
      <circle cx="11.5" cy="23.5" r="1.2" fill="#5b33f8" />
      <circle cx="24.5" cy="16" r="1.4" fill="#22c55e" />
    </svg>
  );
}

/** Mark + "Algorithm Visualizer" wordmark (e.g. nameClassName="hidden lg:inline"). */
export function Logo({ className, nameClassName }) {
  return (
    <span
      className={`flex items-center gap-2.5 text-lg font-bold tracking-tight ${className ?? ""}`}
    >
      <LogoMark className="h-8 w-8 shrink-0 drop-shadow-sm" />
      <span className={nameClassName}>
        Algorithm{" "}
        <span className="bg-linear-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-blue-400">
          Visualizer
        </span>
      </span>
    </span>
  );
}

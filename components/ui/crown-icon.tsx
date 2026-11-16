import type { ComponentProps } from "react";

/**
 * Crown glyph, used to mark a team captain. Decorative by default (`aria-hidden`).
 * Inherits colour from `currentColor`.
 */
export function CrownIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d="M2.5 7.5 7.5 11 12 4l4.5 7 5-3.5L19.5 18h-15L2.5 7.5ZM4.5 19.5h15V21h-15v-1.5Z" />
    </svg>
  );
}

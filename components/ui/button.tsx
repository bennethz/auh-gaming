import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "dark" | "ghost";

const BASE_CLASS_NAME =
  "notch focus-notch inline-flex min-h-11 items-center justify-center px-[22px] pt-3 pb-[9px] font-display text-[19px] leading-none sm:text-[22px] disabled:cursor-not-allowed disabled:opacity-50";

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: "bg-auh-yellow text-auh-ink hover:bg-auh-yellow-hover",
  dark: "bg-auh-ink text-auh-yellow hover:bg-auh-ink-soft",
  ghost: "bg-transparent text-auh-ink shadow-[inset_0_0_0_2px_currentColor]",
};

/**
 * Returns the class string for a notched button in the given variant.
 * @param variant - Primary (yellow), dark (navy) or ghost (outline).
 * @param className - Extra classes, for example `w-full`.
 */
export function buttonClassName(variant: ButtonVariant = "primary", className?: string): string {
  return cn(BASE_CLASS_NAME, VARIANT_CLASS_NAMES[variant], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant };

/** Notched action button. Defaults to `type="button"`. */
export function Button({ variant, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClassName(variant, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant };

/** Internal navigation styled as a notched button. */
export function ButtonLink({ variant, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClassName(variant, className)} {...props} />;
}

type ExternalButtonLinkProps = ComponentProps<"a"> & { variant?: ButtonVariant };

/** Link to another site (for example Discord) styled as a notched button. */
export function ExternalButtonLink({ variant, className, ...props }: ExternalButtonLinkProps) {
  return <a rel="noopener noreferrer" className={buttonClassName(variant, className)} {...props} />;
}

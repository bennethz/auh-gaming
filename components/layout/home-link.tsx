import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

/** Logo and wordmark linking to the home page. The wordmark hides under 420px. */
export function HomeLink() {
  return (
    <Link
      href="/"
      className="flex items-center gap-4 text-auh-yellow focus-visible:outline-3 focus-visible:outline-auh-orange"
      data-testid="home-link"
    >
      <BrandLogo size="mark" />
      <span className="pt-1 font-display text-[28px] leading-none max-[419px]:sr-only">AUH Gaming</span>
    </Link>
  );
}

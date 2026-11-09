import Image from "next/image";
import { cn } from "@/lib/cn";

interface BrandLogoProps {
  /** "hero" is the large logo on yellow; "mark" is the small logo in the header and footer. */
  size: "hero" | "mark" | "footer";
  className?: string;
}

/** Intrinsic dimensions of public/auh-logo-transparent.png. */
const LOGO_WIDTH = 190;
const LOGO_HEIGHT = 341;

const SIZE_CLASS_NAMES: Record<BrandLogoProps["size"], string> = {
  // Capped at the source's native 190px width; going wider upscales and blurs it.
  hero: "h-auto w-[140px] sm:w-[190px]",
  mark: "h-10 w-auto",
  footer: "h-14 w-auto",
};

/**
 * AUH Gaming logo. The hero size is preloaded (LCP candidate) and carries alt text;
 * the header and footer marks are decorative because they sit next to the brand name.
 */
export function BrandLogo({ size, className }: BrandLogoProps) {
  const isHero = size === "hero";

  return (
    <Image
      src="/auh-logo-transparent.png"
      alt={isHero ? "AUH Gaming logo" : ""}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      preload={isHero}
      // Serve the PNG as-is: the optimizer's lossy re-encode (quality 75) visibly degrades flat-colour artwork.
      unoptimized
      className={cn(
        SIZE_CLASS_NAMES[size],
        isHero && "animate-drop",
        className,
      )}
      data-testid={`brand-logo-${size}`}
    />
  );
}

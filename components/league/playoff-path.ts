import type { TagTone } from "@/components/ui/tag";
import type { PlayoffPath } from "@/lib/league/types";

interface PathStyle {
  tagTone: TagTone;
  /** Swatch color in the legend. */
  swatchClassName: string;
  rowClassName: string;
  rankClassName: string;
}

/** Visual treatment for each playoff path in the leaderboard. */
export const PLAYOFF_PATH_STYLES: Record<PlayoffPath, PathStyle> = {
  Advanced: {
    tagTone: "ink",
    swatchClassName: "bg-auh-ink",
    rowClassName: "bg-auh-yellow/[.16]",
    rankClassName: "text-auh-yellow",
  },
  Upper: {
    tagTone: "yellow",
    swatchClassName: "bg-auh-yellow",
    rowClassName: "bg-auh-yellow/[.08]",
    rankClassName: "text-auh-yellow",
  },
  Lower: {
    tagTone: "orange",
    swatchClassName: "bg-auh-orange",
    rowClassName: "",
    rankClassName: "text-auh-cream",
  },
};

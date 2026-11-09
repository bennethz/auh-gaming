import Link from "next/link";
import { Tag } from "@/components/ui/tag";
import { HomeLink } from "./home-link";

/** Sticky header for organizer tools. Replaces the public nav with a link back to the public league. */
export function OrganizerHeader() {
  return (
    <header className="sticky top-0 z-10 bg-auh-ink text-auh-yellow" data-testid="organizer-header">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-x-5 gap-y-2 px-5 py-2.5">
        <HomeLink />
        <Tag tone="orange">Organizer</Tag>
        <Link
          href="/league"
          className="ml-auto px-3 py-2 font-display text-[22px] text-auh-cream hover:bg-auh-ink-soft hover:text-auh-yellow focus-visible:outline-3 focus-visible:outline-auh-orange"
          data-testid="view-public-league-link"
        >
          View public league
        </Link>
      </div>
    </header>
  );
}

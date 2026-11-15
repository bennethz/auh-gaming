import Link from "next/link";
import { BracketMatchCard } from "@/components/league/playoff-brackets";
import type { UpcomingPlayoffGroup } from "@/lib/league/playoffs";

interface UpcomingPlayoffGamesProps {
  /** Ready-to-play matches, grouped by bracket. */
  groups: UpcomingPlayoffGroup[];
}

/**
 * The next playoff games on the home page, grouped into upper bracket, lower bracket and grand final.
 * Only matches with both teams known and no result yet are shown; the full bracket lives on the league page.
 */
export function UpcomingPlayoffGames({ groups }: UpcomingPlayoffGamesProps) {
  if (groups.length === 0) return null;

  return (
    <div className="mb-10" data-testid="upcoming-playoff-games">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 id="upcoming-playoff-games-title" className="font-display text-4xl leading-none font-semibold">
          Upcoming playoff games
        </h3>
        <Link href="/league" className="text-[15px] font-semibold underline" data-testid="upcoming-playoffs-bracket-link">
          See the full bracket
        </Link>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {groups.map((group) => (
          <section key={group.name} aria-label={group.name} data-testid="upcoming-playoff-group">
            <h4 className="mb-3 border-b-3 border-auh-ink pb-1 font-display text-2xl leading-none">{group.name}</h4>
            <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
              {group.matches.map((match) => (
                <li key={match.id}>
                  <p className="mb-1 flex justify-between text-xs font-semibold text-auh-olive">
                    <span>{match.roundName}</span>
                    <span>{match.bestOf}</span>
                  </p>
                  <BracketMatchCard match={match} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { SeedNumber } from "@/components/league/seed-number";
import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/cn";
import { formatCalendarDate } from "@/lib/format-date";
import type { ResolvedSlot } from "@/lib/league/playoffs";
import type { FeaturedMatch } from "@/lib/league/season-snapshot";
import type { StandingRow, Team } from "@/lib/league/types";
import { MatchCountdown } from "./match-countdown";

/**
 * Stand-in for a team logo: the first letter of the team's codename on a notched block.
 * TODO: Swap for team logos once they're supplied.
 */
export function TeamMonogram({
  team,
  tone = "yellow",
  className,
}: {
  team: Team;
  /** Yellow block for dark backgrounds, navy block for light ones. */
  tone?: "yellow" | "ink";
  className?: string;
}) {
  const codename = team.name.replace(/^Team\s+/i, "");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "notch inline-flex shrink-0 items-center justify-center pt-[0.12em] font-display leading-none font-bold",
        tone === "yellow" ? "bg-auh-yellow text-auh-ink" : "bg-auh-ink text-auh-yellow",
        className,
      )}
    >
      {codename.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Small uppercase label above a block, such as "Next up".
 * @param className - Spacing below; defaults to `mb-3`.
 */
export function Eyebrow({ children, className = "mb-3" }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-auh-orange uppercase", className)}>
      <span aria-hidden="true" className="inline-block h-[3px] w-6 bg-auh-orange" />
      {children}
    </p>
  );
}

/** One side of the versus card: monogram, team name and seed. */
function VersusSide({ slot }: { slot: ResolvedSlot }) {
  if (!slot.team) return <p className="text-center text-auh-cream-dim">{slot.placeholder}</p>;
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <TeamMonogram team={slot.team} className="size-16 text-[44px] sm:size-24 sm:text-[68px]" />
      <p className="max-w-full font-display text-[clamp(34px,4.4vw,56px)] leading-[0.9] font-semibold text-auh-cream">
        {slot.team.name}
      </p>
      {slot.seed !== undefined ? (
        <p className="text-xs font-semibold text-auh-cream-dim">Seed #{slot.seed}</p>
      ) : null}
    </div>
  );
}

/** The next playoff match as a large "team vs team" card with its date and a countdown. */
export function VersusCard({ featured }: { featured: FeaturedMatch }) {
  const { bracketName, match } = featured;
  const teamNames = `${match.slotA.team?.name ?? match.slotA.placeholder} versus ${match.slotB.team?.name ?? match.slotB.placeholder}`;

  return (
    <article aria-label={`Next match: ${teamNames}`} className="notch bg-auh-ink-soft" data-testid="featured-match">
      <p className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-auh-orange px-5 pt-2.5 pb-2 font-display text-xl leading-none text-auh-ink sm:px-7">
        <span>
          {bracketName} · {match.roundName}
        </span>
        <span>
          {match.bestOf} · {match.id}
        </span>
      </p>

      <div className="grid grid-cols-1 items-center gap-6 px-5 py-8 sm:grid-cols-[1fr_auto_1fr] sm:px-7 sm:py-10">
        <VersusSide slot={match.slotA} />
        <p
          aria-hidden="true"
          className="-skew-x-6 text-center font-display text-[clamp(64px,10vw,132px)] leading-[0.8] font-bold text-auh-yellow"
        >
          VS
        </p>
        <VersusSide slot={match.slotB} />
      </div>

      <p className="flex flex-wrap items-center justify-center gap-3 border-t border-auh-ink px-5 py-4 text-[15px] text-auh-cream">
        {match.matchDate ? (
          <>
            <time dateTime={match.matchDate} className="font-semibold">
              {formatCalendarDate(match.matchDate)}
            </time>
            <MatchCountdown
              matchDate={match.matchDate}
              className="bg-auh-yellow px-2 pt-[5px] pb-0.5 font-display text-xl leading-none text-auh-ink"
            />
          </>
        ) : (
          <span className="text-auh-cream-dim">Date to be set</span>
        )}
      </p>
    </article>
  );
}

/** Team row inside a match tile. */
function TileSlot({ slot }: { slot: ResolvedSlot }) {
  return (
    <p className="flex items-baseline gap-1.5 px-3.5 py-2">
      {slot.team ? (
        <>
          <SeedNumber seed={slot.seed} />
          <span className="truncate font-semibold">{slot.team.name}</span>
        </>
      ) : (
        <span className="text-auh-cream-dim">{slot.placeholder}</span>
      )}
    </p>
  );
}

/** The rest of the ready-to-play playoff matches, as a carousel of tiles. */
export function LaterMatches({ matches }: { matches: FeaturedMatch[] }) {
  if (matches.length === 0) return null;

  return (
    <div className="mt-10" data-testid="later-matches">
      <Carousel label="Other upcoming playoff matches" header={<Eyebrow className="">Also coming up</Eyebrow>}>
        {matches.map(({ bracketName, match }) => (
          <li
            key={match.id}
            className="notch w-[250px] shrink-0 snap-start bg-auh-ink-soft text-sm text-auh-cream"
            data-testid={`later-match-${match.id}`}
          >
            <p className="flex justify-between gap-2 px-3.5 pt-3 pb-1 text-xs font-semibold text-auh-cream-dim">
              <span className="truncate">
                {bracketName} · {match.roundName}
              </span>
              <span>{match.bestOf}</span>
            </p>
            <TileSlot slot={match.slotA} />
            <TileSlot slot={match.slotB} />
            <p className="flex justify-between bg-auh-ink px-3.5 pt-[5px] pb-[7px] text-xs text-auh-cream-dim">
              <span className="font-semibold text-auh-yellow">{match.id}</span>
              <span>{match.matchDate ? formatCalendarDate(match.matchDate) : "Date to be set"}</span>
            </p>
          </li>
        ))}
      </Carousel>
      <Link
        href="/league"
        className="mt-4 inline-block text-[15px] font-semibold text-auh-yellow hover:underline"
        data-testid="upcoming-playoffs-bracket-link"
      >
        See the full bracket →
      </Link>
    </div>
  );
}

/** Per-place styling: block colour, height on wider screens and position (2nd, 1st, 3rd from the left). */
const PODIUM_PLACES = [
  { block: "bg-auh-yellow text-auh-ink", height: "sm:min-h-[270px]", order: "sm:order-2" },
  { block: "bg-auh-cream text-auh-ink", height: "sm:min-h-[225px]", order: "sm:order-1" },
  { block: "bg-auh-orange text-auh-ink", height: "sm:min-h-[190px]", order: "sm:order-3" },
] as const;

/** The top three teams of the group stage on a podium, with points and record. */
export function Podium({ rows }: { rows: StandingRow[] }) {
  const top = rows.slice(0, 3);
  if (top.length === 0) return null;

  return (
    <ol className="grid gap-3 sm:grid-cols-3 sm:items-end" aria-label="Top three teams" data-testid="podium">
      {top.map((row, index) => {
        const place = PODIUM_PLACES[index];
        return (
          <li
            key={row.team.id}
            className={cn(
              "notch flex flex-col justify-between gap-6 p-5 transition-transform duration-200 ease-out hover:-translate-y-1.5 sm:p-6",
              place.block,
              place.height,
              place.order,
            )}
            data-testid="podium-place"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="font-display text-[clamp(64px,8vw,104px)] leading-[0.75] font-bold">
                <span className="sr-only">Rank </span>
                {row.rank}
              </span>
              <TeamMonogram team={row.team} tone="ink" className="size-12 text-[34px]" />
            </div>
            <div>
              <p className="font-display text-[clamp(30px,3vw,40px)] leading-[0.9] font-semibold">{row.team.name}</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3 text-sm font-semibold">
                <span>
                  <span className="font-display text-2xl leading-none tabular-nums">{row.points}</span> pts
                  {row.deduction ? "*" : ""}
                </span>
                <span className="opacity-70">
                  {row.wins}W · {row.draws}D · {row.losses}L
                </span>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Shown once the grand final has a winner. */
export function ChampionCard({ team, seasonLabel }: { team: Team; seasonLabel: string }) {
  return (
    <div className="notch flex flex-col items-center gap-5 bg-auh-yellow px-6 py-10 text-center text-auh-ink" data-testid="champion">
      <TeamMonogram team={team} tone="ink" className="size-24 text-[68px]" />
      <div>
        <p className="text-xs font-semibold tracking-[0.18em] uppercase">{seasonLabel} champions</p>
        <p className="mt-2 font-display text-[clamp(48px,7vw,96px)] leading-[0.85] font-bold">{team.name}</p>
      </div>
    </div>
  );
}

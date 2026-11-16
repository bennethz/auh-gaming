import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import { formatCalendarDate } from "@/lib/format-date";
import type { ResolvedBracket, ResolvedMatch, ResolvedSlot, SlotSide } from "@/lib/league/playoffs";
import { CaptainName } from "./captain-name";
import { SeedNumber } from "./seed-number";

interface PlayoffBracketsProps {
  /** Brackets with teams filled in from the frozen seeds and entered scores. */
  brackets: ResolvedBracket[];
  /** Sentence describing who goes to which bracket. */
  formatSummary: string;
  /** Whether the organizers have generated the playoffs (seeds are set). */
  isGenerated: boolean;
}

/** Double elimination brackets, one horizontally scrolling row of rounds per bracket. */
export function PlayoffBrackets({ brackets, formatSummary, isGenerated }: PlayoffBracketsProps) {
  return (
    <section aria-labelledby="playoffs-title" className="pt-10 pb-6" data-testid="playoff-brackets">
      <SectionHeading
        id="playoffs-title"
        title="Playoffs bracket"
        description={`Double elimination. ${formatSummary} ${
          isGenerated
            ? "Seeds (#) are the group stage rankings when the playoffs started."
            : "Teams fill in when the playoffs start."
        }`}
      />
      <div className="flex flex-col gap-9">
        {brackets.map((bracket) => (
          <div key={bracket.name} data-testid="bracket">
            <h3 className="mb-3 font-display text-4xl leading-none font-semibold">{bracket.name}</h3>
            {/* Brackets scroll inside their own wrapper so the page never scrolls sideways. */}
            <div className="overflow-x-auto pb-1.5" tabIndex={0} aria-label={`${bracket.name} rounds`} role="region">
              <ol className="flex w-max gap-6">
                {bracket.rounds.map((round) => (
                  <li key={round.name} className="flex w-[230px] flex-col gap-2.5">
                    <div className="flex items-baseline justify-between border-b-3 border-auh-ink pb-1">
                      <h4 className="font-display text-2xl leading-none">{round.name}</h4>
                      <span className="text-xs font-semibold text-auh-olive">{round.bestOf}</span>
                    </div>
                    <ul className="flex flex-1 flex-col justify-around gap-3">
                      {round.matches.map((match) => (
                        <li key={match.id}>
                          <BracketMatchCard match={match} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** One playoff match: both slots with scores, plus the match id and date. */
export function BracketMatchCard({ match }: { match: ResolvedMatch }) {
  return (
    <div className="notch bg-auh-ink text-sm text-auh-cream" data-testid={`bracket-match-${match.id}`}>
      <SlotRow slot={match.slotA} score={match.scoreA} side="A" winnerSide={match.winnerSide} />
      <SlotRow slot={match.slotB} score={match.scoreB} side="B" winnerSide={match.winnerSide} />
      <p className="flex justify-between bg-auh-ink-soft px-3.5 pt-[5px] pb-[7px] text-xs text-auh-cream-dim">
        <span className="font-semibold text-auh-yellow">{match.id}</span>
        <span>{match.matchDate ? formatCalendarDate(match.matchDate) : "Date to be set"}</span>
      </p>
    </div>
  );
}

function SlotRow({
  slot,
  score,
  side,
  winnerSide,
}: {
  slot: ResolvedSlot;
  score?: number;
  side: SlotSide;
  winnerSide?: SlotSide;
}) {
  const isWinner = winnerSide === side;
  const isLoser = winnerSide !== undefined && !isWinner;

  return (
    <p
      className={cn(
        "flex items-center gap-2 px-3.5 py-[9px]",
        side === "A" && "border-b border-auh-ink-soft",
        isLoser && "opacity-55",
      )}
    >
      {slot.team ? (
        <span className="flex min-w-0 flex-1 items-center gap-1.5">
          <SeedNumber seed={slot.seed} />
          <span className="flex min-w-0 flex-col">
            <span className={cn("truncate font-semibold", isWinner && "text-auh-yellow")}>{slot.team.name}</span>
            <CaptainName name={slot.team.captain} />
          </span>
        </span>
      ) : (
        <span className="min-w-0 flex-1 text-auh-cream-dim">{slot.placeholder}</span>
      )}
      <span className={cn("font-display text-xl leading-none tabular-nums", isWinner && "text-auh-yellow")}>
        {score ?? ""}
      </span>
    </p>
  );
}

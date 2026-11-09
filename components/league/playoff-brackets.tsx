import { SectionHeading } from "@/components/ui/section-heading";
import type { Bracket, BracketMatch } from "@/lib/league/types";

interface PlayoffBracketsProps {
  brackets: Bracket[];
  /** Sentence describing who goes to which bracket. */
  formatSummary: string;
}

/** Double elimination brackets, one horizontally scrolling row of rounds per bracket. */
export function PlayoffBrackets({ brackets, formatSummary }: PlayoffBracketsProps) {
  return (
    <section aria-labelledby="playoffs-title" className="pt-10 pb-6" data-testid="playoff-brackets">
      <SectionHeading
        id="playoffs-title"
        title="Playoffs bracket"
        description={`Double elimination. ${formatSummary} Teams fill in when the group stage ends.`}
      />
      <div className="flex flex-col gap-9">
        {brackets.map((bracket) => (
          <div key={bracket.name} data-testid="bracket">
            <h3 className="mb-3 font-display text-4xl leading-none font-semibold">{bracket.name}</h3>
            {/* Brackets scroll inside their own wrapper so the page never scrolls sideways. */}
            <div className="overflow-x-auto pb-1.5" tabIndex={0} aria-label={`${bracket.name} rounds`} role="region">
              <ol className="flex w-max gap-6">
                {bracket.rounds.map((round) => (
                  <li key={round.name} className="flex w-[210px] flex-col gap-2.5">
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

function BracketMatchCard({ match }: { match: BracketMatch }) {
  return (
    <div className="notch bg-auh-ink text-sm text-auh-cream" data-testid={`bracket-match-${match.id}`}>
      <p className="border-b border-auh-ink-soft px-3.5 py-[9px]">{match.slotA}</p>
      <p className="px-3.5 py-[9px]">{match.slotB}</p>
      <p className="flex justify-between bg-auh-ink-soft px-3.5 pt-[5px] pb-[7px] text-xs text-auh-cream-dim">
        <span className="font-semibold text-auh-yellow">{match.id}</span>
        <span>Date to be set</span>
      </p>
    </div>
  );
}

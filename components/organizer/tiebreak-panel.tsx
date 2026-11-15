"use client";

import { cn } from "@/lib/cn";
import { getTiedGroups } from "@/lib/league/standings";
import type { StandingRow } from "@/lib/league/types";

const MOVE_BUTTON =
  "inline-flex size-9 cursor-pointer items-center justify-center text-lg font-bold text-auh-yellow hover:bg-auh-ink-soft focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-auh-orange disabled:cursor-default disabled:text-auh-cream-dim disabled:opacity-40 disabled:hover:bg-transparent";

interface TiebreakPanelProps {
  /** Current standings, sorted by rank. */
  rows: StandingRow[];
  /** Swaps a team with the tied team directly above or below it. */
  onSwap: (teamId: string, neighbourId: string) => void;
}

/**
 * Lists each group of teams level on points, in standings order, with buttons to move a team
 * up or down within its tie. Points always decide first, so teams can't be moved past a team on different points.
 */
export function TiebreakPanel({ rows, onSwap }: TiebreakPanelProps) {
  const groups = getTiedGroups(rows);

  return (
    <div className="notch mt-6 bg-auh-ink p-5 text-auh-cream" data-testid="tiebreak-panel">
      <h3 className="font-display text-[28px] leading-[0.9] font-semibold">Tied teams</h3>
      <p className="mt-1.5 text-[13px] text-auh-cream-dim">
        Teams level on points. Use the arrows to set their order in the standings and playoff seeding.
      </p>

      {groups.length === 0 ? (
        <p className="mt-4 text-[15px]" data-testid="tiebreak-empty">
          No teams are tied on points.
        </p>
      ) : (
        <div className="mt-4 grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((group) => (
            <section
              key={group[0].rank}
              aria-label={`Tied on ${group[0].points} points, ranks ${group[0].rank} to ${group.at(-1)?.rank}`}
              className="border border-auh-ink-soft"
              data-testid="tiebreak-group"
            >
              <p className="border-b border-auh-ink-soft px-3 py-2 text-xs font-semibold text-auh-cream-dim">
                {group[0].points} pts · ranks {group[0].rank} to {group.at(-1)?.rank}
              </p>
              <ol>
                {group.map((row, index) => {
                  const above = group[index - 1];
                  const below = group[index + 1];
                  return (
                    <li
                      key={row.team.id}
                      className={cn("flex items-center gap-2.5 pl-3", index > 0 && "border-t border-auh-ink-soft")}
                      data-testid={`tiebreak-row-${row.team.id}`}
                    >
                      <span className="w-6 shrink-0 text-right font-display text-lg leading-none text-auh-cream-dim">
                        {row.rank}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-semibold">{row.team.name}</span>
                      <button
                        type="button"
                        className={MOVE_BUTTON}
                        disabled={!above}
                        onClick={() => above && onSwap(row.team.id, above.team.id)}
                        aria-label={`Move ${row.team.name} up`}
                        title="Move up"
                        data-testid={`tiebreak-up-${row.team.id}`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className={MOVE_BUTTON}
                        disabled={!below}
                        onClick={() => below && onSwap(row.team.id, below.team.id)}
                        aria-label={`Move ${row.team.name} down`}
                        title="Move down"
                        data-testid={`tiebreak-down-${row.team.id}`}
                      >
                        ↓
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { FORMAT_RULES } from "@/lib/league/standings";
import type { PlayoffFormat, StandingRow } from "@/lib/league/types";
import { PLAYOFF_PATH_STYLES } from "./playoff-path";

const HEADER_CELL = "border-b border-auh-ink-soft px-[18px] py-3.5 text-left text-xs font-semibold text-auh-cream-dim";
const BODY_CELL = "border-b border-auh-ink-soft px-[18px] py-2.5 text-[15px]";
const NUMBER_CELL = "text-right tabular-nums";
/** Low-priority columns hidden on small screens so the table fits without sideways scrolling. */
const OPTIONAL_COLUMN = "hidden sm:table-cell";

/** Legend explaining which ranks go to which playoff bracket. */
export function PlayoffLegend({ format, className }: { format: PlayoffFormat; className?: string }) {
  return (
    <ul
      className={cn("flex flex-wrap gap-x-3 gap-y-2 text-[13px] font-semibold", className)}
      aria-label="Playoff paths"
    >
      {FORMAT_RULES[format].legend.map((entry) => (
        <li key={entry.path} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={cn("inline-block size-3 border-2 border-auh-ink", PLAYOFF_PATH_STYLES[entry.path].swatchClassName)}
          />
          {entry.label}
        </li>
      ))}
    </ul>
  );
}

interface StandingsTableProps {
  rows: StandingRow[];
  /** Show the playoff path column and its row highlighting. Defaults to true. */
  showPlayoffs?: boolean;
  /** Test id for each row, so the same table can appear on different pages. */
  rowTestId?: string;
}

/** Full group stage table on a navy card: rank, team, record, points and (optionally) playoff path. */
export function StandingsTable({ rows, showPlayoffs = true, rowTestId = "leaderboard-row" }: StandingsTableProps) {
  return (
    <div className="notch overflow-x-auto bg-auh-ink text-auh-cream">
      <table className="w-full border-collapse">
        <caption className="sr-only">Group stage standings, ranked by points</caption>
        <thead>
          <tr>
            <th scope="col" className={HEADER_CELL}>
              <abbr title="Rank" className="no-underline">#</abbr>
            </th>
            <th scope="col" className={HEADER_CELL}>Team</th>
            <th scope="col" className={cn(HEADER_CELL, OPTIONAL_COLUMN)}>Captain</th>
            <th scope="col" className={cn(HEADER_CELL, NUMBER_CELL, OPTIONAL_COLUMN)}>
              Series
            </th>
            <th scope="col" className={cn(HEADER_CELL, NUMBER_CELL)}>
              <abbr title="Wins" className="no-underline">W</abbr>
            </th>
            <th scope="col" className={cn(HEADER_CELL, NUMBER_CELL, OPTIONAL_COLUMN)}>
              <abbr title="Draws" className="no-underline">D</abbr>
            </th>
            <th scope="col" className={cn(HEADER_CELL, NUMBER_CELL, OPTIONAL_COLUMN)}>
              <abbr title="Losses" className="no-underline">L</abbr>
            </th>
            <th scope="col" className={cn(HEADER_CELL, NUMBER_CELL)}>
              <abbr title="Points" className="no-underline">Pts</abbr>
            </th>
            {showPlayoffs ? (
              <th scope="col" className={HEADER_CELL}>
                Playoffs
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pathStyle = PLAYOFF_PATH_STYLES[row.path];
            return (
              <tr key={row.team.id} className={showPlayoffs ? pathStyle.rowClassName : undefined} data-testid={rowTestId}>
                <td
                  className={cn(
                    BODY_CELL,
                    "font-display text-[30px] leading-none",
                    showPlayoffs ? pathStyle.rankClassName : "text-auh-yellow",
                  )}
                >
                  {row.rank}
                </td>
                <th scope="row" className={cn(BODY_CELL, "text-left font-semibold")}>
                  {row.team.name}
                </th>
                <td className={cn(BODY_CELL, OPTIONAL_COLUMN, "text-auh-cream-dim")}>{row.team.captain}</td>
                <td className={cn(BODY_CELL, NUMBER_CELL, OPTIONAL_COLUMN)}>{row.played}</td>
                <td className={cn(BODY_CELL, NUMBER_CELL)}>{row.wins}</td>
                <td className={cn(BODY_CELL, NUMBER_CELL, OPTIONAL_COLUMN)}>{row.draws}</td>
                <td className={cn(BODY_CELL, NUMBER_CELL, OPTIONAL_COLUMN)}>{row.losses}</td>
                <td className={cn(BODY_CELL, NUMBER_CELL, "font-bold text-auh-yellow")}>{row.points}</td>
                {showPlayoffs ? (
                  <td className={BODY_CELL}>
                    <Tag tone={pathStyle.tagTone}>{row.path}</Tag>
                  </td>
                ) : null}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

import { SectionHeading } from "@/components/ui/section-heading";
import type { PlayoffFormat, StandingRow } from "@/lib/league/types";
import { PlayoffLegend, StandingsTable } from "./standings-table";

interface LeaderboardTableProps {
  rows: StandingRow[];
  format: PlayoffFormat;
}

/** Group stage standings with each team's playoff path. */
export function LeaderboardTable({ rows, format }: LeaderboardTableProps) {
  return (
    <section aria-labelledby="leaderboard-title" className="pt-10 pb-6" data-testid="leaderboard">
      <SectionHeading
        id="leaderboard-title"
        title="Group stage leaderboard"
        aside={<PlayoffLegend format={format} />}
      />
      <StandingsTable rows={rows} />
    </section>
  );
}

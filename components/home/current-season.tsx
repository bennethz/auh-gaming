import Link from "next/link";
import { PlayoffLegend, StandingsTable } from "@/components/league/standings-table";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/tag";
import { formatLongDate } from "@/lib/format-date";
import { getLeagueData, getStandingsAsOf } from "@/lib/league/data";
import { buildGroupRecords } from "@/lib/league/group-stage";
import { DISCORD_INVITE_URL, SEASON } from "@/lib/league/sample-data";
import { buildStandings } from "@/lib/league/standings";

/**
 * Current Civil War season: the full group stage table as of the last played match, with each
 * team's playoff path and a link to the league page for the bracket.
 */
export async function CurrentSeason() {
  const leagueData = await getLeagueData();
  const { teams, groupResults, deductions } = leagueData;
  const standings = buildStandings(buildGroupRecords(teams, groupResults), teams, SEASON.playoffFormat, deductions);
  const asOf = getStandingsAsOf(leagueData);

  return (
    <section aria-labelledby="current-season-title" data-testid="current-season">
      <Container className="pt-[72px] pb-6">
        <SectionHeading
          id="current-season-title"
          title={`${SEASON.leagueName} Season ${SEASON.number}`}
          description={`${SEASON.teamCount} teams battling it out in our community ${SEASON.game} league.`}
          aside={<Badge data-testid="season-status-badge">Group stage live</Badge>}
        />

        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="text-[15px] font-semibold" data-testid="standings-as-of">
            Group stage standings
            {asOf ? (
              <>
                {" "}
                as of <time dateTime={asOf}>{formatLongDate(asOf)}</time>
              </>
            ) : null}
          </p>
          <PlayoffLegend format={SEASON.playoffFormat} />
        </div>

        <StandingsTable rows={standings} showSeriesOnMobile rowTestId="home-standings-row" />

        <p className="mt-4 text-[15px]">
          <Link href="/league" className="font-semibold underline" data-testid="season-league-link">
            See the full {SEASON.leagueName} league and playoff bracket
          </Link>
        </p>

        <p className="mt-2 text-[15px]">
          Want to play next season? Sign up and get drafted into a team.{" "}
          <a
            href={DISCORD_INVITE_URL}
            rel="noopener noreferrer"
            className="font-semibold underline"
            data-testid="season-discord-link"
          >
            Join the Discord
          </a>
          .
        </p>
      </Container>
    </section>
  );
}

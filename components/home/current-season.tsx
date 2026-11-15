import Link from "next/link";
import { UpcomingPlayoffGames } from "@/components/home/upcoming-playoff-games";
import { PlayoffLegend, StandingsTable } from "@/components/league/standings-table";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge, Tag } from "@/components/ui/tag";
import { formatLongDate } from "@/lib/format-date";
import { buildPlayoffBrackets } from "@/lib/league/bracket";
import { getLeagueData, getStandingsAsOf } from "@/lib/league/data";
import { buildGroupRecords } from "@/lib/league/group-stage";
import { getSeededTeams, getUpcomingPlayoffMatches, resolvePlayoffs } from "@/lib/league/playoffs";
import { DISCORD_INVITE_URL, SEASON } from "@/lib/league/sample-data";
import { buildStandings } from "@/lib/league/standings";

/**
 * Current Civil War season: the next playoff games once the playoffs start, then the group stage
 * table (as of the last played match, or marked completed once the playoffs start), with each team's
 * playoff path and a link to the league page.
 */
export async function CurrentSeason() {
  const leagueData = await getLeagueData();
  const { teams, groupResults, deductions, tiebreakOrder, playoffEntries, playoffSeeds } = leagueData;
  const standings = buildStandings(buildGroupRecords(teams, groupResults), teams, SEASON.playoffFormat, deductions, tiebreakOrder);
  const asOf = getStandingsAsOf(leagueData);
  // Generating the playoffs freezes the seeds, which ends the group stage.
  const isPlayoffsLive = playoffSeeds.length > 0;
  const upcomingPlayoffGroups = isPlayoffsLive
    ? getUpcomingPlayoffMatches(
        resolvePlayoffs(buildPlayoffBrackets(SEASON.playoffFormat), getSeededTeams(playoffSeeds, teams), playoffEntries),
      )
    : [];

  return (
    <section aria-labelledby="current-season-title" data-testid="current-season">
      <Container className="pt-[72px] pb-6">
        <SectionHeading
          id="current-season-title"
          title={`${SEASON.leagueName} Season ${SEASON.number}`}
          description={`${SEASON.teamCount} teams battling it out in our community ${SEASON.game} league.`}
          aside={
            <Badge data-testid="season-status-badge">
              {isPlayoffsLive ? "Playoffs live" : "Group stage live"}
            </Badge>
          }
        />

        <UpcomingPlayoffGames groups={upcomingPlayoffGroups} />

        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          {isPlayoffsLive ? (
            <p className="flex items-center gap-2 text-[15px] font-semibold" data-testid="group-stage-completed">
              Final group stage standings
              <Tag tone="muted" data-testid="group-stage-completed-tag">
                Completed
              </Tag>
            </p>
          ) : (
            <p className="text-[15px] font-semibold" data-testid="standings-as-of">
              Group stage standings
              {asOf ? (
                <>
                  {" "}
                  as of <time dateTime={asOf}>{formatLongDate(asOf)}</time>
                </>
              ) : null}
            </p>
          )}
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

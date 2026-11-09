import { StandingsTable } from "@/components/league/standings-table";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/tag";
import { formatLongDate } from "@/lib/format-date";
import { DISCORD_INVITE_URL, getStandingsAsOf, GROUP_RECORDS, SEASON, TEAMS } from "@/lib/league/sample-data";
import { buildStandings } from "@/lib/league/standings";

/** Current Civil War season: the full group stage table as of the last played match. */
export function CurrentSeason() {
  const standings = buildStandings(GROUP_RECORDS, TEAMS, SEASON.playoffFormat);
  const asOf = getStandingsAsOf();

  return (
    <section aria-labelledby="current-season-title" data-testid="current-season">
      <Container className="pt-[72px] pb-6">
        <SectionHeading
          id="current-season-title"
          title={`${SEASON.leagueName} Season ${SEASON.number}`}
          description={`${SEASON.teamCount} teams battling it out in our community ${SEASON.game} league.`}
          aside={<Badge data-testid="season-status-badge">Group stage live</Badge>}
        />

        <p className="mb-3 text-[15px] font-semibold" data-testid="standings-as-of">
          Group stage standings
          {asOf ? (
            <>
              {" "}as of <time dateTime={asOf}>{formatLongDate(asOf)}</time>
            </>
          ) : null}
        </p>

        <StandingsTable rows={standings} showPlayoffs={false} rowTestId="home-standings-row" />

        <p className="mt-4 text-[15px]">
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
